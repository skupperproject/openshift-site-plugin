import { FC, useCallback } from 'react';

import {
  Button,
  WizardFooterWrapper,
  Alert,
  PageSectionVariants,
  PageSection,
  useWizardContext
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { createAccessTokenRequest } from '@core/utils/createCRD';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdParams } from '@interfaces/CRD_AccessToken';
import { HTTPError } from '@interfaces/REST.interfaces';

import { useLinkForm } from './hooks/useLinkForm';

const ButtonName: string[] = ['Next', 'Create', 'Done'];

interface FooterProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export const Footer: FC<FooterProps> = function ({ onCancel, onSubmit }) {
  const { t } = useTranslation();
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const {
    state: { name, fileContent },
    isLoading,
    validated,
    setIsLoading,
    setValidated,
    dispatch
  } = useLinkForm();

  const mutationCreate = useMutation({
    mutationFn: (data: AccessTokenCrdParams) => RESTApi.createAccessToken(data),
    onError: (data: HTTPError) => {
      dispatch({ type: 'SET_NAME', payload: '' });
      dispatch({ type: 'SET_FILE_NAME', payload: '' });
      dispatch({ type: 'SET_FILE_CONTENT', payload: '' });

      setValidated(data.descriptionMessage);
      setIsLoading(false);
    },
    onSuccess: () => {
      setValidated(undefined);
      setIsLoading(true);

      goToNextStep();
    }
  });

  const handleSubmit = useCallback(() => {
    if (!fileContent) {
      setValidated(t('Fill out all required fields before continuing'));

      return;
    }

    try {
      const JsonFile = parse(fileContent) as AccessGrantCrdResponse;
      const { metadata, status } = JsonFile;

      if (!status) {
        setValidated(t('Invalid Grant format'));

        return;
      }

      const data: AccessTokenCrdParams = createAccessTokenRequest({
        metadata: {
          name: name || metadata.name
        },
        spec: {
          ca: status.ca,
          code: status.code,
          url: status.url
        }
      });

      mutationCreate.mutate(data);
    } catch {
      setValidated(t('Invalid Grant format'));
    }
  }, [fileContent, mutationCreate, name, setValidated, t]);

  const handlePreviousStep = useCallback(() => {
    setValidated(undefined);
    goToPrevStep();
  }, [goToPrevStep, setValidated]);

  const handleNextStep = useCallback(() => {
    setValidated(undefined);

    if (activeStep?.index === 2) {
      handleSubmit();

      return;
    }

    if (activeStep?.index === 3) {
      onSubmit();
    }

    goToNextStep();
  }, [setValidated, activeStep?.index, goToNextStep, handleSubmit, onSubmit]);

  return (
    <>
      {validated && activeStep?.index === 2 && (
        <PageSection variant={PageSectionVariants.light}>
          <Alert variant="danger" title={t('An error occurred')} aria-live="polite" isInline>
            {validated}
          </Alert>
        </PageSection>
      )}

      <WizardFooterWrapper>
        <Button
          variant="secondary"
          onClick={handlePreviousStep}
          isDisabled={activeStep?.index === 1 || activeStep?.index === 3 || isLoading}
        >
          {t('Back')}
        </Button>

        <Button onClick={handleNextStep} isDisabled={isLoading || (activeStep?.index === 3 && !!validated)}>
          {t(ButtonName[activeStep?.index - 1])}
        </Button>

        {!(activeStep.index === 3 && !isLoading && !validated) && (
          <Button variant="link" onClick={onCancel}>
            {activeStep?.index === 1 || activeStep?.index === 2 ? t('Cancel') : t('Dismiss')}
          </Button>
        )}
      </WizardFooterWrapper>
    </>
  );
};
