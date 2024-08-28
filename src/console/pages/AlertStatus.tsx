import { Alert } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';

const AlertStatus = function () {
  const { t } = useTranslation(I18nNamespace);

  const { data: site } = useQuery({
    queryKey: ['find-yaml-alert'],
    queryFn: () => RESTApi.findSiteView(),
    refetchInterval: (data) => (data?.isReady ? 0 : REFETCH_QUERY_INTERVAL / 4)
  });

  if ((!site?.hasError && !site?.isConfigured) || site?.isReady) {
    return null;
  }

  if (site?.hasError) {
    return <Alert variant="warning" isInline title={site.status} />;
  }

  return (
    <Alert
      variant="warning"
      isInline
      title={t(
        'The site is Configured: you can create resources, but until the router is ready the effect is not usable'
      )}
    />
  );
};

export default AlertStatus;
