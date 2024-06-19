import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateBody,
  PageSection,
  EmptyStateVariant
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';

const ErrorOldSkupperVersion = function () {
  const { t } = useTranslation(I18nNamespace);

  return (
    <PageSection>
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.xl}>
          <EmptyStateHeader
            titleText={t('Site Plugin Incompatibility')}
            headingLevel="h4"
            icon={<EmptyStateIcon icon={LockIcon} />}
          />
          <EmptyStateBody>
            {t(
              'It appears that you are using an older version, and as a result, the Site Plugin is not accessible due to incompatibility issues. To resolve this, please upgrade to the latest version to ensure full functionality and compatibility with all site plugins.'
            )}
          </EmptyStateBody>
        </EmptyState>
      </Bullseye>
    </PageSection>
  );
};

export default ErrorOldSkupperVersion;
