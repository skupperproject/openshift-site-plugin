import { CrdMetaDataResponse, CrdStatusCondition, ApiVersion, CrdMetaDataRequest, StatusLinkType } from './CRD_Base';

interface AccessTokenCrdBase extends ApiVersion {
  kind: 'AccessToken';
}

interface AccessTokenSpec {
  url: string;
  code: string;
  ca: string;
}

export interface AccessTokenCrdResponse extends AccessTokenCrdBase {
  metadata: CrdMetaDataResponse;
  spec: AccessTokenSpec;
  status?: {
    status: StatusLinkType;
    message: string | 'OK';
    conditions: CrdStatusCondition<StatusLinkType>[];
  };
}

export interface AccessTokenParams {
  metadata: CrdMetaDataRequest;
  spec: AccessTokenSpec;
}

export interface AccessTokenCrdParams extends AccessTokenCrdBase, AccessTokenParams {}
