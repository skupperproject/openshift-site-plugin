import { CrdMetaDataResponse, CrdStatusCondition, StatusLinkType, ApiVersion } from './CRD_Base';

interface LinkCrdBase extends ApiVersion {
  kind: 'Link';
}

export interface LinkSpec {
  endpoints: {
    group: string;
    host: string;
    name: string;
    port: string;
  }[];
  tlsCredentials?: string;
  cost?: number;
  noClientAuth?: boolean;
}

export interface LinkCrdResponse extends LinkCrdBase {
  metadata: CrdMetaDataResponse;
  spec: LinkSpec;
  status?: {
    remoteSiteId?: string;
    remoteSiteName?: string;
    conditions: CrdStatusCondition<StatusLinkType>[];
    status: StatusLinkType;
    message: string | 'OK';
  };
}
