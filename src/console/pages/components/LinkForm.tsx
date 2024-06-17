import { useState, FC, useCallback, useMemo, useRef, FormEvent } from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  Button,
  FileUpload,
  Wizard,
  StackItem,
  Stack,
  Icon,
  Bullseye,
  Spinner,
  TextContent,
  Text,
  TextVariants,
  Flex,
  FlexItem,
  DropEvent,
  WizardFooterWrapper,
  WizardHeader,
  WizardStep,
  FormAlert,
  Alert
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';

import { RESTApi } from '@API/REST.api';
import step1 from '@assets/step1.png';
import step2 from '@assets/step2.png';
import step3 from '@assets/step3.png';
import step4 from '@assets/step4.png';
import { I18nNamespace } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import InstructionBlock from '@core/components/InstructionBlock';
import { createClaimRequest } from '@core/utils/createCRD';
import { ClaimCrdParams, GrantCrdResponse } from '@interfaces/CRD.interfaces';
import { HTTPError } from '@interfaces/REST.interfaces';

const DEFAULT_COST = '1';
const ButtonName: string[] = ['Next', 'Create', 'Done'];
const WizardContentHeight = '400px';

type SubmitFunction = () => void;

type CancelFunction = () => void;

const LinkForm: FC<{ onSubmit: SubmitFunction; onCancel: CancelFunction; siteId: string }> = function ({
  onSubmit,
  onCancel
}) {
  const { t } = useTranslation(I18nNamespace);

  const fileContentRef = useRef<string>('');
  const nameRef = useRef<string>('');
  const costRef = useRef<string>(DEFAULT_COST);

  const [validated, setValidated] = useState<string | undefined>();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const mutationCreate = useMutation({
    mutationFn: (data: ClaimCrdParams) => RESTApi.createClaim(data),
    onMutate: () => {
      setIsLoading(true);
      setStep(step + 1);
    },
    onError: (data: HTTPError) => {
      setValidated(data.descriptionMessage);
      setIsLoading(false);
    },
    onSuccess: () => {
      setIsLoading(false);
      setValidated(undefined);
    }
  });

  const handleChangeData = useCallback((data: Record<string, string>) => {
    if (data.name) {
      nameRef.current = data.name;
    }

    if (data.cost) {
      costRef.current = data.cost;
    }

    if (data.filename) {
      fileContentRef.current = data.filename;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!fileContentRef.current) {
      setValidated(t('Fill out all required fields before continuing'));

      return;
    }

    try {
      const JsonFile = parse(fileContentRef.current) as GrantCrdResponse;
      const { metadata, status } = JsonFile;

      if (!status) {
        setValidated(t('Invalid Grant format'));

        return;
      }

      if (!status.ca || !status.secret || !status.url) {
        setValidated(t('Missing ca, secret or url. Please check your Grant'));

        return;
      }

      nameRef.current = nameRef.current || metadata.name;
      const data = createClaimRequest({
        metadata: {
          name: nameRef.current
        },
        spec: {
          ca: status.ca,
          secret: status.secret,
          url: status.url
        }
      });

      mutationCreate.mutate(data);
    } catch (e) {
      setValidated(t('Invalid Grant format'));
    }
  }, [mutationCreate, t]);

  const handlePreviousStep = useCallback(() => {
    setValidated(undefined);
    setStep(step - 1);
  }, [step]);

  const handleNextStep = useCallback(() => {
    setValidated(undefined);

    if (step === 2) {
      handleSubmit();

      return;
    }

    if (step === 3) {
      onSubmit();
    }

    setStep(step + 1);
  }, [handleSubmit, onSubmit, step]);

  const CreateLinkWizard = function () {
    const steps = useMemo(
      () => [
        <WizardStep name={t('How-To')} id="1-step" key="1-step">
          <Stack hasGutter>
            <StackItem>
              <InstructionBlock
                img={step1}
                title={t('Step 1 - Visit a remote site')}
                description={t('Open a new browser window or tab and visit the remote site.')}
              />
            </StackItem>

            <StackItem>
              <InstructionBlock
                img={step2}
                title={t('Step 2 - Generate a token file from the remote site')}
                description={t('Generate the token with the web console or the CLI.')}
                link1="https://skupper.io/docs/cli/tokens.html"
                link1Text="More information on token creation"
                link2="https://skupper.io/docs/cli/index.html"
                link2Text="More information CLI"
              />
            </StackItem>

            <StackItem>
              <InstructionBlock
                img={step3}
                title={t('Step 3 - Download the token file')}
                description={t('Download the token file from the remote site after generating it.')}
              />
            </StackItem>

            <StackItem>
              <InstructionBlock
                img={step4}
                title={t('Step 4 - Use a token to create a link')}
                description={t('Use the token file to create a link from the local site to the remote site.')}
              />
            </StackItem>
          </Stack>
        </WizardStep>,
        <WizardStep name={t('Create a connection')} id="2-step" key="2-step">
          <CreateForm validated={validated} onSubmit={handleChangeData} />
        </WizardStep>,
        <WizardStep name={t('Summary')} id="3-step" key="3-step">
          <Summary isLoading={isLoading} error={validated} />{' '}
        </WizardStep>
      ],
      []
    );

    return (
      <Wizard
        startIndex={step}
        title=""
        header={
          <WizardHeader
            title={t('Create link')}
            description="Links enable communication between sites. Once sites are linked, they form a Skupper network."
            isCloseHidden={true}
          />
        }
        footer={
          <WizardFooterWrapper>
            {(step === 2 || (step === 3 && (isLoading || validated))) && (
              <Button variant="secondary" onClick={handlePreviousStep} isDisabled={isLoading}>
                {t('Back')}
              </Button>
            )}
            <Button onClick={handleNextStep} isDisabled={isLoading || (step === 3 && !!validated)}>
              {t(ButtonName[step - 1])}
            </Button>

            <Button variant="link" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          </WizardFooterWrapper>
        }
      >
        {...steps}
      </Wizard>
    );
  };

  return <CreateLinkWizard />;
};

export default LinkForm;

const CreateForm: FC<{ validated: string | undefined; onSubmit: (data: Record<string, string>) => void }> = function ({
  validated,
  onSubmit
}) {
  const { t } = useTranslation(I18nNamespace);

  const [name, setName] = useState('');
  const [cost, setCost] = useState(DEFAULT_COST);
  const [filename, setFilename] = useState('');
  const [fileContent, setFileContent] = useState('');

  const handleFileInputChange = useCallback(
    (_: DropEvent, file: File) => {
      setFilename(file.name);
      onSubmit({ filename: file.name });
    },
    [onSubmit]
  );

  const handleFileContentChange = useCallback(
    (_: DropEvent, value: string) => {
      setFileContent(value);
      onSubmit({ filename: value });
    },
    [onSubmit]
  );

  const handleChangeCost = useCallback(
    (_: FormEvent, value: string) => {
      setCost(value);
      onSubmit({ cost: value });
    },
    [onSubmit]
  );

  const handleChangeName = useCallback(
    (_: FormEvent, value: string = '') => {
      setName(value);
      onSubmit({ name: value });
    },
    [onSubmit]
  );

  return (
    <Form isHorizontal>
      {validated && (
        <FormAlert>
          <Alert variant="danger" title={validated} aria-live="polite" isInline />
        </FormAlert>
      )}
      <FormGroup
        isRequired
        label={t('Token')}
        labelIcon={<TooltipInfoButton content="...." />}
        fieldId="simple-form-Ingress-01"
      >
        <FileUpload
          id="token-file"
          type="text"
          value={fileContent}
          filename={filename}
          filenamePlaceholder="Drag and drop a file or upload one"
          browseButtonText="Upload"
          hideDefaultPreview={true}
          isClearButtonDisabled={true}
          onFileInputChange={handleFileInputChange}
          onDataChange={handleFileContentChange}
        />
      </FormGroup>

      <FormGroup label={t('Name')} labelIcon={<TooltipInfoButton content="...." />} fieldId="simple-form-name-01">
        <TextInput
          isRequired
          type="text"
          id="simple-form-name-01"
          name="simple-form-name-01"
          value={name}
          onChange={handleChangeName}
        />
      </FormGroup>

      <FormGroup label={t('Cost')} labelIcon={<TooltipInfoButton content="...." />} fieldId="simple-form-cost-01">
        <TextInput
          isRequired
          type="text"
          id="simple-form-cost-01"
          name="simple-form-cost-01"
          aria-describedby="simple-form-cost-01-helper"
          value={cost}
          onChange={handleChangeCost}
        />
      </FormGroup>
    </Form>
  );
};

const Summary: FC<{ isLoading: boolean; error: string | undefined }> = function ({ isLoading, error }) {
  const { t } = useTranslation(I18nNamespace);

  if (isLoading) {
    return (
      <div style={{ height: WizardContentHeight }}>
        <Bullseye>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Spinner />
            <p>{t('Creating link...Click Dismiss to leave the page')}</p>
          </div>
        </Bullseye>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: WizardContentHeight }}>
        <Bullseye>
          <Flex alignItems={{ default: 'alignItemsCenter' }} direction={{ default: 'column' }}>
            <FlexItem>
              <Icon size="xl" status="danger">
                <ExclamationCircleIcon />
              </Icon>
            </FlexItem>

            <FlexItem>
              <TextContent style={{ textAlign: 'center' }}>
                <Text component={TextVariants.h2} style={{ textAlign: 'center' }}>
                  {t('It seems there was an error while creating the link')}
                </Text>
                <Text>{error}</Text>
              </TextContent>
            </FlexItem>
          </Flex>
        </Bullseye>
      </div>
    );
  }

  return (
    <div style={{ height: WizardContentHeight }}>
      <Bullseye>
        <Flex alignItems={{ default: 'alignItemsCenter' }} direction={{ default: 'column' }}>
          <FlexItem>
            <Icon size="xl" status="success">
              <CheckCircleIcon />
            </Icon>
          </FlexItem>

          <FlexItem>
            <TextContent>
              <Text component={TextVariants.h2} style={{ textAlign: 'center' }}>
                {t('Link created')}
              </Text>
              <Text>{t('Click "Done" to close the window')}</Text>
            </TextContent>
          </FlexItem>
        </Flex>
      </Bullseye>
    </div>
  );
};
