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
  host: string;
  type: string;
  tlsCredentials?: string;
}

export interface ListenerCrdResponse extends ListenerCrdBase {
  metadata: CrdMetaDataResponse;
  spec: ListenerSpec;
  status?: {
    conditions: CrdStatusCondition<StatusListenerType>[];
    matchingConnectorCount: number;
  };
}

export interface ListenerParams {
  metadata: CrdMetaDataRequest;
  spec: ListenerSpec;
}

export interface ListenerCrdParams extends ListenerCrdBase, ListenerParams {}
