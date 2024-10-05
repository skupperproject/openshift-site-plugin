import { useState } from 'react';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Modal,
  ModalVariant
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';

import SiteForm from './components/forms/SiteForm';

const CreateSitePage = function () {
  const { t } = useTranslation(I18nNamespace);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.xl}>
          <EmptyStateHeader
            titleText={t('No site configured')}
            headingLevel="h4"
            icon={<EmptyStateIcon icon={CubesIcon} />}
          />
          <EmptyStateBody>
            {t('This namespace is not configured to be a site. Please create a site to get started.')}
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button onClick={() => setIsOpen(true)}>{t('Create site')}</Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </Bullseye>

      <Modal
        title={t('Create site')}
        variant={ModalVariant.medium}
        isOpen={isOpen}
        aria-label="Form create site"
        showClose={false}
      >
        <SiteForm onCancel={() => setIsOpen(false)} />
      </Modal>
    </>
  );
};

export default CreateSitePage;
