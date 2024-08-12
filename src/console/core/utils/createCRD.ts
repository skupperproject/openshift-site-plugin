import { AccessGrantCrdParams, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdParams, AccessTokenParams } from '@interfaces/CRD_AccessToken';
import { ConnectorCrdParams, ConnectorParams } from '@interfaces/CRD_Connector';
import { ListenerCrdParams, ListenerParams } from '@interfaces/CRD_Listener';
import { SiteCrdParams, SiteParams } from '@interfaces/CRD_Site';

const apiVersion = 'skupper.io/v1alpha1';

export const createSiteData = (props: SiteParams): SiteCrdParams => ({
  apiVersion,
  kind: 'Site',
  ...props
});

export const createAccessGrantRequest = (props: AccessGrantParams): AccessGrantCrdParams => ({
  apiVersion,
  kind: 'AccessGrant',
  ...props
});

export const createAccessTokenRequest = (props: AccessTokenParams): AccessTokenCrdParams => ({
  apiVersion,
  kind: 'AccessToken',
  ...props
});

export const createListenerRequest = (props: ListenerParams): ListenerCrdParams => ({
  apiVersion,
  kind: 'Listener',
  ...props
});

export const createConnectorRequest = (props: ConnectorParams): ConnectorCrdParams => ({
  apiVersion,
  kind: 'Connector',
  ...props
});
