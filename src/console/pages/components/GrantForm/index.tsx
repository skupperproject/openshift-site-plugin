import { useState, FC, useCallback, useMemo, useRef } from 'react';

import {
  Button,
  Alert,
  Wizard,
  WizardFooterWrapper,
  WizardHeader,
  WizardStep,
  PageSection,
  PageSectionVariants
} from '@patternfly/react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import { createAccessGrantRequest } from '@core/utils/createCRD';
import { AccessGrantCrdParams, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { HTTPError } from '@interfaces/REST.interfaces';
import useValidatedInput from 'console/hooks/useValidation';

import { DownloadGrant } from './DownloadGrant';
import { FormPage } from './FormPage';

const DEFAULT_EXPIRATION = 15;
const DEFAULT_CLAIMS = 1;

enum ValidForUnit {
  Minutes = 'm',
  Hours = 'h'
}

const ButtonName: string[] = ['Create', 'Done'];

const GrantForm: FC<{ onSubmit?: () => void; onCancel?: () => void }> = function ({ onCancel }) {
  const { t } = useTranslation(I18nNamespace);

  const [name, setName] = useState('');
  const [step, setStep] = useState(1);

  const { validated: validationError, validateInput: setValidationError } = useValidatedInput();

  const validForRef = useRef<number | undefined>(DEFAULT_EXPIRATION);
  const validForUnitRef = useRef<ValidForUnit>(ValidForUnit.Minutes);
  const claimsRef = useRef<number | undefined>(DEFAULT_CLAIMS);
  const codeRef = useRef<string>('');

  const { data: grant } = useQuery({
    queryKey: ['find-grant-token-query', name],
    queryFn: () => RESTApi.findGrant(name),
    cacheTime: 0,
    enabled: step === 2,
    refetchInterval(data) {
      return data?.status ? 0 : REFETCH_QUERY_INTERVAL;
    }
  });

  const mutationCreate = useMutation({
    mutationFn: (data: AccessGrantParams) => RESTApi.createGrant(data),
    onError: (data: HTTPError) => {
      setValidationError(data.descriptionMessage);
    },
    onSuccess: () => {
      setValidationError(undefined);
      setStep(step + 1);
    }
  });

  const handleSubmit = useCallback(() => {
    const data: AccessGrantCrdParams = createAccessGrantRequest({
      metadata: {
        name
      },
      spec: {
        expirationWindow: `${validForRef.current || DEFAULT_EXPIRATION}${validForUnitRef.current}`,
        redemptionsAllowed: claimsRef.current || DEFAULT_CLAIMS,
        code: codeRef.current
      }
    });

    mutationCreate.mutate(createAccessGrantRequest(data));
  }, [mutationCreate, name]);

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      handleSubmit();
    }
  }, [handleSubmit, step]);

  const steps = useMemo(
    () => [
      <WizardStep name={t('Configuration')} id="1-step" key="1-step">
        <FormPage
          name={name}
          onSetName={(value: string) => setName(value)}
          onSetValidFor={(value: number | undefined) => (validForRef.current = value)}
          onSetValidForUnit={(value: ValidForUnit) => (validForUnitRef.current = value)}
          onSetClaims={(value: number | undefined) => (claimsRef.current = value)}
          onSetCode={(value: string) => (codeRef.current = value)}
        />
      </WizardStep>,
      <WizardStep name={t('Create token')} id="2-step" key="2-step">
        <DownloadGrant grant={grant} />
      </WizardStep>
    ],
    [grant, name, t]
  );

  return (
    <Wizard
      key={step}
      startIndex={step}
      title=""
      header={
        <WizardHeader
          title={t('Create token')}
          description={t('A token indicating authorization to generate a link.')}
          isCloseHidden={true}
        />
      }
      footer={
        <>
          {validationError && step === 1 && (
            <PageSection variant={PageSectionVariants.light}>
              <Alert variant="danger" title={t('An error occurred')} aria-live="polite" isInline>
                {validationError}
              </Alert>
            </PageSection>
          )}

          <WizardFooterWrapper>
            <Button
              onClick={step - 1 === ButtonName.length - 1 ? onCancel : handleNextStep}
              isDisabled={step === 2 && !grant?.status}
            >
              {t(ButtonName[step - 1])}
            </Button>
            {step === 1 && (
              <Button variant="link" onClick={onCancel}>
                {t('Cancel')}
              </Button>
            )}
            {step === 2 && (!grant?.status || !!validationError) && (
              <Button variant="link" onClick={onCancel}>
                {t('Dismiss')}
              </Button>
            )}
          </WizardFooterWrapper>
        </>
      }
    >
      {...steps}
    </Wizard>
  );
};

export default GrantForm;
