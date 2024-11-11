import { EMPTY_VALUE_SYMBOL, priorityStatusMap } from '@config/config';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdResponse } from '@interfaces/CRD_AccessToken';
import { CrdStatusCondition, StatusType, ReasonStatus } from '@interfaces/CRD_Base';
import { ConnectorCrdResponse } from '@interfaces/CRD_Connector';
import { LinkCrdResponse } from '@interfaces/CRD_Link';
import { ListenerCrdResponse } from '@interfaces/CRD_Listener';
import { NetworkSite, SiteCrdResponse } from '@interfaces/CRD_Site';
import { StatusAlert, Connector, Listener, Link, SiteView, AccessGrant } from '@interfaces/REST.interfaces';

const statusAlertMap: Record<ReasonStatus, StatusAlert> = {
  Error: 'danger',
  Ready: 'success',
  Configured: 'custom',
  Pending: 'custom'
};

export function convertSiteCRToSite(site: SiteCrdResponse): SiteView {
  const { metadata, spec, status } = site;

  const calculatedStatusAlert =
    (status?.status === 'Error' && statusAlertMap.Error) ||
    (status?.status && statusAlertMap[status?.status]) ||
    undefined;

  return {
    identity: metadata.uid,
    name: metadata.name,
    linkAccess: spec?.linkAccess || '',
    serviceAccount: spec?.serviceAccount || '',
    defaultIssuer: spec?.defaultIssuer || '',
    ha: spec?.ha || false,
    resourceVersion: metadata.resourceVersion,
    creationTimestamp: metadata.creationTimestamp,
    linkCount: getOtherSiteNetworksWithLinks(status?.network, metadata.uid).length || 0,
    remoteLinks: getOtherSiteNetworksWithLinks(status?.network, metadata.uid).flatMap(({ name }) => name),
    platform: findSiteNetwork(status?.network, metadata.uid)?.platform || EMPTY_VALUE_SYMBOL,
    sitesInNetwork: status?.sitesInNetwork || 0,
    isConfigured: hasType(status?.conditions, 'Configured'),
    isReady: hasType(status?.conditions, 'Ready'),
    status: status?.status,
    statusMessage: getErrorMessage(status?.status, status?.message) || '',
    statusAlert: calculatedStatusAlert,
    hasError: status?.status === 'Error',
    hasSecondaryErrors: hasErrors(status?.conditions),
    conditions: status?.conditions,
    rawData: site
  };
}

export function convertAccessGrantCRToAccessGrant(accessGrant: AccessGrantCrdResponse): AccessGrant {
  const { metadata, spec, status } = accessGrant;

  const lastStatus = calculateStatus(status?.conditions);
  const hasError = lastStatus?.reason === 'Error';

  const calculatedStatusAlert =
    (status?.status === 'Error' && statusAlertMap.Error) ||
    (status?.status && statusAlertMap[status?.status]) ||
    undefined;

  return {
    id: metadata?.uid,
    name: metadata?.name,
    creationTimestamp: metadata?.creationTimestamp,
    hasError,
    status: status?.status,
    statusMessage: getErrorMessage(status?.status, status?.message) || '',
    redemptionsAllowed: spec?.redemptionsAllowed || 0,
    redeemed: status?.redeemed || 0,
    expirationWindow: status?.expiration,
    statusAlert: calculatedStatusAlert,
    rawData: accessGrant
  };
}
export function convertAccessGrantCRsToAccessGrants(accessGrants: AccessGrantCrdResponse[]): AccessGrant[] {
  return accessGrants.map(convertAccessGrantCRToAccessGrant);
}

export function convertLinkCRToLink(link: LinkCrdResponse): Link {
  const { metadata, spec, status } = link;
  const hasError = status?.status === 'Error';

  const calculatedStatusAlert =
    (status?.status === 'Error' && statusAlertMap.Error) ||
    (status?.status && statusAlertMap[status?.status]) ||
    undefined;

  return {
    id: metadata.uid,
    name: metadata.name,
    creationTimestamp: metadata.creationTimestamp,
    cost: spec.cost || EMPTY_VALUE_SYMBOL, // Assuming `spec.cost` is optional
    hasError,
    status: status?.status,
    statusMessage: getErrorMessage(status?.status, status?.message) || '',
    connectedTo: status?.remoteSiteName || EMPTY_VALUE_SYMBOL,
    statusAlert: calculatedStatusAlert,
    rawData: link
  };
}

export function convertLinkCRsToLinks(links: LinkCrdResponse[]): Link[] {
  return links.map(convertLinkCRToLink);
}

export function convertAccessTokenCRToLink(accessToken: AccessTokenCrdResponse): Link {
  const { metadata, status } = accessToken;

  const lastStatus = calculateStatus(status?.conditions);
  const hasError = lastStatus?.reason === 'Error';

  const calculatedStatusAlert =
    (hasError && statusAlertMap.Error) || (status?.status && statusAlertMap[status?.status]) || undefined;

  return {
    id: metadata.uid,
    name: metadata.name,
    creationTimestamp: metadata.creationTimestamp,
    cost: EMPTY_VALUE_SYMBOL, // Assuming this is a constant value, can be defined globally
    hasError,
    status: status?.status,
    statusMessage: getErrorMessage(status?.status, status?.message) || '',
    connectedTo: EMPTY_VALUE_SYMBOL, // Same assumption as above
    statusAlert: calculatedStatusAlert,
    rawData: accessToken
  };
}

export function convertListenerCRToListener(listener: ListenerCrdResponse): Listener {
  const { metadata, spec, status } = listener;

  const lastStatus = calculateStatus(status?.conditions);
  const hasError = lastStatus?.reason === 'Error';

  const calculatedStatusAlert =
    (hasError && statusAlertMap.Error) || (lastStatus?.type && statusAlertMap[lastStatus.type]) || undefined;

  return {
    id: metadata.uid,
    name: metadata.name,
    creationTimestamp: metadata.creationTimestamp,
    routingKey: spec.routingKey,
    serviceName: spec.host,
    port: spec.port,
    connected: status?.matchingConnectorCount || 0,
    hasError,
    status: status?.status,
    statusMessage: getErrorMessage(status?.status, status?.message) || '',
    statusAlert: calculatedStatusAlert,
    resourceVersion: metadata.resourceVersion,
    rawData: listener
  };
}

export function convertListenerCRsToListeners(listeners: ListenerCrdResponse[]): Listener[] {
  return listeners.map(convertListenerCRToListener);
}

export function convertConnectorCRToConnector(connector: ConnectorCrdResponse): Connector {
  const { metadata, spec, status } = connector;

  const lastStatus = calculateStatus(status?.conditions);
  const hasError = lastStatus?.reason === 'Error';

  const calculatedStatusAlert =
    (hasError && statusAlertMap.Error) || (lastStatus?.type && statusAlertMap[lastStatus.type]) || undefined;

  return {
    id: metadata.uid,
    name: metadata.name,
    creationTimestamp: metadata.creationTimestamp,
    routingKey: spec.routingKey,
    selector: spec.selector,
    host: spec.host,
    port: spec.port,
    connected: status?.matchingListenerCount || 0,
    hasError,
    status: status?.status,
    statusMessage: getErrorMessage(status?.status, status?.message) || '',
    statusAlert: calculatedStatusAlert,
    resourceVersion: metadata.resourceVersion,
    rawData: connector
  };
}

export function convertConnectorCRsToConnectors(connectors: ConnectorCrdResponse[]): Connector[] {
  return connectors.map(convertConnectorCRToConnector);
}

function hasType<T>(conditions: CrdStatusCondition<T>[] = [], type: ReasonStatus) {
  return !!conditions?.some((condition) => condition.type === type && condition.status === 'True');
}

function hasErrors<T>(conditions: CrdStatusCondition<T>[] = []) {
  return !!conditions?.some((condition) => condition.reason === 'Error');
}

/**
 * This function calculates and returns the highest priority status condition
 * from a list of CRD status conditions, excluding those marked as 'Resolved'.
 * It prioritizes conditions with status 'True'. If no such condition exists,
 * it checks for conditions with status 'False' and reason 'Error', sorting by a priority map.
 *
 * @param conditions - An array of CRD status conditions (optional).
 * @returns The highest priority status condition or null if no relevant condition is found.
 */
function calculateStatus<T>(conditions: CrdStatusCondition<T>[] = []) {
  // Filter out conditions where the type is 'Resolved' since we don't want to consider them
  const filteredConditions = conditions.filter(
    (condition) => condition.type !== 'Running' && condition.type !== 'Resolved'
  );

  let statusConditions = filteredConditions
    .filter((condition) => condition.status === 'True')
    .sort((a, b) => priorityStatusMap[b.type as StatusType] - priorityStatusMap[a.type as StatusType]);

  if (!statusConditions.length) {
    statusConditions = filteredConditions
      .filter((condition) => condition.status === 'False' && condition.reason === 'Error')
      .sort((a, b) => priorityStatusMap[a.type as StatusType] - priorityStatusMap[b.type as StatusType]);
  }

  // Return the highest priority condition if one is found, otherwise return null.
  return statusConditions.length > 0 ? statusConditions[0] : null;
}

export function getOtherSiteNetworksWithLinks(network: NetworkSite[] = [], siteId: string) {
  return network?.filter(({ id, links }) => id !== siteId && links?.some((link) => link.remoteSiteId === siteId));
}

function findSiteNetwork(network: NetworkSite[] = [], siteId: string) {
  return network?.find(({ id }) => id === siteId);
}

function getErrorMessage(status: ReasonStatus | undefined, message: string | undefined) {
  return status === 'Error' ? message : EMPTY_VALUE_SYMBOL;
}
