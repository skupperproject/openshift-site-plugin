import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Icon } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';
import { BaseView } from '@interfaces/REST.interfaces';

export interface StatusCellProps {
  data: BaseView;
}

const StatusCell = function ({ data }: StatusCellProps) {
  const { t } = useTranslation(I18nNamespace);

  return (
    <>
      {!data.status && (
        <span>
          <Icon isInline>{<InProgressIcon />}</Icon> {t('In progress')}
        </span>
      )}
      {data.status && (
        <span>
          <Icon isInline status={data.statusAlert}>
            {data.hasError && <ExclamationCircleIcon />}
            {data.statusAlert === 'warning' && <YellowExclamationTriangleIcon />}
            {data.statusAlert === 'success' && <CheckCircleIcon />}
          </Icon>{' '}
          {data.status}
        </span>
      )}
    </>
  );
};

export default StatusCell;
