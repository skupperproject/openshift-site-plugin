import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import SiteContainer from '@pages/SiteContainer';

import EmptySite from './pages/EmptySite';

const AppContent = function () {
  const { data: site } = useQuery({
    queryKey: ['find-site-query-init'],
    queryFn: () => RESTApi.findSiteView()
  });

  const siteId = site?.identity;

  if (!siteId) {
    return <EmptySite />;
  }

  return <SiteContainer siteId={siteId} isSiteActive={site.isConfigured} />;
};

export default AppContent;
