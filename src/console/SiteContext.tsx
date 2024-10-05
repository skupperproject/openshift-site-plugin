import React, { createContext, useContext } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { REFETCH_QUERY_INTERVAL } from '@config/config';
import { QueryKeys } from '@config/reactQuery';
import { SiteView } from '@interfaces/REST.interfaces';

const ApiDataContext = createContext<{
  site: SiteView | null | undefined;
  isFetching: boolean;
  onRefetch: Function;
}>({
  site: null,
  isFetching: false,
  onRefetch: () => null
});

export const SiteDataProvider = function ({ children }: { children: React.ReactNode }) {
  const {
    data: site,
    isFetching,
    refetch
  } = useQuery({
    queryKey: [QueryKeys.FindSite],
    queryFn: () => RESTApi.findSiteView(),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  return <ApiDataContext.Provider value={{ site, isFetching, onRefetch: refetch }}>{children}</ApiDataContext.Provider>;
};

export const useSiteData = () => useContext(ApiDataContext);
