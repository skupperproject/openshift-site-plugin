export type ISO8601Timestamp = string & { __brand: 'ISO8601Timestamp' };

type Status = 'True' | 'False';
type BaseStatus = 'Error' | 'Pending';

export type ReasonStatus = BaseStatus | 'Configured' | 'Ready';

export type StatusSiteType = ReasonStatus;
export type StatusAccessGrantType = ReasonStatus;
export type StatusAccessTokenType = ReasonStatus;
export type StatusLinkType = ReasonStatus;
export type StatusListenerType = ReasonStatus;
export type StatusConnectorType = StatusListenerType;

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
  apiVersion: 'skupper.io/v2alpha1';
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
