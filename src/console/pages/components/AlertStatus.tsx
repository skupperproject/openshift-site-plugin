import { useMemo } from 'react';

import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { I18nNamespace, MAX_TRANSITION_TIME } from '@config/config';
import { useSiteData } from 'console/context/AppContext';

const AlertStatus = function () {
  const { t } = useTranslation(I18nNamespace);

  const { site } = useSiteData();
  const hasExceededTransitionLimit = useMemo(
    () => checkTransitionTimeDifference(site?.conditions || []),
    [site?.conditions]
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

function checkTransitionTimeDifference(
  conditions: Array<{ lastTransitionTime: string; type: string }>
): boolean | string {
  const readyCondition = conditions.find((cond) => cond.type === 'Ready');
  const resolvedCondition = conditions.find((cond) => cond.type === 'Resolved');

  if (!readyCondition || !resolvedCondition) {
    return false;
  }

  const now = new Date().getTime();
  const resolvedTime = new Date(resolvedCondition.lastTransitionTime).getTime();

  return now / 1000 - resolvedTime / 1000 >= MAX_TRANSITION_TIME;
}
