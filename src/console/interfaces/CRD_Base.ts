export type ISO8601Timestamp = string & { __brand: 'ISO8601Timestamp' };

type ReasonStatus = 'OK' | 'Error';
type Status = 'True' | 'False';
export type StatusAccessGrantType = 'Processed' | 'Ready' | 'Resolved';
export type StatusAccessTokenType = 'Redeemed';
export type StatusLinkType = 'Configured' | 'Ready' | 'Operational';
export type StatusListenerType = 'Configured' | 'Matched' | 'Ready';
export type StatusConnectorType = StatusListenerType;
export type StatusSiteType = 'Configured' | 'Running' | 'Ready' | 'Resolved';

export type StatusType =
  | StatusSiteType
  | StatusAccessGrantType
  | StatusAccessTokenType
  | StatusLinkType
  | StatusListenerType
  | StatusConnectorType;

export interface CrdStatusCondition<T> {
  lastTransitionTime: ISO8601Timestamp;
  message: string;
  observedGeneration: number;
  reason: ReasonStatus;
  status: Status;
  type: T;
}

export interface CrdMetaDataRequest {
  name: string;
  resourceVersion?: string;
}

export interface CrdMetaDataResponse {
  uid: string;
  name: string;
  namespace: string;
  resourceVersion: string;
  creationTimestamp: ISO8601Timestamp;
}
export interface ApiVersion {
  apiVersion: 'skupper.io/v1alpha1';
}

export interface ListCrdResponse<T> extends ApiVersion {
  items: T[];
}

/*****************************************************************  */

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
  resourceVersion?: string;
  uid?: string;
}

export interface K8sResourceCommon {
  apiVersion?: string;
  kind?: string;
  metadata?: ObjectMetadata;
  code?: number;
}

export interface PartialDeploymentResponse {
  code: number;
  status: { conditions: { status: 'True' | 'False' }[] };
}
