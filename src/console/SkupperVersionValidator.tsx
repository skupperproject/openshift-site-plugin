import { ReactNode } from 'react';

import { useQuery } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import ErrorOldSkupperVersion from '@pages/ErrorOldSkupperVersion';

const SkupperVersionValidator = function ({ children }: { children: ReactNode }) {
  const { data: isOldVersionSkupper } = useQuery({
    queryKey: ['find-skupper-router-query'],
    queryFn: () => RESTApi.isOldVersionSkupper()
  });

  if (isOldVersionSkupper) {
    return <ErrorOldSkupperVersion />;
  }

  // Keep fragment tags to maintain height responsiveness in the YAML
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default SkupperVersionValidator;
