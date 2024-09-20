import {
  ApiVersion,
  CrdMetaDataRequest,
  CrdMetaDataResponse,
  CrdStatusCondition,
  StatusConnectorType
} from './CRD_Base';

interface ConnectorCrdBase extends ApiVersion {
  kind: 'Connector';
}

export interface ConnectorSpec {
  routingKey: string;
  port: number;
  host?: string;
  selector?: string;
  type: string;
  tlsCredentials?: string;
  includeNotReady: boolean;
}

export interface ConnectorParams {
  metadata: CrdMetaDataRequest;
  spec: ConnectorSpec;
}

export interface ConnectorCrdParams extends ConnectorCrdBase, ConnectorParams {}

export interface ConnectorCrdResponse extends ConnectorCrdBase {
  metadata: CrdMetaDataResponse;
  spec: ConnectorSpec;
  status?: {
    conditions: CrdStatusCondition<StatusConnectorType>[];
    matchingListenerCount: number;
  };
}
