import { useState, FC, useCallback, DragEvent, ChangeEvent, useMemo, useRef } from 'react';

import {
  Form,
  FormGroup,
  TextInput,
  Popover,
  Button,
  FormAlert,
  Alert,
  FileUpload,
  Wizard,
  WizardFooter,
  StackItem,
  Stack,
  Title,
  Card,
  CardHeader,
  Icon,
  CardBody,
  Grid,
  GridItem,
  ClipboardCopy
} from '@patternfly/react-core';
import { CodeIcon, LaptopIcon } from '@patternfly/react-icons';
import { HelpIcon } from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { HTTPError } from '@API/REST.interfaces';
import linkTutorial from '@assets/link-tutorial.png';
import { I18nNamespace } from '@config/config';
import ExternalLink from '@core/components/ExternalLink';
import { K8sResourceLink } from '@K8sResources/resources.interfaces';

const DEFAULT_COST = '1';
const ButtonName: string[] = ['Next', 'Connect', 'Done'];
const PrimaryColor = 'var(--pf-global--primary-color--100)';

type SubmitFunction = () => void;

type CancelFunction = () => void;

const LinkForm: FC<{ onSubmit: SubmitFunction; onCancel: CancelFunction; siteId: string }> = function ({
  onSubmit,
  onCancel,
  siteId
}) {
  const { t } = useTranslation(I18nNamespace);

  const fileContentRef = useRef<string>('');
  const nameRef = useRef<string>('');
  const costRef = useRef<string>(DEFAULT_COST);

  const [validated, setValidated] = useState<string | undefined>();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: K8sResourceLink) => RESTApi.createLink(data),
    onMutate: () => {
      setIsLoading(true);
    },
    onError: (data: HTTPError) => {
      setValidated(data.descriptionMessage);
      setIsLoading(false);
    },
    onSuccess: () => {
      setIsLoading(false);
      setStep(step + 1);
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

    const JsonFile = parse(fileContentRef.current) as K8sResourceLink;

    JsonFile.metadata.name = nameRef.current || JsonFile.metadata.uid;
    JsonFile.metadata.annotations = {
      ...JsonFile.metadata.annotations,
      'skupper.io/cost': costRef.current
    };

    if (JsonFile.metadata.annotations && JsonFile.metadata.annotations['skupper.io/generated-by'] === siteId) {
      setValidated(t('You cannot link to yourself'));

      return;
    }

    mutation.mutate(JsonFile);
  }, [mutation, siteId, t]);

  const handleNextStep = useCallback(() => {
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
        {
          name: t('How-To'),
          component: (
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h1">{t('How-To')}</Title>
                <Alert
                  variant="info"
                  isInline
                  title={t('Please ensure that you have reviewed the prerequisites prior to generating a link')}
                />
              </StackItem>

              <StackItem>
                <img src={linkTutorial} alt="Link tutorial" />
              </StackItem>

              <StackItem>
                <StackItem>
                  <Title headingLevel="h3">
                    {t('Step 1 - Visit a remote site using a newly opened browser window or tab')}
                  </Title>
                </StackItem>
              </StackItem>

              <StackItem>
                <Title headingLevel="h3">{t('Step 2 - Generate the token file')}</Title>
              </StackItem>

              <StackItem>
                <Grid hasGutter>
                  <GridItem span={6}>
                    <Card isFlat isFullHeight>
                      <CardHeader>
                        <Stack>
                          <StackItem>
                            <Icon iconSize="lg">
                              <LaptopIcon color={PrimaryColor} />
                            </Icon>
                          </StackItem>

                          <StackItem>
                            <Title headingLevel="h3">{t('Generate token by Web')}</Title>
                          </StackItem>
                        </Stack>
                      </CardHeader>
                      <CardBody>
                        <Stack>
                          <StackItem>
                            {t('Continue this process in this interface to establish a connection with a remote site.')}
                          </StackItem>
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>

                  <GridItem span={6}>
                    <Card isFlat isFullHeight>
                      <CardHeader>
                        <Stack>
                          <StackItem>
                            <Icon iconSize="lg">
                              <CodeIcon color={PrimaryColor} />
                            </Icon>
                          </StackItem>

                          <StackItem>
                            <Title headingLevel="h3">{t('Generate token by CLI')}</Title>
                          </StackItem>
                        </Stack>
                      </CardHeader>
                      <CardBody>
                        <Stack hasGutter>
                          <StackItem>{t('Execute the following command in your terminal')}</StackItem>

                          <StackItem>
                            <code>
                              <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied">
                                {`skupper token create ~/secret.token.yaml`}
                              </ClipboardCopy>
                            </code>
                          </StackItem>

                          <StackItem>
                            <ExternalLink
                              text={t('More information on CLI instructions')}
                              href="https://skupper.io/docs/cli-reference/skupper.html"
                            />
                          </StackItem>
                        </Stack>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </StackItem>

              <StackItem>
                <Title headingLevel="h3">{t('Step 3 - Download the token file')}</Title>
                <p>{t('Save the token file to your device.')}</p>
              </StackItem>

              <StackItem>
                <Title headingLevel="h3">{t('Step 4 - Upload the token file from the remote site')}</Title>
                <p>{t('Use the token file to establish a link.')}</p>
              </StackItem>
            </Stack>
          )
        },
        { name: t('Create a connection'), component: <CreateForm validated={validated} onSubmit={handleChangeData} /> },
        { name: t('Summary'), component: <Summary /> }
      ],
      []
    );

    return (
      <Wizard
        title="Create link"
        description="Links enable communication between sites. Once sites are linked, they form a Skupper network."
        isOpen={true}
        steps={steps}
        startAtStep={step}
        onClose={onCancel}
        footer={
          <WizardFooter>
            {step === 2 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                {t('Back')}
              </Button>
            )}
            <Button onClick={handleNextStep} isLoading={isLoading}>
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
    (_: ChangeEvent<HTMLInputElement> | DragEvent<HTMLElement>, file: File) => {
      setFilename(file.name);
      onSubmit({ filename: file.name });
    },
    [onSubmit]
  );

  const handleFileContentChange = useCallback(
    (value: string) => {
      setFileContent(value);
      onSubmit({ filename: value });
    },
    [onSubmit]
  );

  const handleChangeCost = useCallback(
    (value: string) => {
      setCost(value);
      onSubmit({ cost: value });
    },
    [onSubmit]
  );

  const handleChangeName = useCallback(
    (value: string = '') => {
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
        style={{ gridTemplateColumns: '1fr 4fr' }}
        labelIcon={
          <Popover bodyContent={<div>...</div>}>
            <button type="button" onClick={(e) => e.preventDefault()} className="pf-c-form__group-label-help">
              <HelpIcon />
            </button>
          </Popover>
        }
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
        fieldId="simple-form-name-01"
      >
        <TextInput
          isRequired
          type="text"
          id="simple-form-name-01"
          name="simple-form-name-01"
          value={name}
          onChange={handleChangeName}
        />
      </FormGroup>

      <FormGroup
        label={t('Cost')}
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

const Summary = function () {
  const { t } = useTranslation(I18nNamespace);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1">{t('Summary')}</Title>
      </StackItem>

      <StackItem>
        <Alert
          variant="success"
          isInline
          title="The link has successfully been created. Click Done to close the window."
        />
      </StackItem>

      <StackItem>
        <Title headingLevel="h3">{t('Link Details')}</Title>
      </StackItem>
    </Stack>
  );
};
