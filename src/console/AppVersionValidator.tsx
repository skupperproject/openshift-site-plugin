import { ReactNode, useState, useEffect } from 'react';

import { RESTApi } from '@API/REST.api';
import ErrorOldSkupperVersionPage from '@pages/ErrorOldSkupperVersionPage';

const AppVersionValidator = function ({ children }: { children: ReactNode }) {
  const [isOldVersionSkupper, setIsOldVersionSkupper] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const isOld = await RESTApi.isOldVersion();
        setIsOldVersionSkupper(isOld);
      } catch {
        setIsOldVersionSkupper(false);
      }
    };

    checkVersion();
  }, []);

  if (isOldVersionSkupper === true) {
    return <ErrorOldSkupperVersionPage />;
  }

  // Keep fragment tags to maintain height responsiveness in the YAML
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default AppVersionValidator;
