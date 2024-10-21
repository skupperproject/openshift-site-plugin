import { AxiosError, AxiosRequestConfig } from 'axios';

import { AccessGrantCrdResponse } from './CRD_AccessGrant';
import { AccessTokenCrdResponse } from './CRD_AccessToken';
import { CrdStatusCondition, ISO8601Timestamp, StatusSiteType } from './CRD_Base';
import { ConnectorCrdResponse } from './CRD_Connector';
import { LinkCrdResponse } from './CRD_Link';
import { ListenerCrdResponse } from './CRD_Listener';
import { SiteCrdResponse } from './CRD_Site';

export type FetchWithOptions = AxiosRequestConfig;
export type StatusAlert = 'danger' | 'success' | 'warning' | 'custom' | 'info' | undefined;

export interface HTTPError extends AxiosError {
  message: string;
  httpStatus?: string;
  descriptionMessage?: string;
}

export interface BaseView {
  name: string;
  creationTimestamp: ISO8601Timestamp;
  hasError: boolean;
  status?: string;
  statusAlert?: StatusAlert;
}

export interface SiteView extends BaseView {
  identity: string;
  linkAccess: string;
  serviceAccount: string;
  defaultIssuer: string;
  ha: boolean;
  platform: string;
  linkCount: number;
  remoteLinks: string[];
  isConfigured: boolean;
  isReady: boolean;
  isResolved: boolean;
  hasSecondaryErrors: boolean;
  resourceVersion: string;
  sitesInNetwork: number;
  conditions?: CrdStatusCondition<StatusSiteType>[];
  rawData: SiteCrdResponse;
}

export interface AccessGrant extends BaseView {
  id: string;
  redemptionsAllowed?: number;
  redeemed?: number;
  expirationWindow?: string;
  rawData: AccessGrantCrdResponse;
}

export interface Link extends BaseView {
  id: string;
  cost: number | string;
  connectedTo: string;
  rawData: LinkCrdResponse | AccessTokenCrdResponse;
}

export interface Listener extends BaseView {
  id: string;
  routingKey: string;
  serviceName?: string;
  port: number;
  connected: number;
  resourceVersion: string;
  rawData: ListenerCrdResponse;
}

export interface Connector extends BaseView {
  id: string;
  selector?: string;
  host?: string;
  port: number;
  routingKey: string;
  connected: number;
  resourceVersion: string;
  rawData: ConnectorCrdResponse;
}
