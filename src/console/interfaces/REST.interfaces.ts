import { AxiosError, AxiosRequestConfig } from 'axios';

import { GrantCrdResponse, ISO8601Timestamp } from './CRD.interfaces';

export type FetchWithOptions = AxiosRequestConfig;

export interface HTTPError extends AxiosError {
  message: string;
  httpStatus?: string;
  descriptionMessage?: string;
}

export interface SiteView {
  identity: string;
  name: string;
  linkAccess: string;
  serviceAccount: string;
  ha: boolean;
  controllerVersion: string;
  linkCount: number;
  creationTimestamp: number;
  isInitialized: boolean;
  hasError: boolean;
  isReady: boolean;
  status?: string;
  resourceVersion: string;
  sitesInNetwork: number;
}

export interface Grant {
  id: string;
  name: string;
  creationTimestamp: ISO8601Timestamp;
  status?: string;
  redemptionsAllowed?: number;
  redeemed?: number;
  expirationWindow?: string;
  data: GrantCrdResponse;
}

export interface Link {
  id: string;
  name: string;
  creationTimestamp: string;
  status?: string;
  cost: string;
  connectedTo: string;
}

export type Listener = {
  id: string;
  name: string;
  creationTimestamp: string;
  routingKey: string;
  serviceName: string;
  port: number;
  type: string;
  connected: number;
};

export type Connector = {
  id: string;
  name: string;
  creationTimestamp: string;
  selector?: string;
  host?: string;
  port: number;
  routingKey: string;
  type: string;
  connected: number;
};
