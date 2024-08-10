import { getSkupperNamespace } from '@config/db';

const K8S_PREFIX_PATH = `/api/kubernetes/`;

const DEPLOYMENT_PATH = `${K8S_PREFIX_PATH}apis/apps/v1/namespaces/`;
const deploymentsPath = () => `${DEPLOYMENT_PATH}${getSkupperNamespace()}/deployments`;
export const deploymentPath = (name: string) => `${deploymentsPath()}/${name}`;

const BASE_CR_PATH = `${K8S_PREFIX_PATH}apis/skupper.io/v1alpha1/namespaces/`;
export const sitesPath = () => `${BASE_CR_PATH}${getSkupperNamespace()}/sites`;
export const sitePath = (name: string) => `${sitesPath()}/${name}`;

export const accessGrantsPath = () => `${BASE_CR_PATH}${getSkupperNamespace()}/accessgrants`;
export const accessGrantPath = (name: string) => `${accessGrantsPath()}/${name}`;

export const accessTokensPath = () => `${BASE_CR_PATH}${getSkupperNamespace()}/accesstokens`;
export const accessTokenPath = (name: string) => `${accessTokensPath()}/${name}`;

export const linksPath = () => `${BASE_CR_PATH}${getSkupperNamespace()}/links`;
export const linkPath = (name: string) => `${linksPath()}/${name}`;

export const listenersPath = () => `${BASE_CR_PATH}${getSkupperNamespace()}/listeners`;
export const listenerPath = (name: string) => `${listenersPath()}/${name}`;

export const connectorsPath = () => `${BASE_CR_PATH}${getSkupperNamespace()}/connectors`;
export const connectorPath = (name: string) => `${connectorsPath()}/${name}`;
