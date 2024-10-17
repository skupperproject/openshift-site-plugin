import { API_VERSION, GROUP } from '@config/config';
import { AccessGrantCrdParams, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdParams, AccessTokenParams } from '@interfaces/CRD_AccessToken';
import { ConnectorCrdParams, ConnectorParams } from '@interfaces/CRD_Connector';
import { ListenerCrdParams, ListenerParams } from '@interfaces/CRD_Listener';
import { SiteCrdParams, SiteParams } from '@interfaces/CRD_Site';

const apiGroupVersion = `${GROUP}/${API_VERSION}`;

export const createSiteData = (props: SiteParams): SiteCrdParams => ({
  apiVersion: apiGroupVersion,
  kind: 'Site',
  ...props
});

export const createAccessGrantRequest = (props: AccessGrantParams): AccessGrantCrdParams => ({
  apiVersion: apiGroupVersion,
  kind: 'AccessGrant',
  ...props
});

export const createAccessTokenRequest = (props: AccessTokenParams): AccessTokenCrdParams => ({
  apiVersion: apiGroupVersion,
  kind: 'AccessToken',
  ...props
});

export const createListenerRequest = (props: ListenerParams): ListenerCrdParams => ({
  apiVersion: apiGroupVersion,
  kind: 'Listener',
  ...props
});

export const createConnectorRequest = (props: ConnectorParams): ConnectorCrdParams => ({
  apiVersion: apiGroupVersion,
  kind: 'Connector',
  ...props
});
