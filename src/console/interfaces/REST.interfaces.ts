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
  routerVersion: string;
  controllerVersion: string;
  linkCount: number;
  creationTimestamp: number;
  resourceVersion: string;
}

export interface Grant {
  id: string;
  name: string;
  creationTimestamp: string;
  status?: string;
  claims?: number;
  claimed?: number;
  expiration?: ISO8601Timestamp;
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
};

export type Connector = {
  id: string;
  name: string;
  creationTimestamp: string;
  selector?: string;
  host?: string;
  port: number;
  routingKey: string;
};
