import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { createSiteInfo, deleteSiteInfo } from '@config/db';
import ErrorOldSkupperVersion from '@pages/ErrorOldSkupperVersion';
import SiteContainer from '@pages/SiteContainer';

import EmptySite from './pages/EmptySite';

const AppContent = function () {
  const { data: skupperInitStatus } = useQuery({
    queryKey: ['find-skupper-router-query'],
    queryFn: () => RESTApi.skupperStatus('skupper-router')
  });

  const { data: site, refetch: refetchSite } = useQuery({
    queryKey: ['find-init-site-query'],
    queryFn: () => RESTApi.findSiteView(),
    enabled: skupperInitStatus !== -3 // this state indicates an old version of skupper
  });

  const siteId = site?.identity;

  useEffect(() => {
    if (siteId) {
      createSiteInfo({ name: site.name, resourceVersion: site.resourceVersion });
    }
  }, [siteId, site?.name, site?.resourceVersion]);

  if (skupperInitStatus === -3) {
    return <ErrorOldSkupperVersion />;
  }

  if (!siteId) {
    deleteSiteInfo();

    return <EmptySite onSubmit={refetchSite} />;
  }

  return <SiteContainer siteId={siteId} isSiteActive={site.isInitialized} onDataUpdated={refetchSite} />;
};

export default AppContent;
