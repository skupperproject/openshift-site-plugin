import { API_VERSION, GROUP } from '@config/config';
import { NamespaceManager } from '@config/db';

const K8S_PREFIX_PATH = `/api/kubernetes/`;
const BASE_PATHS = {
  deployment: `${K8S_PREFIX_PATH}apis/apps/v1/namespaces`,
  cr: `${K8S_PREFIX_PATH}apis/${GROUP}/${API_VERSION}/namespaces`,
  rbac: `${K8S_PREFIX_PATH}apis/rbac.authorization.k8s.io/v1/namespaces`,
  k8s: `${K8S_PREFIX_PATH}api/v1/namespaces`,
  route: `${K8S_PREFIX_PATH}apis/route.openshift.io/v1/namespaces`,
  batch: `${K8S_PREFIX_PATH}apis/batch/v1/namespaces`
};

// Helper to build namespace paths
const buildPath = (basePath: string, resource: string, name?: string) => {
  const namespacePath = `${basePath}/${NamespaceManager.getNamespace()}/${resource}`;

  return name ? `${namespacePath}/${name}` : namespacePath;
};

// Deployment paths
export const deploymentsPath = () => buildPath(BASE_PATHS.deployment, 'deployments');
export const deploymentPath = (name: string) => buildPath(BASE_PATHS.deployment, 'deployments', name);

// Custom Resource (CR) paths
export const sitesPath = () => buildPath(BASE_PATHS.cr, 'sites');
export const sitePath = (name: string) => buildPath(BASE_PATHS.cr, 'sites', name);

export const accessGrantsPath = () => buildPath(BASE_PATHS.cr, 'accessgrants');
export const accessGrantPath = (name: string) => buildPath(BASE_PATHS.cr, 'accessgrants', name);

export const accessTokensPath = () => buildPath(BASE_PATHS.cr, 'accesstokens');
export const accessTokenPath = (name: string) => buildPath(BASE_PATHS.cr, 'accesstokens', name);

export const linksPath = () => buildPath(BASE_PATHS.cr, 'links');
export const linkPath = (name: string) => buildPath(BASE_PATHS.cr, 'links', name);

export const listenersPath = () => buildPath(BASE_PATHS.cr, 'listeners');
export const listenerPath = (name: string) => buildPath(BASE_PATHS.cr, 'listeners', name);

export const connectorsPath = () => buildPath(BASE_PATHS.cr, 'connectors');
export const connectorPath = (name: string) => buildPath(BASE_PATHS.cr, 'connectors', name);

// Network console deployment paths
export const certificatePath = () => buildPath(BASE_PATHS.cr, 'certificates');

export const rolePath = () => buildPath(BASE_PATHS.rbac, 'roles');
export const roleBindPath = () => buildPath(BASE_PATHS.rbac, 'rolebindings');

export const configMapPath = () => buildPath(BASE_PATHS.k8s, 'configmaps');

export const servicePath = () => buildPath(BASE_PATHS.k8s, 'services');
export const serviceAccountPath = () => buildPath(BASE_PATHS.k8s, 'serviceaccounts');

export const routePath = () => buildPath(BASE_PATHS.route, 'routes');
export const jobPath = () => buildPath(BASE_PATHS.batch, 'jobs');
