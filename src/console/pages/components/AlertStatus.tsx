import { useMemo } from 'react';

import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { I18nNamespace, MAX_TRANSITION_TIME } from '@config/config';
import { useWatchedSkupperResource } from 'console/hooks/useSkupperWatchResource';

const AlertStatus = function () {
  const { t } = useTranslation(I18nNamespace);

  const { data: sites } = useWatchedSkupperResource({ kind: 'Site' });
  const site = sites?.[0];

  const hasExceededTransitionLimit = useMemo(
    () => checkTransitionTimeDifference(site?.creationTimestamp),
    [site?.creationTimestamp]
  );

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

      {hasExceededTransitionLimit && (site?.hasError || site?.hasSecondaryErrors) && (
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

function checkTransitionTimeDifference(creationTime: string | undefined): boolean | string {
  const now = new Date().getTime();
  const resolvedTime = new Date(creationTime || 0).getTime();

  return now / 1000 - resolvedTime / 1000 >= MAX_TRANSITION_TIME;
}
