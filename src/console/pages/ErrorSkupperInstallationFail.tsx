import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateBody,
  PageSection,
  EmptyStateVariant
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';

const ErrorSkupperInstallationFail = function () {
  const { t } = useTranslation(I18nNamespace);

  return (
    <PageSection>
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.xl}>
          <EmptyStateHeader
            titleText={t('Installation Failed')}
            headingLevel="h4"
            icon={<EmptyStateIcon icon={ExclamationCircleIcon} color="var(--pf-v5-global--danger-color--100)" />}
          />
          <EmptyStateBody>
            {t('The installation process was unsuccessful. Please check the logs for more details about the error.')}
          </EmptyStateBody>
        </EmptyState>
      </Bullseye>
    </PageSection>
  );
};

export default ErrorSkupperInstallationFail;
