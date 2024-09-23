import { EMPTY_VALUE_SYMBOL } from '@config/config';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdResponse } from '@interfaces/CRD_AccessToken';
import {
  StatusSiteType,
  CrdStatusCondition,
  StatusAccessGrantType,
  StatusAccessTokenType,
  StatusConnectorType,
  StatusLinkType,
  StatusListenerType,
  StatusType
} from '@interfaces/CRD_Base';
import { ConnectorCrdResponse } from '@interfaces/CRD_Connector';
import { LinkCrdResponse } from '@interfaces/CRD_Link';
import { ListenerCrdResponse } from '@interfaces/CRD_Listener';
import { NetworkSite, SiteCrdResponse } from '@interfaces/CRD_Site';
import { StatusAlert, Connector, Listener, Link, SiteView, AccessGrant } from '@interfaces/REST.interfaces';

export function convertSiteCRsToSites({ metadata, spec, status }: SiteCrdResponse): SiteView {
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
    (hasError && statusAlertSiteMap.Error) || (lastStatus?.type && statusAlertSiteMap[lastStatus.type]) || undefined;

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

export function convertAccessGrantCRsToAccessGrants(accessGrants: AccessGrantCrdResponse[]): AccessGrant[] {
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
      (hasError && statusAlertAccessGrantMap.Error) ||
      (lastStatus?.type && statusAlertAccessGrantMap[lastStatus.type]) ||
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

export function convertLinkCRsToLinks(links: LinkCrdResponse[]): Link[] {
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
      (hasError && statusAlertLinkMap.Error) || (lastStatus?.type && statusAlertLinkMap[lastStatus.type]) || undefined;

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
  const statusAlertAccessTokenMap: Record<StatusAccessTokenType | 'Error', StatusAlert> = {
    Redeemed: 'success',
    Error: 'danger'
  };

  return links.map(({ metadata, status }) => {
    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;
    const calculatedStatusAlert =
      (hasError && statusAlertAccessTokenMap.Error) ||
      (lastStatus?.type && statusAlertAccessTokenMap[lastStatus.type]) ||
      undefined;

    return {
      id: metadata.uid,
      name: metadata.name,
      creationTimestamp: metadata.creationTimestamp,
      cost: EMPTY_VALUE_SYMBOL,
      hasError,
      status: calculatedStatus,
      connectedTo: EMPTY_VALUE_SYMBOL,
      statusAlert: calculatedStatusAlert
    };
  });
}

export function convertListenerCRsToListeners(_: SiteCrdResponse, listeners: ListenerCrdResponse[]): Listener[] {
  const statusAlertListenerMap: Record<StatusListenerType | 'Error', StatusAlert> = {
    Configured: 'custom',
    Matched: 'success',
    Ready: 'success',
    Error: 'danger'
  };

  return listeners.map(({ metadata, spec, status }) => {
    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

    const calculatedStatusAlert =
      (hasError && statusAlertListenerMap.Error) ||
      (lastStatus?.type && statusAlertListenerMap[lastStatus.type]) ||
      undefined;

    return {
      id: metadata.uid,
      name: metadata.name,
      creationTimestamp: metadata.creationTimestamp,
      routingKey: spec.routingKey,
      serviceName: spec.host,
      port: spec.port,
      type: spec.type,
      connected: status?.matchingConnectorCount || 0,
      hasError,
      status: calculatedStatus,
      statusAlert: calculatedStatusAlert
    };
  });
}

export function convertConnectorCRsToConnectors(_: SiteCrdResponse, connectors: ConnectorCrdResponse[]): Connector[] {
  const statusAlertConnectorMap: Record<StatusConnectorType | 'Error', StatusAlert> = {
    Configured: 'custom',
    Matched: 'success',
    Ready: 'success',
    Error: 'danger'
  };

  return connectors.map(({ metadata, spec, status }) => {
    const lastStatus = getLastStatusTrueByTime(status?.conditions);
    const hasError = lastStatus?.reason === 'Error';
    const calculatedStatus = hasError ? lastStatus.message : lastStatus?.type;

    const calculatedStatusAlert =
      (hasError && statusAlertConnectorMap.Error) ||
      (lastStatus?.type && statusAlertConnectorMap[lastStatus.type]) ||
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
      connected: status?.matchingListenerCount || 0,
      hasError,
      status: calculatedStatus,
      statusAlert: calculatedStatusAlert
    };
  });
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

  let trueConditions = conditions.filter(
    (condition) => condition.status === 'True' && condition.type !== 'Ready' && condition.type !== 'Resolved'
  );

  if (!trueConditions.length) {
    trueConditions = conditions.filter((condition) => condition.status === 'False' && condition.reason === 'Error');
  }

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
