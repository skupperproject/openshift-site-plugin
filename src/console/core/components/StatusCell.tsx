import { Icon, Truncate } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';
import { BaseView } from '@interfaces/REST.interfaces';

interface StatusCellProps {
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
            {data.statusAlert === 'custom' && <CheckCircleIcon />}
            {data.statusAlert === 'success' && <CheckCircleIcon />}
          </Icon>{' '}
          <Truncate content={data.status} trailingNumChars={10} position={'middle'} />
        </span>
      )}
    </>
  );
};

export default StatusCell;
