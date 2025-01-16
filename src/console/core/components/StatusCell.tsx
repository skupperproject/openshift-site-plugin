import { I18nNamespace } from '@config/config';
import { BaseView } from '@interfaces/REST.interfaces';
import { Icon } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

interface StatusCellProps {
  data: BaseView;
}

const StatusCell = function ({ data }: StatusCellProps) {
  const { t } = useTranslation(I18nNamespace);

  return (
    <>
      {!data.status && (
        <>
          <Icon isInline>{<InProgressIcon />}</Icon> {t('In progress')}
        </>
      )}
      {data.status && (
        <>
          <Icon isInline status={data.statusAlert}>
            {data.hasError && <ExclamationCircleIcon />}
            {data.statusAlert === 'custom' && <CheckCircleIcon />}
            {data.statusAlert === 'success' && <CheckCircleIcon />}
          </Icon>{' '}
          {data?.status}
        </>
      )}
    </>
  );
};

export default StatusCell;
