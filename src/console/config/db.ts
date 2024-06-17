let skupperNamespace = 'skupper-site-test';

export const setSkupperNamespace = (namespace: string) => (skupperNamespace = namespace);
export const getSkupperNamespace = () => skupperNamespace;

let siteInfo: { name: string; resourceVersion: string } | null = null;

export const getSiteInfo = () => siteInfo;
export const createSiteInfo = (params: { name: string; resourceVersion: string }) => (siteInfo = params);
export const deleteSiteInfo = () => (siteInfo = null);
