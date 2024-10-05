import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { QueryKeys } from '@config/reactQuery';
import SiteContainer from '@pages/SiteContainer';

import EmptySite from './pages/EmptySite';

const AppContent = function () {
  const { data: site } = useQuery({
    queryKey: [QueryKeys.FindSiteInit],
    queryFn: () => RESTApi.findSiteView()
  });

return site?.identity ? <SiteContainer siteId={site?.identity} /> : <EmptySite />;
};

export default AppContent;
