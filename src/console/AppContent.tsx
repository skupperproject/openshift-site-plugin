import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import SiteContainer from '@pages/SiteContainer';

import EmptySite from './pages/EmptySite';

const AppContent = function () {
  const { data: site, refetch } = useQuery({
    queryKey: ['find-site-query'],
    queryFn: () => RESTApi.findSiteView()
  });

  const siteId = site?.identity;

  if (!siteId) {
    return <EmptySite onReady={refetch} />;
  }

  return <SiteContainer siteId={siteId} isSiteActive={site.isConfigured} onReady={refetch} />;
};

export default AppContent;
