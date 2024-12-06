import {
  CrdMetaDataResponse,
  CrdStatusCondition,
  ISO8601Timestamp,
  StatusAccessGrantType,
  ApiVersion,
  CrdMetaDataRequest
} from './CRD_Base';

interface AccessGrantCrdBase extends ApiVersion {
  kind: 'AccessGrant';
}

interface AccessGrantSpec {
  redemptionsAllowed: number;
  expirationWindow: string;
  code: string;
}

export interface AccessGrantCrdResponse extends AccessGrantCrdBase {
  metadata: CrdMetaDataResponse;
  spec: AccessGrantSpec;
  status?: {
    url: string;
    code: string;
    ca: string;
    redemptions: number;
    expirationTime: ISO8601Timestamp;
    status: StatusAccessGrantType;
    message: string | 'OK';
    conditions: CrdStatusCondition<StatusAccessGrantType>[];
  };
}

export interface AccessGrantParams {
  metadata: CrdMetaDataRequest;
  spec: AccessGrantSpec;
}

export interface AccessGrantCrdParams extends AccessGrantCrdBase, AccessGrantParams {}
