import {
  ClaimCrdParams,
  ClaimParams,
  ConnectorCrdParams,
  ConnectorParams,
  GrantCrdParams,
  GrantParams,
  ListenerCrdParams,
  ListenerParams,
  SiteCrdParams,
  SiteParams
} from '../../interfaces/CRD.interfaces';

export const createSiteData = (params: SiteParams): SiteCrdParams => ({
  apiVersion: 'skupper.io/v1alpha1',
  kind: 'Site',
  ...params
});

export const createGrantRequest = ({ metadata, spec }: GrantParams): GrantCrdParams => ({
  apiVersion: 'skupper.io/v1alpha1',
  kind: 'Grant',
  metadata,
  spec
});

export const createClaimRequest = ({ metadata, spec }: ClaimParams): ClaimCrdParams => ({
  apiVersion: 'skupper.io/v1alpha1',
  kind: 'Claim',
  metadata,
  spec
});

export const createListenerRequest = ({ metadata, spec }: ListenerParams): ListenerCrdParams => ({
  apiVersion: 'skupper.io/v1alpha1',
  kind: 'Listener',
  metadata,
  spec
});

export const createConnectorRequest = ({ metadata, spec }: ConnectorParams): ConnectorCrdParams => ({
  apiVersion: 'skupper.io/v1alpha1',
  kind: 'Connector',
  metadata,
  spec
});
