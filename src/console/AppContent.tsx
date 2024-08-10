import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { createSiteInfo, deleteSiteInfo } from '@config/db';
import SiteContainer from '@pages/SiteContainer';

import EmptySite from './pages/EmptySite';

const AppContent = function () {
  const { data: site, refetch: refetchSite } = useQuery({
    queryKey: ['find-init-site-query'],
    queryFn: () => RESTApi.findSiteView()
  });

  const siteId = site?.identity;

  useEffect(() => {
    if (siteId) {
      createSiteInfo({ name: site.name, resourceVersion: site.resourceVersion });
    }
  }, [siteId, site?.name, site?.resourceVersion]);

  if (!siteId) {
    deleteSiteInfo();

    return <EmptySite onSubmit={refetchSite} />;
  }

  return <SiteContainer siteId={siteId} isSiteActive={site.isConfigured} onDataUpdated={refetchSite} />;
};

export default AppContent;
