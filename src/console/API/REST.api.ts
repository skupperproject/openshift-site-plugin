import { EMPTY_VALUE_SYMBOL } from '@config/config';
import { AccessGrantCrdResponse, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdParams, AccessTokenCrdResponse } from '@interfaces/CRD_AccessToken';
import {
  CrdStatusCondition,
  ListCrdResponse,
  PartialDeploymentResponse,
  StatusAccessGrantType,
  StatusAccessTokenType,
  StatusConnectorType,
  StatusLinkType,
  StatusListenerType,
  StatusSiteType,
  StatusType
} from '@interfaces/CRD_Base';
import { ConnectorCrdResponse, ConnectorParams } from '@interfaces/CRD_Connector';
import { LinkCrdResponse } from '@interfaces/CRD_Link';
import { ListenerCrdParams, ListenerCrdResponse } from '@interfaces/CRD_Listener';
import { NetworkSite, SiteCrdParams, SiteCrdResponse } from '@interfaces/CRD_Site';

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
  connectorPath
} from './REST.paths';
import { Connector, Listener, Link, SiteView, AccessGrant, StatusAlert } from '../interfaces/REST.interfaces';

export const RESTApi = {
  isOldVersionSkupper: async (): Promise<boolean> => {
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

  findSiteView: async (): Promise<SiteView | null> => {
    const sites = await RESTApi.getSites();

    if (!sites.items.length) {
      return null;
    }

    return convertSiteCRsToSite(sites.items[0]);
  },

  getSites: async (): Promise<ListCrdResponse<SiteCrdResponse>> =>
    axiosFetch<ListCrdResponse<SiteCrdResponse>>(sitesPath()),

  createOrUpdateSite: async (data: SiteCrdParams, name?: string): Promise<SiteCrdResponse> => {
    const path = name ? `${sitePath(name)}` : sitesPath();
    const method = name ? 'PUT' : 'POST';

    const response = await axiosFetch<SiteCrdResponse>(path, {
      method,
      data
    });

    return response;
  },

  deleteSite: async (name: string): Promise<void> => {
    await axiosFetch<SiteCrdResponse>(sitePath(name), {
      method: 'DELETE'
    });

    await Promise.all([
      axiosFetch<SiteCrdResponse>(accessGrantsPath(), {
        method: 'DELETE'
      }),
      axiosFetch<SiteCrdResponse>(accessTokensPath(), {
        method: 'DELETE'
      }),
      axiosFetch<SiteCrdResponse>(listenersPath(), {
        method: 'DELETE'
      }),
      axiosFetch<SiteCrdResponse>(connectorsPath(), {
        method: 'DELETE'
      })
    ]);
  },

  getGrants: async (): Promise<ListCrdResponse<AccessGrantCrdResponse>> =>
    axiosFetch<ListCrdResponse<AccessGrantCrdResponse>>(accessGrantsPath()),

  getAccessGrantsView: async (): Promise<AccessGrant[] | null> => {
    const [accessGrants, sites] = await Promise.all([RESTApi.getGrants(), RESTApi.getSites()]);

    if (!accessGrants.items.length && !sites.items[0]) {
      return null;
    }

    return convertAccessGrantCRsToAccessGrant(accessGrants.items);
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

  getAccessToken: async (): Promise<ListCrdResponse<AccessTokenCrdResponse>> =>
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

    await axiosFetch<void>(accessTokenPath(name), {
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

    return convertListenerCRsToListeners(sites.items[0], listeners.items);
  },

  findListener: async (name: string): Promise<ListenerCrdResponse> =>
    axiosFetch<ListenerCrdResponse>(listenerPath(name)),

  createOrUpdateListener: async (data?: ListenerCrdParams, name?: string): Promise<void> => {
    const path = name ? `${listenerPath(name)}` : listenersPath();
    const method = name ? 'PUT' : 'POST';

    await axiosFetch<ListenerCrdResponse>(path, {
      method,
      data
    });
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

    return convertConnectorCRsToConnectors(sites.items[0], connectors.items);
  },

  findConnector: async (name: string): Promise<ConnectorCrdResponse> =>
    axiosFetch<ConnectorCrdResponse>(connectorPath(name)),

  createOrUpdateConnector: async (data?: ConnectorParams, name?: string): Promise<void> => {
    const path = name ? `${connectorPath(name)}` : connectorsPath();
    const method = name ? 'PUT' : 'POST';

    await axiosFetch<ConnectorCrdResponse>(path, {
      method,
      data
    });
  },

  deleteConnector: async (name: string): Promise<void> => {
    await axiosFetch<void>(connectorPath(name), {
      method: 'DELETE'
    });
  }
};

// utils

function convertSiteCRsToSite({ metadata, spec, status }: SiteCrdResponse): SiteView {
  const statusAlertSiteMap: Record<StatusSiteType | 'Error', StatusAlert> = {
    Configured: 'custom',
    Running: 'success',
    Ready: undefined,
    Resolved: undefined,
    Error: 'danger'
  };

  const lastStatus = getLastStatusTrueByTime(status?.conditions);
  const hasError = lastStatus?.reason === 'Error';
  const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

  const calculatedStatusAlert =
    (lastStatus?.type && statusAlertSiteMap[lastStatus.type]) || (hasError && statusAlertSiteMap.Error) || undefined;

  return {
    identity: metadata.uid,
    name: metadata.name,
    linkAccess: spec?.linkAccess || '',
    serviceAccount: spec?.serviceAccount || '',
    ha: spec?.ha || false,
    resourceVersion: metadata.resourceVersion,
    creationTimestamp: metadata.creationTimestamp,
    linkCount: getOtherSiteNetworksWithLinks(status?.network, metadata.uid).length || 0,
    isConfigured: hasType(status?.conditions, 'Configured'),
    isReady: hasType(status?.conditions, 'Ready'),
    hasError,
    status: calculatedStatus,
    platform: findSiteNetwork(status?.network, metadata.uid)?.platform || EMPTY_VALUE_SYMBOL,
    sitesInNetwork: status?.sitesInNetwork || 0,
    statusAlert: calculatedStatusAlert
  };
}

function convertAccessGrantCRsToAccessGrant(accessGrants: AccessGrantCrdResponse[]): AccessGrant[] {
  const statusAlertAccessGrantMap: Record<StatusAccessGrantType | 'Error', StatusAlert> = {
    Processed: 'success',
    Ready: 'success',
    Resolved: 'success',
    Error: 'danger'
  };

  return accessGrants.map((accessGrant) => {
    const { metadata, spec, status } = accessGrant;

    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

    const calculatedStatusAlert =
      (lastStatus?.type && statusAlertAccessGrantMap[lastStatus.type]) ||
      (hasError && statusAlertAccessGrantMap.Error) ||
      undefined;

    return {
      id: metadata?.uid,
      name: metadata?.name,
      creationTimestamp: metadata?.creationTimestamp,
      data: accessGrant,
      hasError,
      status: calculatedStatus,
      redemptionsAllowed: spec?.redemptionsAllowed || 0,
      redeemed: status?.redeemed || 0,
      expirationWindow: status?.expiration,
      statusAlert: calculatedStatusAlert
    };
  });
}

function convertLinkCRsToLinks(links: LinkCrdResponse[]): Link[] {
  const statusAlertLinkMap: Record<StatusLinkType | 'Error', StatusAlert> = {
    Configured: 'custom',
    Ready: 'success',
    Operational: 'success',
    Error: 'danger'
  };

  return links.map(({ metadata, spec, status }) => {
    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

    const calculatedStatusAlert =
      (lastStatus?.type && statusAlertLinkMap[lastStatus.type]) || (hasError && statusAlertLinkMap.Error) || undefined;

    return {
      id: metadata.uid,
      name: metadata.name,
      creationTimestamp: metadata.creationTimestamp,
      // TODO: The cost needs to be enabled in Skupper v2
      cost: spec.cost || EMPTY_VALUE_SYMBOL,
      hasError,
      status: calculatedStatus,
      connectedTo: status?.remoteSiteName || EMPTY_VALUE_SYMBOL,
      statusAlert: calculatedStatusAlert
    };
  });
}

export function convertAccessTokensToLinks(links: AccessTokenCrdResponse[]): Link[] {
  return links.map(({ metadata, status }) => {
    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

    return {
      id: metadata.uid,
      name: metadata.name,
      creationTimestamp: metadata.creationTimestamp,
      cost: EMPTY_VALUE_SYMBOL,
      hasError,
      status: calculatedStatus,
      connectedTo: EMPTY_VALUE_SYMBOL
    };
  });
}

function convertListenerCRsToListeners(site: SiteCrdResponse, listeners: ListenerCrdResponse[]): Listener[] {
  const statusAlertListenerMap: Record<StatusListenerType | 'Error', StatusAlert> = {
    Configured: 'custom',
    Matched: 'success',
    Ready: 'success',
    Error: 'danger'
  };

  return listeners.map(({ metadata, spec, status }) => {
    const connected = findServices(site, spec.routingKey, 'connectors');
    const ready = isReady(site, metadata.name, spec.routingKey, 'listeners');

    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

    const calculatedStatusAlert =
      (lastStatus?.type && statusAlertListenerMap[lastStatus.type]) ||
      (hasError && statusAlertListenerMap.Error) ||
      undefined;

    return {
      id: metadata.uid,
      name: metadata.name,
      creationTimestamp: metadata.creationTimestamp,
      routingKey: spec.routingKey,
      serviceName: spec.host,
      port: spec.port,
      type: spec.type,
      connected: (ready && connected?.length) || 0,
      hasError,
      status: calculatedStatus,
      statusAlert: calculatedStatusAlert
    };
  });
}

function convertConnectorCRsToConnectors(site: SiteCrdResponse, connectors: ConnectorCrdResponse[]): Connector[] {
  const statusAlertConnectorMap: Record<StatusConnectorType | 'Error', StatusAlert> = {
    Configured: 'custom',
    Matched: 'success',
    Ready: 'success',
    Error: 'danger'
  };

  return connectors.map(({ metadata, spec, status }) => {
    const connected = findServices(site, spec.routingKey, 'listeners');
    const ready = isReady(site, metadata.name, spec.routingKey, 'listeners');

    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

    const calculatedStatusAlert =
      (lastStatus?.type && statusAlertConnectorMap[lastStatus.type]) ||
      (hasError && statusAlertConnectorMap.Error) ||
      undefined;

    return {
      id: metadata.uid,
      name: metadata.name,
      creationTimestamp: metadata.creationTimestamp,
      routingKey: spec.routingKey,
      selector: spec.selector,
      host: spec.host,
      port: spec.port,
      type: spec.type,
      connected: (ready && connected?.length) || 0,
      hasError,
      status: calculatedStatus,
      statusAlert: calculatedStatusAlert
    };
  });
}

function findServices(
  site: SiteCrdResponse,
  routingKey: string,
  type: 'listeners' | 'connectors'
): string[] | undefined {
  return site.status?.network
    ?.filter(({ name, services }) => name !== site.metadata.namespace && services)
    .flatMap((network) => network?.services)
    .filter((service) => service?.routingKey === routingKey && service[type]?.length)
    .flatMap((service) => service![type]) as string[];
}

function isReady(site: SiteCrdResponse, name: string, routingKey: string, type: 'listeners' | 'connectors'): boolean {
  return !!site.status?.network
    ?.filter((data) => data.name !== site.metadata.namespace && data.services)
    .flatMap((network) => network?.services)
    .filter((service) => service && service.routingKey === routingKey && service[type]?.includes(name)).length;
}

export function getType<T>(conditions: CrdStatusCondition<T>[] = [], type: StatusSiteType | StatusAccessTokenType) {
  return !!conditions?.some((condition) => condition.type === type && condition.status === 'True');
}

export function hasType<T>(conditions: CrdStatusCondition<T>[] = [], type: StatusSiteType | StatusAccessTokenType) {
  return !!conditions?.some((condition) => condition.type === type && condition.status === 'True');
}

export function hasReasonError<T>(conditions: CrdStatusCondition<T>[] = []) {
  return !!conditions?.some((condition) => condition.reason === 'Error' && condition.status === 'True');
}

function getLastStatusTrueByTime<T>(conditions: CrdStatusCondition<T>[] = []) {
  const priorityMap: Record<StatusType, number> = {
    Configured: 1,
    Resolved: 0,
    Running: 3,
    Processed: 3,
    Operational: 3,
    Matched: 3,
    Ready: 0,
    Redeemed: 1
  };

  const trueConditions = conditions.filter((condition) => condition.status === 'True');

  // Sort the filtered conditions by lastTransitionTime in descending order
  trueConditions.sort((a, b) => {
    const dateA = new Date(a.lastTransitionTime);
    const dateB = new Date(b.lastTransitionTime);

    const value = Number(dateB) - Number(dateA);

    if (value === 0) {
      return priorityMap[b.type as StatusType] - priorityMap[a.type as StatusType];
    }

    return value;
  });

  // Return the first condition in the sorted array (the most recent one)
  return trueConditions.length > 0 ? trueConditions[0] : null;
}

export function getOtherSiteNetworksWithLinks(network: NetworkSite[] = [], siteId: string) {
  return network?.filter(({ id, links }) => id !== siteId && links?.some((link) => link.remoteSiteId === siteId));
}

export function findSiteNetwork(network: NetworkSite[] = [], siteId: string) {
  return network?.find(({ id }) => id === siteId);
}
