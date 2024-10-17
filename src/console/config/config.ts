import { StatusType } from '@interfaces/CRD_Base';

export const API_VERSION = 'v1alpha1';
export const GROUP = 'skupper.io';

export const MSG_TIMEOUT_ERROR = 'The request to fetch the data has timed out.'; // Error message to display when request times out
export const I18nNamespace = 'plugin__skupper-site-console'; // Namespace for i18n translations with plugin__ prefix + name of the plugin
export const CR_STATUS_OK = 'OK';
export const EMPTY_LINK_ACCESS = 'none';
export const DEFAULT_SERVICE_ACCOUNT = 'skupper:skupper-controller';
export const DEFAULT_ISSUER = 'skupper-site-ca';
export const EMPTY_VALUE_SYMBOL = '-';
export const MAX_TRANSITION_TIME = 30; // Maximum time after which to display an error message from the creation of the Site

// Map of status types to priority values, used to determine the last or most relevant status.
// Higher priority values indicate greater importance, with `Running` and `Matched` having the highest priority (3).
export const priorityStatusMap: Record<StatusType, number> = {
  Resolved: 0, // Disabled: This status type is ignored (has the lowest priority).
  Ready: 2, // Indicates that the system is prepared but not yet fully configured or operational. Mutually exclusive with 'Configured'.
  Configured: 1, // Represents that the system has been configured but may not be ready yet.
  Running: 3, // Indicates that the Site is running.
  Processed: 3, // Used by AccessGrant.
  Operational: 3, // Used by Links.
  Matched: 3, // Used by Listeners and Connectors when they are bound.
  Redeemed: 0 // Reserved for future use, currently not utilized in the logic.
};
