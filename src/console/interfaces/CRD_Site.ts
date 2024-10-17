import { CrdMetaDataResponse, CrdStatusCondition, StatusSiteType, ApiVersion, CrdMetaDataRequest } from './CRD_Base';

interface SiteCrdBase extends ApiVersion {
  kind: 'Site';
}

interface NetworkLink {
  name: string;
  operational: true;
  remoteSiteId: string;
  remoteSiteName: string;
}

export interface NetworkSite {
  id: string;
  name: string;
  namespace: string;
  platform: string;
  version: string;
  links?: NetworkLink[];
  services?: {
    routingKey: string;
    connectors?: string[];
    listeners?: string[];
  }[];
}

interface SiteSpec {
  name?: string;
  linkAccess?: string;
  serviceAccount: string;
  defaultIssuer: string;
  ha: boolean;
}

export interface SiteCrdResponse extends SiteCrdBase {
  metadata: CrdMetaDataResponse;
  spec?: SiteSpec;
  status?: {
    conditions: CrdStatusCondition<StatusSiteType>[];
    status: string;
    defaultIssuer?: string;
    endpoints?: {
      host: string;
      port: string;
      name: string;
    }[];
    sitesInNetwork?: number;
    network?: NetworkSite[];
  };
}

export interface SiteParams {
  metadata: CrdMetaDataRequest;
  spec: SiteSpec;
}

export interface SiteCrdParams extends SiteCrdBase, SiteParams {}
