import { AccessGrantCrdResponse, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdParams, AccessTokenCrdResponse } from '@interfaces/CRD_AccessToken';
import { ListCrdResponse, PartialDeploymentResponse } from '@interfaces/CRD_Base';
import { ConnectorCrdResponse, ConnectorParams } from '@interfaces/CRD_Connector';
import { LinkCrdResponse } from '@interfaces/CRD_Link';
import { ListenerCrdParams, ListenerCrdResponse } from '@interfaces/CRD_Listener';
import { SiteCrdParams, SiteCrdResponse } from '@interfaces/CRD_Site';

import { axiosFetch } from './apiMiddleware';
import {
  deploymentPath,
  sitePath,
  sitesPath,
  accessGrantPath,
  accessGrantsPath,
  linksPath,
  accessTokensPath,
  accessTokenPath,
  linkPath,
  listenerPath,
  listenersPath,
  connectorsPath,
  connectorPath,
  certificatePath,
  rolePath,
  roleBindPath,
  deploymentsPath,
  servicePath,
  serviceAccountPath,
  configMapPath,
  routePath
} from './REST.paths';
import {
  convertAccessGrantCRsToAccessGrants,
  convertConnectorCRsToConnectors,
  convertLinkCRsToLinks,
  convertListenerCRsToListeners,
  convertSiteCRToSite,
  getOtherSiteNetworksWithLinks
} from './REST.utils';
import { Connector, Listener, Link, SiteView, AccessGrant } from '../interfaces/REST.interfaces';

import roleData from '../deployment/Role.json';
import roleBindingData from '../deployment/RoleBinding.json';
import certificateData from '../deployment/Certificate.json';
import serviceData from '../deployment/Service.json';
import servicePromData from '../deployment/Service-Prom.json';
import serviceAccountData from '../deployment/ServiceAccount.json';
import deploymentData from '../deployment/Deployment.json';
import deploymentPromData from '../deployment/Deployment-Prom.json';
import configMapData from '../deployment/ConfigMap.json';
import configMapPromData from '../deployment/ConfigMap-Prom.json';
import RouteData from '../deployment/Route.json';

export const RESTApi = {
  isOldVersion: async (): Promise<boolean> => {
    const [skupperInstance, sites] = await Promise.all([
      axiosFetch<PartialDeploymentResponse>(deploymentPath('skupper-router')),
      RESTApi.getSites()
    ]);

    const skupperProgresses = skupperInstance.status.conditions;

    if (skupperProgresses && skupperProgresses[0].status === 'True' && !sites.items.length) {
      return true;
    }

    return false;
  },

  getSites: async (): Promise<ListCrdResponse<SiteCrdResponse>> =>
    axiosFetch<ListCrdResponse<SiteCrdResponse>>(sitesPath()),

  findSite: async (): Promise<SiteCrdResponse | null> => {
    const sites = await RESTApi.getSites();

    if (!sites.items.length) {
      return null;
    }

    return sites.items[0];
  },

  findSiteView: async (): Promise<SiteView | null> => {
    const sites = await RESTApi.getSites();

    if (!sites.items.length) {
      return null;
    }

    return convertSiteCRToSite(sites.items[0]);
  },

  createOrUpdateSite: async (data: SiteCrdParams, name?: string): Promise<SiteCrdResponse> => {
    const path = name ? `${sitePath(name)}` : sitesPath();
    const method = name ? 'PUT' : 'POST';

    const response = await axiosFetch<SiteCrdResponse>(path, {
      method,
      data
    });

    return response;
  },

  deleteSite: async (name: string, removeAllResources: boolean): Promise<void> => {
    await axiosFetch<SiteCrdResponse>(sitePath(name), {
      method: 'DELETE'
    });

    RESTApi.deleteDeployment();

    if (removeAllResources) {
      await Promise.all([
        axiosFetch(accessGrantsPath(), {
          method: 'DELETE'
        }),
        axiosFetch(accessTokensPath(), {
          method: 'DELETE'
        }),
        axiosFetch(linksPath(), {
          method: 'DELETE'
        }),
        axiosFetch(listenersPath(), {
          method: 'DELETE'
        }),
        axiosFetch(connectorsPath(), {
          method: 'DELETE'
        })
      ]);
    }
  },

  getGrants: async (): Promise<ListCrdResponse<AccessGrantCrdResponse>> =>
    axiosFetch<ListCrdResponse<AccessGrantCrdResponse>>(accessGrantsPath()),

  getAccessGrantsView: async (): Promise<AccessGrant[] | null> => {
    const [accessGrants, sites] = await Promise.all([RESTApi.getGrants(), RESTApi.getSites()]);

    if (!accessGrants.items.length && !sites.items[0]) {
      return null;
    }

    return convertAccessGrantCRsToAccessGrants(accessGrants.items);
  },

  findGrant: async (name: string): Promise<AccessGrantCrdResponse> =>
    axiosFetch<AccessGrantCrdResponse>(accessGrantPath(name)),

  createGrant: async (data?: AccessGrantParams): Promise<AccessGrantCrdResponse> =>
    axiosFetch<AccessGrantCrdResponse>(accessGrantsPath(), {
      method: 'POST',
      data
    }),

  deleteGrant: async (name: string): Promise<void> => {
    await axiosFetch<AccessGrantCrdResponse>(accessGrantPath(name), {
      method: 'DELETE'
    });
  },

  getAccessTokens: async (): Promise<ListCrdResponse<AccessTokenCrdResponse>> =>
    axiosFetch<ListCrdResponse<AccessTokenCrdResponse>>(accessTokensPath()),

  findAccessToken: async (name: string): Promise<AccessTokenCrdResponse> =>
    axiosFetch<AccessTokenCrdResponse>(accessTokenPath(name)),

  createAccessToken: async (data?: AccessTokenCrdParams): Promise<void> =>
    axiosFetch<void>(accessTokensPath(), {
      method: 'POST',
      data
    }),

  deleteAccessToken: async (name: string): Promise<void> => {
    await axiosFetch<AccessTokenCrdResponse>(accessTokenPath(name), {
      method: 'DELETE'
    });
  },

  getLinks: async (): Promise<ListCrdResponse<LinkCrdResponse>> =>
    axiosFetch<ListCrdResponse<LinkCrdResponse>>(linksPath()),

  findLink: async (name: string): Promise<LinkCrdResponse> => {
    const data = await RESTApi.getLinks();

    let item = data.items.find((link) => link.metadata.name === name);

    if (!item) {
      // HA case where i create 2 links with suffix 1 and 2
      item =
        data.items.find((link) => link.metadata.name === `${name}-1`) &&
        data.items.find((link) => link.metadata.name === `${name}-2`);
    }

    return item || ({} as LinkCrdResponse);
  },

  getLinksView: async (): Promise<Link[] | null> => {
    const [links, sites] = await Promise.all([RESTApi.getLinks(), RESTApi.getSites()]);

    if (!links.items.length && !sites.items[0]) {
      return null;
    }

    return convertLinkCRsToLinks(links.items);
  },

  getRemoteLinks: async (id: string): Promise<string[] | null> => {
    const sites = await RESTApi.getSites();

    if (!sites.items[0]?.status?.network) {
      return null;
    }

    return getOtherSiteNetworksWithLinks(sites.items[0]?.status?.network, id).flatMap(({ name }) => name);
  },

  deleteLink: async (name: string): Promise<void> => {
    await axiosFetch<void>(linkPath(name), {
      method: 'DELETE'
    });
  },

  getListeners: async (): Promise<ListCrdResponse<ListenerCrdResponse>> =>
    axiosFetch<ListCrdResponse<ListenerCrdResponse>>(listenersPath()),

  getListenersView: async (): Promise<Listener[] | null> => {
    const [listeners, sites] = await Promise.all([RESTApi.getListeners(), RESTApi.getSites()]);

    if (!listeners.items.length && !sites.items[0]) {
      return null;
    }

    return convertListenerCRsToListeners(listeners.items);
  },

  findListener: async (name: string): Promise<ListenerCrdResponse> =>
    axiosFetch<ListenerCrdResponse>(listenerPath(name)),

  createOrUpdateListener: async (data?: ListenerCrdParams, name?: string): Promise<'Updated' | 'Created'> => {
    const path = name ? `${listenerPath(name)}` : listenersPath();
    const method = name ? 'PUT' : 'POST';

    await axiosFetch<ListenerCrdResponse>(path, {
      method,
      data
    });

    return method === 'PUT' ? 'Updated' : 'Created';
  },

  deleteListener: async (name: string): Promise<void> => {
    await axiosFetch<void>(listenerPath(name), {
      method: 'DELETE'
    });
  },

  getConnectors: async (): Promise<ListCrdResponse<ConnectorCrdResponse>> =>
    axiosFetch<ListCrdResponse<ConnectorCrdResponse>>(connectorsPath()),

  getConnectorsView: async (): Promise<Connector[] | null> => {
    const [connectors, sites] = await Promise.all([RESTApi.getConnectors(), RESTApi.getSites()]);

    if (!connectors.items.length && !sites.items[0]) {
      return null;
    }

    return convertConnectorCRsToConnectors(connectors.items);
  },

  findConnector: async (name: string): Promise<ConnectorCrdResponse> =>
    axiosFetch<ConnectorCrdResponse>(connectorPath(name)),

  createOrUpdateConnector: async (data?: ConnectorParams, name?: string): Promise<'Updated' | 'Created'> => {
    const path = name ? `${connectorPath(name)}` : connectorsPath();
    const method = name ? 'PUT' : 'POST';

    await axiosFetch<ConnectorCrdResponse>(path, {
      method,
      data
    });

    return method === 'PUT' ? 'Updated' : 'Created';
  },

  deleteConnector: async (name: string): Promise<void> => {
    await axiosFetch<void>(connectorPath(name), {
      method: 'DELETE'
    });
  },
  createDeployment: async (): Promise<void> => {
    const requests = [
      { path: rolePath(), data: roleData },
      { path: roleBindPath(), data: roleBindingData },
      { path: certificatePath(), data: certificateData },
      { path: deploymentsPath(), data: deploymentData },
      { path: deploymentsPath(), data: deploymentPromData },
      { path: servicePath(), data: serviceData },
      { path: servicePath(), data: servicePromData },
      { path: serviceAccountPath(), data: serviceAccountData },
      { path: configMapPath(), data: configMapData },
      { path: configMapPath(), data: configMapPromData },
      { path: routePath(), data: RouteData }
    ];

    const promises = requests.map(({ path, data }) =>
      axiosFetch(path, {
        method: 'POST',
        data: data
      }).catch((error) => {
        if (error.response && error.response.status === 409) {
          console.warn(`Ignored 409 Conflict error for ${path}`);
          return null; // Return null for ignored requests
        }
        throw error; // Rethrow other errors
      })
    );

    await Promise.all(promises);
  },

  deleteDeployment: async (): Promise<void> => {
    const requests = [
      { path: `${routePath()}/${RouteData.metadata.name}` },
      { path: `${rolePath()}/${roleData.metadata.name}` },
      { path: `${roleBindPath()}/${roleBindingData.metadata.name}` },
      { path: `${certificatePath()}/${certificateData.metadata.name}` },
      { path: `${deploymentsPath()}/${deploymentData.metadata.name}` },
      { path: `${deploymentsPath()}/${deploymentPromData.metadata.name}` },
      { path: `${servicePath()}/${serviceData.metadata.name}` },
      { path: `${servicePath()}/${servicePromData.metadata.name}` },
      { path: `${serviceAccountPath()}/${serviceAccountData.metadata.name}` },
      { path: `${configMapPath()}/${configMapData.metadata.name}` },
      { path: `${configMapPath()}/${configMapPromData.metadata.name}` }
    ];

    const promises = requests.map(({ path }) =>
      axiosFetch(path, {
        method: 'DELETE'
      }).catch((error) => {
        if (error.response && error.response.status === 409) {
          console.warn(`Ignored 409 Conflict error for ${path}`);
          return null; // Return null for ignored requests
        }
        throw error; // Rethrow other errors
      })
    );

    await Promise.all(promises);
  }
};

