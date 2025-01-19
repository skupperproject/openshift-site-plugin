import {
  CrdMetaDataResponse,
  CrdStatusCondition,
  StatusListenerType,
  ApiVersion,
  CrdMetaDataRequest
} from './CRD_Base';

interface ListenerCrdBase extends ApiVersion {
  kind: 'Listener';
}

export interface ListenerSpec {
  routingKey: string;
  port: number;
  host?: string;
  tlsCredentials?: string;
}

export interface ListenerParams {
  metadata: CrdMetaDataRequest;
  spec: ListenerSpec;
}

export interface ListenerCrdResponse extends ListenerCrdBase {
  metadata: CrdMetaDataResponse;
  spec: ListenerSpec;
  status?: {
    conditions: CrdStatusCondition<StatusListenerType>[];
    status: StatusListenerType;
    message: string;
    hasMatchingConnector: boolean;
  };
}

export interface ListenerCrdParams extends ListenerCrdBase, ListenerParams {}
