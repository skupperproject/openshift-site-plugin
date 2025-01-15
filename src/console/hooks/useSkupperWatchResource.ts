import {
  convertAccessGrantCRToAccessGrant,
  convertAccessTokenCRToLink,
  convertConnectorCRToConnector,
  convertLinkCRToLink,
  convertListenerCRToListener,
  convertSiteCRToSite
} from '@API/REST.utils';
import { API_VERSION, GROUP } from '@config/config';
import { getSkupperNamespace } from '@config/db';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdResponse } from '@interfaces/CRD_AccessToken';
import { ConnectorCrdResponse } from '@interfaces/CRD_Connector';
import { LinkCrdResponse } from '@interfaces/CRD_Link';
import { ListenerCrdResponse } from '@interfaces/CRD_Listener';
import { SiteCrdResponse } from '@interfaces/CRD_Site';
import { AccessGrant, Connector, Listener, SiteView, Link } from '@interfaces/REST.interfaces';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

// Define Kinds
type Kinds = 'Site' | 'AccessGrant' | 'AccessToken' | 'Link' | 'Listener' | 'Connector';

// Map Kinds to corresponding return types
type KindToResourceMap = {
  Site: SiteView;
  AccessGrant: AccessGrant;
  AccessToken: Link;
  Link: Link;
  Listener: Listener;
  Connector: Connector;
};

interface KindToCrdResponseMap {
  Site: SiteCrdResponse;
  AccessGrant: AccessGrantCrdResponse;
  AccessToken: AccessTokenCrdResponse;
  Link: LinkCrdResponse;
  Listener: ListenerCrdResponse;
  Connector: ConnectorCrdResponse;
}

interface useWatchedSkupperResourceProps<T extends Kinds> {
  kind: T;
  name?: string;
  isList?: boolean;
}

// Define the conversion map with properly typed functions
const conversionMap: {
  [K in Kinds]: (resource: KindToCrdResponseMap[K]) => KindToResourceMap[K];
} = {
  Site: convertSiteCRToSite,
  AccessGrant: convertAccessGrantCRToAccessGrant,
  AccessToken: convertAccessTokenCRToLink,
  Link: convertLinkCRToLink,
  Listener: convertListenerCRToListener,
  Connector: convertConnectorCRToConnector
};

// Update the hook to be type-safe
export const useWatchedSkupperResource = <T extends Kinds>({
  kind,
  name = '',
  isList = true
}: useWatchedSkupperResourceProps<T>) => {
  const groupVersionKind = {
    group: GROUP,
    version: API_VERSION,
    kind
  };

  const watchResource = {
    groupVersionKind,
    namespace: getSkupperNamespace(),
    name,
    isList
  };

  const [data, loaded, error] = useK8sWatchResource(watchResource) as [
    KindToCrdResponseMap[T][] & KindToCrdResponseMap[T],
    boolean,
    string
  ];

  if (error) {
    return { data: null, loaded, error };
  }

  if (!loaded || !data) {
    return { data: null, loaded, error };
  }

  if (!isList && !data.kind?.endsWith('List')) {
    return { data: [conversionMap[kind](data)], loaded, error };
  }

  return { data: data.map(conversionMap[kind]), loaded, error };
};
