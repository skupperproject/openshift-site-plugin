import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { QueryKeys } from '@config/reactQuery';
import SitePage from '@pages/SitePage';

import CreateSitePage from './pages/CreateSitePage';

const AppContent = function () {
  const { data: site } = useQuery({
    queryKey: [QueryKeys.FindSite],
    queryFn: () => RESTApi.findSite()
  });

  return site?.metadata.uid ? <SitePage siteId={site?.metadata.uid} /> : <CreateSitePage />;
};

export default AppContent;
