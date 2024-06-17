import { useState, FC, useCallback, useMemo, useRef, FormEvent } from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  Button,
  FormAlert,
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
  Spinner
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import cStep1 from '@assets/cstep1.png';
import cStep2 from '@assets/cstep2.png';
import cStep3 from '@assets/cstep3.png';
import { I18nNamespace } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import InstructionBlock from '@core/components/InstructionBlock';
import { createGrantRequest } from '@core/utils/createCRD';
import { GrantParams } from '@interfaces/CRD.interfaces';
import { HTTPError } from '@interfaces/REST.interfaces';

const DEFAULT_VALID_FOR = 15;
const DEFAULT_CLAIMS = 1;

enum ValidForUnit {
  Minutes = 'm',
  Hours = 'h',
  Days = 'd'
}

type SubmitFunction = () => void;

type CancelFunction = () => void;

const ButtonName: string[] = ['Create', 'Done'];

const GrantForm: FC<{ onSubmit?: SubmitFunction; onCancel?: CancelFunction }> = function ({ onCancel }) {
  const { t } = useTranslation(I18nNamespace);

  const [validated, setValidated] = useState<string | undefined>();

  const nameRef = useRef<string>('');
  const validForRef = useRef<number | undefined>(DEFAULT_VALID_FOR);
  const validForUnitRef = useRef<ValidForUnit>(ValidForUnit.Minutes);
  const claimsRef = useRef<number | undefined>(DEFAULT_CLAIMS);

  const [step, setStep] = useState(1);

  const { data: grant } = useQuery({
    queryKey: ['find-token-query', nameRef.current],
    queryFn: () => RESTApi.findGrant(nameRef.current),
    cacheTime: 0,
    enabled: step === 2,
    refetchInterval(data) {
      return data?.status ? 0 : 5000;
    }
  });

  const mutationCreate = useMutation({
    mutationFn: (data: GrantParams) => RESTApi.createGrant(data),
    onError: (data: HTTPError) => {
      setValidated(data.descriptionMessage);
    },
    onSuccess: () => {
      setValidated(undefined);
      setStep(step + 1);
    }
  });

  // const mutationDelete = useMutation({
  //   mutationFn: (name: string) => RESTApi.deleteGrant(name),
  //   onError: (data: HTTPError) => {
  //     setValidated(data.descriptionMessage);
  //   },
  //   onSuccess: onCancel
  // });

  const handleSubmit = useCallback(() => {
    if (!nameRef.current) {
      setValidated(t('Fill out all required fields before continuing'));

      return;
    }

    const metadata = {
      name: nameRef.current
    };

    const spec = {
      validFor: `${validForRef.current || DEFAULT_VALID_FOR}${validForUnitRef.current}`,
      claims: claimsRef.current || DEFAULT_CLAIMS
    };

    mutationCreate.mutate(createGrantRequest({ metadata, spec }));
  }, [mutationCreate, t]);

  const handleDismiss = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handleDownload = useCallback(() => {
    if (grant?.status && nameRef.current) {
      const blob = new Blob([stringify(grant)], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${nameRef.current}.yaml`;
      link.setAttribute('download', `${nameRef.current}.yaml`);

      document.body.appendChild(link).click();
      document.body.removeChild(link);
    }
  }, [grant]);

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      handleSubmit();
    }
  }, [handleSubmit, step]);

  const steps = useMemo(
    () => [
      <WizardStep name={t('Configuration')} id="1-step" key="1-step">
        <CreateForm
          validated={validated}
          onSetName={(value: string) => (nameRef.current = value)}
          onSetValidFor={(value: number | undefined) => (validForRef.current = value)}
          onSetValidForUnit={(value: ValidForUnit) => (validForUnitRef.current = value)}
          onSetClaims={(value: number | undefined) => (claimsRef.current = value)}
        />
      </WizardStep>,
      <WizardStep name={t('Create link - How to')} id="2-step" key="2-step">
        <DownloadToken handleDownload={handleDownload} isDisabled={!grant?.status} />
      </WizardStep>
    ],
    [grant?.status, handleDownload, t, validated]
  );

  return (
    <Wizard
      key={step}
      startIndex={step}
      title=""
      header={
        <WizardHeader
          title={t('Create token')}
          description="A token indicating authorization to generate a link."
          isCloseHidden={true}
        />
      }
      footer={
        <WizardFooterWrapper>
          <Button
            onClick={step - 1 === ButtonName.length - 1 ? onCancel : handleNextStep}
            isDisabled={step === 2 && !grant?.status}
          >
            {t(ButtonName[step - 1])}
          </Button>
          {(step === 1 || (step === 2 && validated)) && (
            <Button variant="link" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          )}
          {step === 2 && !grant?.status && (
            <Button variant="link" onClick={handleDismiss}>
              {t('Dismiss')}
            </Button>
          )}
        </WizardFooterWrapper>
      }
    >
      {...steps}
    </Wizard>
  );
};

export default GrantForm;

const options = [
  { value: ValidForUnit.Minutes, label: 'min' },
  { value: ValidForUnit.Hours, label: 'hr' },
  { value: ValidForUnit.Days, label: 'day' }
];

const CreateForm: FC<{
  validated: string | undefined;
  onSetName(value: string): void;
  onSetValidFor(value: number | undefined): void;
  onSetValidForUnit(value: ValidForUnit): void;
  onSetClaims(value: number | undefined): void;
}> = function ({ validated, onSetName, onSetValidFor, onSetValidForUnit, onSetClaims }) {
  const { t } = useTranslation(I18nNamespace);

  const [name, setName] = useState('');
  const [validFor, setValidFor] = useState<number | undefined>(DEFAULT_VALID_FOR);
  const [claims, setClaims] = useState<number | undefined>(DEFAULT_CLAIMS);
  const [timeDimension, setTimeDimension] = useState(options[0].value);

  const handleSetName = (_: FormEvent, value: string) => {
    setName(value);
    onSetName(value);
  };

  const handleSetClaimExpiration = (value: string) => {
    const numberValue = value ? Number(value) : undefined;
    setValidFor(numberValue);
    onSetValidFor(numberValue);
  };

  const handleSetClaimsMade = (value: string) => {
    const numberValue = value ? Number(value) : undefined;

    setClaims(numberValue);
    onSetClaims(numberValue);
  };

  const onChangeTimeDimension = (value: ValidForUnit) => {
    setTimeDimension(value);
    onSetValidForUnit(value);
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1">{t('Configuration')}</Title>
      </StackItem>

      <StackItem>
        <Form isHorizontal>
          {validated && (
            <FormAlert>
              <Alert variant="danger" title={validated} aria-live="polite" isInline />
            </FormAlert>
          )}

          <FormGroup
            label={t('File name')}
            labelIcon={<TooltipInfoButton content="...." />}
            isRequired
            fieldId="form-cost"
          >
            <TextInput isRequired type="text" value={name} onChange={handleSetName} aria-label="form cost" />
          </FormGroup>

          <FormGroup label={t('Claims')} labelIcon={<TooltipInfoButton content="...." />} fieldId="form-claims">
            <TextInput
              isRequired
              type="number"
              value={claims}
              onChange={(_, value) => handleSetClaimsMade(value)}
              style={{ maxWidth: '100%' }}
              aria-label="form claims"
            />
          </FormGroup>

          <FormGroup label={t('Valid for')} labelIcon={<TooltipInfoButton content="...." />} fieldId="form-cost">
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  isRequired
                  type="text"
                  value={validFor}
                  onChange={(_, value) => handleSetClaimExpiration(value)}
                  aria-label="form valid for"
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
          title={t('Step 1 - Download the token file')}
          description={t('Click the button to download the token file')}
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
          description={t('Access the plugin TAB of a remote OpenShift cluster to establish a link with this site')}
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={cStep3}
          title={t('Step 3 - Upload the token file')}
          description={t(
            'Navigate to the "Link" section, then click on the "Create Link" button and follow the provided steps.'
          )}
        />
      </StackItem>
    </Stack>
  );
};
