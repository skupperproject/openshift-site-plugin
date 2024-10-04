import { Alert } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';

const AlertStatus = function () {
  const { t } = useTranslation(I18nNamespace);

  const { data: site } = useQuery({
    queryKey: ['find-site-query'],
    queryFn: () => RESTApi.findSiteView(),
    refetchInterval: (data) => (data?.isReady ? 0 : REFETCH_QUERY_INTERVAL / 2)
  });

  return (
    <>
      {site?.isConfigured && !site?.isReady && (
        <Alert
          variant="warning"
          isInline
          title={t(
            'The site is Configured: you can create resources, but until the router is ready the effect is not usable'
          )}
        />
      )}

      {site?.isResolved && (site?.hasError || site?.hasSecondaryErrors) && (
        <Alert
          variant="danger"
          isInline
          title={t('There is one or more errors. Please check the conditions on the Details page for more information')}
        />
      )}
    </>
  );
};

export default AlertStatus;
