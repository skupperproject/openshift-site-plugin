import { StatusType } from '@interfaces/CRD_Base';

export const API_VERSION = 'v2alpha1';
export const GROUP = 'skupper.io';

export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out
export const I18nNamespace = 'plugin__skupper-site-console'; // Namespace for i18n translations with plugin__ prefix + name of the plugin
export const EMPTY_LINK_ACCESS = 'none';
export const DEFAULT_SERVICE_ACCOUNT = 'skupper:skupper-controller';
export const DEFAULT_ISSUER = 'skupper-site-ca';
export const EMPTY_VALUE_SYMBOL = '-';

// Map of status types to priority values, used to determine the last or most relevant status.
// Higher priority values indicate greater importance, with `Running` and `Matched` having the highest priority (3).
export const priorityStatusMap: Record<StatusType, number> = {
  Ready: 4, // Indicates that the system is prepared but not yet fully configured or operational. Mutually exclusive with 'Configured'.
  Configured: 1, // Represents that the system has been configured but may not be ready yet.
  Error: 1, // Indicates that there is an error in the system.
  Pending: 1 // Indicates that the system is in a pending state, such as being created or being updated.
};
