import { useState, FC, useCallback, useMemo, useRef, FormEvent } from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  Button,
  Alert,
  Wizard,
  Title,
  Stack,
  StackItem,
  InputGroup,
  FormSelect,
  FormSelectOption,
  WizardFooterWrapper,
  WizardHeader,
  WizardStep,
  InputGroupItem,
  Spinner,
  PageSection,
  PageSectionVariants
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import cStep1 from '@assets/cstep1.png';
import cStep2 from '@assets/cstep2.png';
import cStep3 from '@assets/cstep3.png';
import { CR_STATUS_OK, I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import InstructionBlock from '@core/components/InstructionBlock';
import { createAccessGrantRequest } from '@core/utils/createCRD';
import { AccessGrantCrdParams, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { HTTPError } from '@interfaces/REST.interfaces';
import useValidatedInput from 'console/hooks/useValidation';

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

  const { validated, validateInput } = useValidatedInput();

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
      validateInput(data.descriptionMessage);
    },
    onSuccess: () => {
      validateInput(undefined);
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

  const handleDismiss = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handleDownload = useCallback(() => {
    if (grant?.status && name) {
      const blob = new Blob([stringify(grant)], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${name}.yaml`;
      link.setAttribute('download', `${name}.yaml`);

      document.body.appendChild(link).click();
      document.body.removeChild(link);
    }
  }, [grant, name]);

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      handleSubmit();
    }
  }, [handleSubmit, step]);

  const steps = useMemo(
    () => [
      <WizardStep name={t('Configuration')} id="1-step" key="1-step">
        <CreateForm
          name={name}
          onSetName={(value: string) => setName(value)}
          onSetValidFor={(value: number | undefined) => (validForRef.current = value)}
          onSetValidForUnit={(value: ValidForUnit) => (validForUnitRef.current = value)}
          onSetClaims={(value: number | undefined) => (claimsRef.current = value)}
          onSetCode={(value: string) => (codeRef.current = value)}
        />
      </WizardStep>,
      <WizardStep name={t('Create link - How to')} id="2-step" key="2-step">
        <DownloadToken
          handleDownload={handleDownload}
          isDisabled={!grant?.status || grant.status.status !== CR_STATUS_OK}
        />
      </WizardStep>
    ],
    [grant?.status, handleDownload, name, t]
  );

  return (
    <Wizard
      key={step}
      startIndex={step}
      title=""
      header={
        <WizardHeader
          title={t('Create grant')}
          description={t('A token indicating authorization to generate a link.')}
          isCloseHidden={true}
        />
      }
      footer={
        <>
          {validated && step === 1 && (
            <PageSection variant={PageSectionVariants.light}>
              <Alert variant="danger" title={t('An error occurred')} aria-live="polite" isInline>
                {validated}
              </Alert>
            </PageSection>
          )}

          <WizardFooterWrapper>
            <Button
              onClick={step - 1 === ButtonName.length - 1 ? onCancel : handleNextStep}
              isDisabled={(step === 2 && !grant?.status) || (step === 1 && !name)}
            >
              {t(ButtonName[step - 1])}
            </Button>
            {(step === 1 || (step === 2 && validated)) && (
              <Button variant="link" onClick={onCancel}>
                {t('Cancel')}
              </Button>
            )}
            {step === 2 && (!grant?.status || grant.status.status !== CR_STATUS_OK) && (
              <Button variant="link" onClick={handleDismiss}>
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

const options = [
  { value: ValidForUnit.Minutes, label: 'min' },
  { value: ValidForUnit.Hours, label: 'hr' }
];

const CreateForm: FC<{
  name?: string;
  onSetName(value: string): void;
  onSetValidFor(value: number | undefined): void;
  onSetValidForUnit(value: ValidForUnit): void;
  onSetClaims(value: number | undefined): void;
  onSetCode(value: string): void;
}> = function ({ name, onSetName, onSetValidFor, onSetValidForUnit, onSetClaims, onSetCode }) {
  const { t } = useTranslation(I18nNamespace);

  const [expiration, setExpiration] = useState<number | undefined>(DEFAULT_EXPIRATION);
  const [claims, setClaims] = useState<number | undefined>(DEFAULT_CLAIMS);
  const [timeDimension, setTimeDimension] = useState(options[0].value);
  const [code, setCode] = useState<string>('');

  const handleSetName = (_: FormEvent, value: string) => {
    onSetName(value);
  };

  const handleSetClaimExpiration = (value: string) => {
    let numberValue: number | undefined = Number(value);

    // If the input is not a valid number or less than/equal to 0, set numberValue to 1
    if (isNaN(numberValue) || numberValue <= 0) {
      numberValue = DEFAULT_EXPIRATION;
    }

    // If the input is empty, set numberValue to undefined
    if (!value) {
      numberValue = undefined;
    }

    setExpiration(numberValue);
    onSetValidFor(numberValue);
  };
  const handleSetClaimsMade = (value: string) => {
    let numberValue: number | undefined = Number(value);

    if (isNaN(numberValue) || numberValue <= 0) {
      numberValue = DEFAULT_CLAIMS;
    }

    if (!value) {
      numberValue = undefined;
    }

    setClaims(numberValue);
    onSetClaims(numberValue);
  };

  const onChangeTimeDimension = (value: ValidForUnit) => {
    setTimeDimension(value);
    onSetValidForUnit(value);
  };

  const handleSetCode = (value: string) => {
    setCode(value);
    onSetCode(value);
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1">{t('Configuration')}</Title>
      </StackItem>

      <StackItem>
        <Form isHorizontal>
          <FormGroup fieldId="filename-input" isRequired label={t('File name')} title="">
            <TextInput aria-label="filename input" isRequired type="text" value={name} onChange={handleSetName} />
          </FormGroup>

          <FormGroup
            fieldId="redemption-allowed-input"
            label={t('Redemptions Allowed')}
            labelIcon={<TooltipInfoButton content={t('tooltipRedemptionAllowed')} />}
            title=""
          >
            <TextInput
              aria-label="redemption allowed input"
              value={claims}
              onChange={(_, value) => handleSetClaimsMade(value)}
              style={{ maxWidth: '100%' }}
            />
          </FormGroup>

          <FormGroup
            fieldId="code-input"
            label={t('Code')}
            labelIcon={<TooltipInfoButton content={t('tooltipCode')} />}
            title=""
          >
            <TextInput aria-label="code input" value={code} onChange={(_, value) => handleSetCode(value)} />
          </FormGroup>

          <FormGroup
            fieldId="expirationWindow-input"
            label={t('Valid for')}
            labelIcon={<TooltipInfoButton content={t('tooltipExpirationWindow')} />}
            title=""
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  aria-label="expiration window input"
                  value={expiration}
                  onChange={(_, value) => handleSetClaimExpiration(value)}
                />
              </InputGroupItem>
              <InputGroupItem style={{ width: '70px' }}>
                <FormSelect
                  value={timeDimension}
                  onChange={(_, value) => onChangeTimeDimension(value as ValidForUnit)}
                  aria-label="form valid for select"
                >
                  {options.map((option, index) => (
                    <FormSelectOption key={index} value={option.value} label={option.label} />
                  ))}
                </FormSelect>
              </InputGroupItem>
            </InputGroup>
          </FormGroup>
        </Form>
      </StackItem>
    </Stack>
  );
};

const DownloadToken: FC<{
  isDisabled: boolean;
  handleDownload: () => void;
}> = function ({ isDisabled, handleDownload }) {
  const { t } = useTranslation(I18nNamespace);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1">{t('Create link - How to')}</Title>
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={cStep1}
          title={t('Step 1 - Download the grant file')}
          description={t('Click the button to download the grant file.')}
          component={
            <Button
              variant="link"
              onClick={handleDownload}
              style={{ paddingLeft: 0 }}
              icon={<DownloadIcon />}
              isDisabled={isDisabled}
            >
              <small>
                {isDisabled ? t('Generating the grant, please wait...') : t('Download the grant')}
                {isDisabled && <Spinner size="md" />}
              </small>
            </Button>
          }
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={cStep2}
          title={t('Step 2 - Navigate to a remote Openshift cluster')}
          description={t('Access the plugin TAB of a remote OpenShift cluster to establish a link with this site.')}
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={cStep3}
          title={t('Step 3 - Upload the token file')}
          description={t(
            'Navigate to the Link section, then click on the Create Link button and follow the provided steps.'
          )}
        />
      </StackItem>
    </Stack>
  );
};
