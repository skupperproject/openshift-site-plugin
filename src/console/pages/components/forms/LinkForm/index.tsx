import { FC, memo } from 'react';

import { Wizard, WizardHeader, WizardStep } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';

import { FormProvider } from './context/LinkFormProvider';
import { Footer } from './Footer';
import { FormPage } from './FormPage';
import { HowToPage } from './HowToPage';
import { SummaryPage } from './SummaryPage';

// memo is used to prevent the component from being re-created when the Links Page updates data from the watcher
const LinkForm: FC<{ onSubmit: () => void; onCancel: () => void; siteId: string }> = memo(({ onSubmit, onCancel }) => {
  const { t } = useTranslation(I18nNamespace);

  const CreateLinkWizard = function () {
    return (
      <FormProvider>
        <Wizard
          header={
            <WizardHeader
              title={t('Create link')}
              description="Links enable communication between sites. Once sites are linked, they form a network."
              isCloseHidden={true}
            />
          }
          footer={<Footer onCancel={onCancel} onSubmit={onSubmit} />}
        >
          <WizardStep name={t('How-To')} id="1-step" key="1-step">
            <HowToPage />
          </WizardStep>

          <WizardStep name={t('Create a connection')} id="2-step" key="2-step">
            <FormPage />
          </WizardStep>

          <WizardStep name={t('Summary')} id="3-step" key="3-step">
            <SummaryPage />
          </WizardStep>
        </Wizard>
      </FormProvider>
    );
  };

  return <CreateLinkWizard />;
});

export default LinkForm;
