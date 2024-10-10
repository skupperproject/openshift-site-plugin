export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out
export const I18nNamespace = 'plugin__skupper-site-console'; // Namespace for i18n translations with plugin__ prefix + name of the plugin
export const CR_STATUS_OK = 'OK';
export const EMPTY_LINK_ACCESS = 'none';
export const DEFAULT_SERVICE_ACCOUNT = 'skupper:skupper-controller';
export const DEFAULT_ISSUER = 'skupper-site-ca';
export const EMPTY_VALUE_SYMBOL = '-';
export const REFETCH_QUERY_INTERVAL = 6000;
export const MAX_TRANSITION_TIME = 30; // Maximum time after which to display an error message from the creation of the Site

export const protocolOptions = [
  { value: 'tcp', label: 'tcp' },
  { value: 'http', label: 'http' },
  { value: 'https', label: 'https' }
];
