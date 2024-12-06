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
  tlsCredentials?: string;
  includeNotReadyPods: boolean;
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
    status: StatusConnectorType;
    message: string | 'Ok';
    hasMatchingListener: boolean;
  };
}
