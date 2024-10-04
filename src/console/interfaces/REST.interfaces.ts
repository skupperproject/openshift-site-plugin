import { AxiosError, AxiosRequestConfig } from 'axios';

import { AccessGrantCrdResponse } from './CRD_AccessGrant';
import { CrdStatusCondition, ISO8601Timestamp, StatusSiteType } from './CRD_Base';

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
  ha: boolean;
  platform: string;
  linkCount: number;
  isConfigured: boolean;
  isReady: boolean;
  isResolved: boolean;
  hasSecondaryErrors: boolean;
  resourceVersion: string;
  sitesInNetwork: number;
  conditions?: CrdStatusCondition<StatusSiteType>[];
}

export interface AccessGrant extends BaseView {
  id: string;
  redemptionsAllowed?: number;
  redeemed?: number;
  expirationWindow?: string;
  data: AccessGrantCrdResponse;
}

export interface Link extends BaseView {
  id: string;
  cost: number | string;
  connectedTo: string;
}

export interface Listener extends BaseView {
  id: string;

  routingKey: string;
  serviceName: string;
  port: number;
  type: string;
  connected: number;
}

export interface Connector extends BaseView {
  id: string;
  selector?: string;
  host?: string;
  port: number;
  routingKey: string;
  type: string;
  connected: number;
}
