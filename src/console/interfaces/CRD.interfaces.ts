interface OwnerReference {
  name: string;
  kind: string;
  uid: string;
  apiVersion: string;
  controller?: boolean;
  blockOwnerDeletion?: boolean;
}

interface ObjectMetadata {
  annotations?: {
    [key: string]: string;
  };
  clusterName?: string;
  creationTimestamp?: string;
  deletionGracePeriodSeconds?: number;
  deletionTimestamp?: string;
  finalizers?: string[];
  generateName?: string;
  generation?: number;
  labels?: {
    [key: string]: string;
  };
  name?: string;
  namespace?: string;
  ownerReferences?: OwnerReference[];
  resourceVersion?: string;
  uid?: string;
}

export interface K8sResourceCommon {
  apiVersion?: string;
  kind?: string;
  metadata?: ObjectMetadata;
  code?: number;
}

export interface K8sResourceConfigMapData {
  ingress: string;
  name: string;
}

interface K8sResourceSiteStatusData {
  recType: 'SITE';
  identity: string;
  startTime: number;
  endTime: number;
  source: string;
  platform: 'kubernetes' | 'podman';
  name: string;
  nameSpace: string;
  siteVersion: string;
  policy: 'disabled' | 'enabled';
}

interface K8sResourceRouterData {
  recType: 'ROUTER';
  identity: string;
  parent: string;
  startTime: number;
  endTime: number;
  source: string;
  name: string;
  namespace: string;
  imageName: string;
  imageVersion: string;
  hostname: string;
  buildVersion: string;
}

export interface K8sResourceLinkData {
  recType: 'LINK';
  identity: string;
  parent: string;
  startTime: string;
  endTime: string;
  source: string;
  mode: string;
  name: string;
  linkCost: string;
  direction: string;
}

interface K8sResourceListenerData {
  recType: 'LISTENER';
  identity: string;
  parent: string;
  startTime: string;
  endTime: string;
  source: string;
  name: string;
  destHost: string;
  destPort: string;
  protocol: string;
  address: string;
  addressId: string;
}

interface K8sResourceConnectorData {
  recType: 'CONNECTOR';
  identity: string;
  parent: string;
  startTime: string;
  endTime: string;
  destHost: string;
  destPort: string;
  protocol: string;
  address: string;
  target: string;
  processId: string;
  addressId: string;
}

export interface PartialDeploymentResponse {
  code: number;
  status: { conditions: { status: 'True' | 'False' }[] };
}

export interface K8sResourceNetworkStatusData {
  addresses: Record<string, unknown> | null;

  siteStatus:
    | {
        site: K8sResourceSiteStatusData;
        routerStatus:
          | {
              router: K8sResourceRouterData;
              links: K8sResourceLinkData[];
              listeners: K8sResourceListenerData[] | null;
              connectors: K8sResourceConnectorData[] | null;
            }[]
          | null;
      }[]
    | null;
}

 interface K8sResourceNetworkStatusResponse {
   NetworkStatus?: string;
 }

export interface K8sResourceNetworkStatusConfigMap extends K8sResourceCommon {
  data?: K8sResourceNetworkStatusResponse;
}

export interface K8sResourceConfigMap extends K8sResourceCommon {
  data?: K8sResourceConfigMapData;
}


export type ISO8601Timestamp = string & { __brand: 'ISO8601Timestamp' };

interface ApiVersion {
  apiVersion: 'skupper.io/v1alpha1';
}

interface SiteCrdBase extends ApiVersion {
  kind: 'Site';
}

export interface SiteParams {
  metadata: {
    name: string;
    resourceVersion: string;
  };
  spec: {
    linkAccess?: string; // default
  };
}

export interface SiteCrdParams extends SiteCrdBase, SiteParams {}

export interface SiteCrdResponse extends SiteCrdBase {
  metadata: {
    name: string;
    uid: string;
    resourceVersion: string;
    creationTimestamp: ISO8601Timestamp;
    namespace: string;
  };
  spec: {
    serviceAccount?: string;
    linkAccess?: string;
    settings?: {
      name: string;
      value: string;
    }[];
  };
  status?: {
    active?: boolean;
    status?: string;
    endpoints?: {
      host: string;
      port: string;
      name: string;
    }[];
    sitesInNetwork?: number;
    servicesInNetwork?: number;
    network?: {
      id: string;
      name: string;
      namespace: string;
      platform: string;
      version: string;
      links?: string[];
      services?: {
        routingKey: string;
        connectors?: string[];
        listeners?: string[];
      }[];
    }[];
  };
}

interface GrantCrdBase extends ApiVersion {
  kind: 'Grant';
}

export interface GrantParams {
  metadata: {
    name: string;
  };
  spec: {
    claims?: number;
    validFor: string;
    secret?: string;
  };
}

export interface GrantCrdParams extends GrantCrdBase, GrantParams {}

export interface GrantCrdResponse extends GrantCrdBase {
  metadata: {
    uid: string;
    name: string;
    resourceVersion: string;
    namespace?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
    creationTimestamp: ISO8601Timestamp;
  };
  spec: {
    claims: number;
    validFor: string;
    secret: string;
  };
  status?: {
    url?: string;
    secret?: string;
    ca?: string;
    claimed?: number;
    expiration?: ISO8601Timestamp;
    status?: string;
  };
}

interface ClaimCrdBase extends ApiVersion {
  kind: 'Claim';
}

export interface ClaimParams {
  metadata: {
    name: string;
  };
  spec: {
    ca: string;
    secret: string;
    url: string;
  };
}

export interface ClaimCrdParams extends ClaimCrdBase, ClaimParams {}

export interface ClaimCrdResponse extends ClaimCrdBase {
  metadata: {
    uid: string;
    name: string;
    resourceVersion: string;
    namespace?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
    creationTimestamp: ISO8601Timestamp;
  };
  spec: {
    url: string;
    secret: string;
    ca: string;
  };
  status?: {
    claimed?: boolean;
    status?: string;
  };
}

interface LinkCrdBase extends ApiVersion {
  kind: 'Link';
}

export interface LinkCrdResponse extends LinkCrdBase {
  metadata: {
    uid: string;
    name: string;
    resourceVersion: string;
    namespace?: string;
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
    creationTimestamp: ISO8601Timestamp;
  };
  spec: {
    interRouter: {
      host: string;
      port: number;
    };
    edge: {
      host: string;
      port: number;
    };
    tlsCredentials?: string;
    cost?: number;
    noClientAuth?: boolean;
  };
  status?: {
    url?: string;
    active?: boolean;
    site?: string;
    status?: string;
  };
}

interface ListenerCrdBase extends ApiVersion {
  kind: 'Listener';
}

export interface ListenerParams {
  metadata: {
    name: string;
    resourceVersion?: string;
  };
  spec: {
    routingKey: string;
    port: number;
    host: string;
  };
}

export interface ListenerCrdParams extends ListenerCrdBase, ListenerParams {}

export interface ListenerCrdResponse extends ListenerCrdBase {
  metadata: {
    uid: string;
    name: string;
    resourceVersion?: string;
    namespace: string;
    creationTimestamp: ISO8601Timestamp;
  };
  spec: {
    routingKey: string;
    port: number;
    host: string;
  };
  status?: {
    active?: boolean;
    status?: string;
  };
}

interface ConnectorCrdBase extends ApiVersion {
  kind: 'Connector';
}

export interface ConnectorParams {
  metadata: {
    name: string;
    resourceVersion: string;
  };
  spec: {
    routingKey: string;
    port: number;
    selector?: string;
    host?: string;
  };
}

export interface ConnectorCrdParams extends ConnectorCrdBase, ConnectorParams {}

export interface ConnectorCrdResponse extends ConnectorCrdBase {
  metadata: {
    uid: string;
    name: string;
    resourceVersion: string;
    namespace: string;
    creationTimestamp: ISO8601Timestamp;
  };
  spec: {
    routingKey: string;
    port: number;
    host?: string;
    selector?: string;
  };
  status?: {
    active?: boolean;
    status?: string;
  };
}

export interface ListCrdResponse<T> extends ApiVersion {
  items: T[];
}
