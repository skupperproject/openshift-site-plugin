import { QueryObserverOptions } from '@tanstack/react-query';

interface QueryClientConfig {
  defaultOptions: { queries: QueryObserverOptions };
}

/** React query library config: contains configuration options for the React query library, used for fetching and caching data in the UI */
export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: true,
      suspense: true,
      useErrorBoundary: true
    }
  }
};

export enum QueryKeys {
  FindSite = 'find-site-query',
  FindSiteView = 'find-site-view-query',
  FindGrantToken = 'find-grant-token-query',
  FindAccessToken = 'find-access-token-query',
  FindLink = 'find-link-query',
  FindListener = 'find-listener-query',
  FindConnector = 'find-connector-query',
  GetAccessGrants = 'get-access-grants-query',
  GetAccessTokens = 'get-access-tokens-query',
  GetLinks = 'get-links-query',
  GetConnectors = 'get-connectors-query',
  GetListeners = 'get-listeners-query',
  IsOldAppVersion = 'find-is-old-app-version-query'
}
