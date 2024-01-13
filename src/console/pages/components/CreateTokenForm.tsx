import { useState, FC, useCallback, useMemo, useRef, MutableRefObject, useEffect } from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  Popover,
  Button,
  FormAlert,
  Alert,
  Wizard,
  WizardFooter,
  Title,
  Stack,
  StackItem
} from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { HTTPError } from '@API/REST.interfaces';
import { I18nNamespace } from '@config/config';
import { createTokenRequest } from '@K8sResources/resources';
import { K8sResourceSecret } from '@K8sResources/resources.interfaces';

const DEFAULT_CLAIM_EXPIRATION = '15m';
const DEFAULT_CLAIMS_MADE = '1';

type SubmitFunction = (data: K8sResourceSecret) => void;

type CancelFunction = () => void;

const ButtonName: string[] = ['Create', 'Done'];

const TokenForm: FC<{ onSubmit?: SubmitFunction; onCancel?: CancelFunction }> = function ({ onCancel }) {
  const { t } = useTranslation(I18nNamespace);

  const [validated, setValidated] = useState<string | undefined>();

  const nameRef = useRef<string>('');
  const claimExpirationRef = useRef<string>(DEFAULT_CLAIM_EXPIRATION);
  const claimsMadeRef = useRef<string>(DEFAULT_CLAIMS_MADE);

  const [step, setStep] = useState(1);
  const [isTokenDownloaded, setIsTokenDownloaded] = useState(false);

  const { data: token, refetch: refetchFindToken } = useQuery({
    queryKey: ['find-token-query', nameRef.current],
    queryFn: () => RESTApi.findSecret(nameRef.current),
    cacheTime: 0,
    enabled: false
  });

  const mutation = useMutation({
    mutationFn: (data: K8sResourceSecret) => RESTApi.createToken(data),
    onError: (data: HTTPError) => {
      setValidated(data.descriptionMessage);
    },
    onSuccess: () => {
      setStep(step + 1);
    }
  });

  const handleSubmit = useCallback(() => {
    const data = {
      claimExpiration: claimExpirationRef.current,
      claimsMade: claimsMadeRef.current,
      name: nameRef.current
    };

    if (!nameRef.current) {
      setValidated(t('Fill out all required fields before continuing'));

      return;
    }

    console.log(data);
    mutation.mutate({ ...createTokenRequest(nameRef.current) });
  }, [mutation, t]);

  const handleDownload = useCallback(() => {
    refetchFindToken();
    setIsTokenDownloaded(true);
  }, [refetchFindToken]);

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      handleSubmit();

      return;
    }
  }, [handleSubmit, step]);

  useEffect(() => {
    if (token && nameRef.current) {
      // normalize the token to be used from remote sites
      delete token.metadata?.namespace;
      delete token.metadata?.resourceVersion;
      delete token.metadata?.creationTimestamp;

      const blob = new Blob([stringify(token)], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${nameRef.current}.yaml`;
      link.setAttribute('download', `${nameRef.current}.yaml`);

      document.body.appendChild(link).click();
      document.body.removeChild(link);
    }
  }, [token]);

  const steps = useMemo(
    () => [
      {
        name: t('Configuration'),
        component: (
          <CreateForm
            validated={validated}
            nameRef={nameRef}
            claimExpirationRef={claimExpirationRef}
            claimsMadeRef={claimsMadeRef}
          />
        )
      },
      {
        name: t('Download'),
        component: <DownloadToken handleDownload={handleDownload} />
      }
    ],
    [handleDownload, t, validated]
  );

  return (
    <Wizard
      title="Create token"
      description="A token indicating authorization to generate a link."
      isOpen={true}
      steps={steps}
      startAtStep={step}
      onClose={onCancel}
      footer={
        <WizardFooter>
          <Button
            onClick={step - 1 === ButtonName.length - 1 ? onCancel : handleNextStep}
            isDisabled={!isTokenDownloaded && step === 2}
          >
            {t(ButtonName[step - 1])}
          </Button>
          <Button variant="link" onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </WizardFooter>
      }
    />
  );
};

export default TokenForm;

const CreateForm: FC<{
  validated: string | undefined;
  nameRef: MutableRefObject<string>;
  claimExpirationRef: MutableRefObject<string>;
  claimsMadeRef: MutableRefObject<string>;
}> = function ({ validated, nameRef, claimExpirationRef, claimsMadeRef }) {
  const { t } = useTranslation(I18nNamespace);

  const [name, setName] = useState('');
  const [claimExpiration, setClaimExpiration] = useState(DEFAULT_CLAIM_EXPIRATION);
  const [claimsMade, setClaimsMade] = useState(DEFAULT_CLAIMS_MADE);

  const handleSetName = (value: string) => {
    setName(value);
    nameRef.current = value;
  };

  const handleSetClaimExpiration = (value: string) => {
    if (value) {
      setClaimExpiration(value);
      claimExpirationRef.current = value;
    }
  };

  const handleSetClaimsMade = (value: string) => {
    setClaimsMade(value);
    claimsMadeRef.current = value;
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
            label={t('Name')}
            style={{ gridTemplateColumns: '1fr 4fr' }}
            labelIcon={
              <Popover bodyContent={<div>...</div>}>
                <button type="button" onClick={(e) => e.preventDefault()} className="pf-c-form__group-label-help">
                  <HelpIcon />
                </button>
              </Popover>
            }
            isRequired
            fieldId="simple-form-cost-01"
          >
            <TextInput isRequired type="text" value={name} onChange={handleSetName} />
          </FormGroup>

          <FormGroup
            label={t('Expiration time')}
            style={{ gridTemplateColumns: '1fr 4fr' }}
            labelIcon={
              <Popover bodyContent={<div>...</div>}>
                <button type="button" onClick={(e) => e.preventDefault()} className="pf-c-form__group-label-help">
                  <HelpIcon />
                </button>
              </Popover>
            }
            fieldId="simple-form-cost-01"
          >
            <TextInput isRequired type="text" value={claimExpiration} onChange={handleSetClaimExpiration} />
          </FormGroup>
          <FormGroup
            label={t('Claims')}
            style={{ gridTemplateColumns: '1fr 4fr' }}
            labelIcon={
              <Popover bodyContent={<div>....</div>}>
                <button type="button" onClick={(e) => e.preventDefault()} className="pf-c-form__group-label-help">
                  <HelpIcon />
                </button>
              </Popover>
            }
            fieldId="simple-form-Ingress-01"
          >
            <TextInput isRequired type="number" value={claimsMade} onChange={handleSetClaimsMade} />
          </FormGroup>
        </Form>
      </StackItem>
    </Stack>
  );
};

const DownloadToken: FC<{
  handleDownload: () => void;
}> = function ({ handleDownload }) {
  const { t } = useTranslation(I18nNamespace);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1">{t('Download')}</Title>
      </StackItem>

      <StackItem>
        <Alert
          variant="success"
          isInline
          title={t('The token has successfully been created. Click Download to save the token file.')}
        />
      </StackItem>

      <StackItem>
        <Title headingLevel="h4">
          {t('Once you have downloaded the token file, you can use it to connect a remote site.')}
        </Title>
      </StackItem>

      <StackItem>
        <Button variant="link" onClick={handleDownload} style={{ paddingLeft: 0 }} icon={<DownloadIcon />}>
          <small>{t('Download the token file')}</small>
        </Button>
      </StackItem>
    </Stack>
  );
};
