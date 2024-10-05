import { ReactNode } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { QueryKeys } from '@config/reactQuery';
import ErrorOldSkupperVersionPage from '@pages/ErrorOldSkupperVersionPage';

const AppVersionValidator = function ({ children }: { children: ReactNode }) {
  const { data: isOldVersionSkupper } = useQuery({
    queryKey: [QueryKeys.IsOldAppVersion],
    queryFn: () => RESTApi.isOldVersion()
  });

  if (isOldVersionSkupper) {
    return <ErrorOldSkupperVersionPage />;
  }

  // Keep fragment tags to maintain height responsiveness in the YAML
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AppVersionValidator;
