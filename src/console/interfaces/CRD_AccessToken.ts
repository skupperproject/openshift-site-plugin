import {
  CrdMetaDataResponse,
  CrdStatusCondition,
  StatusAccessTokenType,
  ApiVersion,
  CrdMetaDataRequest
} from './CRD_Base';

interface AccessTokenCrdBase extends ApiVersion {
  kind: 'AccessToken';
}

export interface AccessTokenSpec {
  url: string;
  code: string;
  ca: string;
}

export interface AccessTokenCrdResponse extends AccessTokenCrdBase {
  metadata: CrdMetaDataResponse;
  spec: AccessTokenSpec;
  status?: {
    status: string;
    conditions: CrdStatusCondition<StatusAccessTokenType>[];
  };
}

export interface AccessTokenParams {
  metadata: CrdMetaDataRequest;
  spec: AccessTokenSpec;
}

export interface AccessTokenCrdParams extends AccessTokenCrdBase, AccessTokenParams {}
