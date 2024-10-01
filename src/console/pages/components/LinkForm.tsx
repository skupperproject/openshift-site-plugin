import React, {
  useState,
  FC,
  useCallback,
  FormEvent,
  useEffect,
  useReducer,
  createContext,
  useContext,
  ReactNode
} from 'react';

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
  Alert,
  PageSectionVariants,
  PageSection,
  useWizardContext
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';

import { RESTApi } from '@API/REST.api';
import step1 from '@assets/step1.png';
import step2 from '@assets/step2.png';
import step3 from '@assets/step3.png';
import step4 from '@assets/step4.png';
import { CR_STATUS_OK, I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import InstructionBlock from '@core/components/InstructionBlock';
import { createAccessTokenRequest } from '@core/utils/createCRD';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdParams } from '@interfaces/CRD_AccessToken';
import { HTTPError } from '@interfaces/REST.interfaces';

const DEFAULT_COST = '1';
const WizardContentHeight = '400px';

const initialState = {
  name: '',
  cost: DEFAULT_COST,
  fileName: '',
  fileContent: ''
};

interface FormState {
  name: string;
  cost: string;
  fileName: string;
  fileContent: string;
}

type FormAction =
  | { type: 'SET_FILE_NAME'; payload: string }
  | { type: 'SET_FILE_CONTENT'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_COST'; payload: string };

// Reducer function to update form fields
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_COST':
      return { ...state, cost: action.payload };
    case 'SET_FILE_NAME':
      return { ...state, fileName: action.payload };
    case 'SET_FILE_CONTENT':
      return { ...state, fileContent: action.payload };
    default:
      return state;
  }
}

const FormContext = createContext<{
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  validated: string | undefined;
  setValidated: React.Dispatch<React.SetStateAction<string | undefined>>;
}>({
  state: initialState,
  dispatch: () => {},
  isLoading: false,
  setIsLoading: () => {},
  validated: undefined,
  setValidated: () => {}
});

const FormProvider: FC<{ children: ReactNode }> = function ({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState<string | undefined>(undefined);

  return (
    <FormContext.Provider value={{ state, dispatch, isLoading, setIsLoading, validated, setValidated }}>
      {children}
    </FormContext.Provider>
  );
};
export const useFormContext = () => useContext(FormContext);

const LinkForm: FC<{ onSubmit: () => void; onCancel: () => void; siteId: string }> = function ({ onSubmit, onCancel }) {
  const { t } = useTranslation(I18nNamespace);

  const CreateLinkWizard = function () {
    return (
      <FormProvider>
        <Wizard
          title=""
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
            <HowTo />
          </WizardStep>

          <WizardStep name={t('Create a connection')} id="2-step" key="2-step">
            <CreateForm />
          </WizardStep>

          <WizardStep name={t('Summary')} id="3-step" key="3-step">
            <Summary />
          </WizardStep>
        </Wizard>
      </FormProvider>
    );
  };

  return <CreateLinkWizard />;
};

export default LinkForm;

const HowTo = function () {
  const { t } = useTranslation(I18nNamespace);

  return (
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
          title={t('Step 2 - Generate a grant from the remote site')}
          description={t('Generate the grant with the web console or the CLI.')}
          link1="https://skupper.io/docs/cli/tokens.html"
          link1Text="More information on token creation"
          link2="https://skupper.io/docs/cli/index.html"
          link2Text="More information CLI"
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={step3}
          title={t('Step 3 - Download the grant file')}
          description={t('Download the grant file from the remote site after generating it.')}
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={step4}
          title={t('Step 4 - Use the grant to create a link')}
          description={t('Use the grant to create a link from the local site to the remote site.')}
        />
      </StackItem>
    </Stack>
  );
};

const CreateForm = function () {
  const { t } = useTranslation(I18nNamespace);
  const {
    state: { name, fileName, cost, fileContent },
    dispatch
  } = useFormContext();

  const handleFileInputChange = useCallback(
    (_: DropEvent, file: File) => {
      dispatch({ type: 'SET_FILE_NAME', payload: getFilenameWithoutExtension(file.name) });
    },
    [dispatch]
  );

  const handleFileContentChange = useCallback(
    (_: DropEvent, value: string) => {
      dispatch({ type: 'SET_FILE_CONTENT', payload: value });
    },
    [dispatch]
  );

  const handleChangeCost = useCallback(
    (_: FormEvent, value: string) => {
      dispatch({ type: 'SET_COST', payload: value });
    },
    [dispatch]
  );

  const handleChangeName = useCallback(
    (_: FormEvent, value: string = '') => {
      dispatch({ type: 'SET_NAME', payload: value });
    },
    [dispatch]
  );

  return (
    <Form isHorizontal>
      <FormGroup isRequired label={t('Token')} fieldId="form-access-token">
        <FileUpload
          id="access-token-file"
          type="text"
          value={fileContent}
          filename={fileName}
          filenamePlaceholder="Drag and drop a file or upload one"
          browseButtonText="Upload"
          hideDefaultPreview={true}
          isClearButtonDisabled={true}
          onFileInputChange={handleFileInputChange}
          onDataChange={handleFileContentChange}
        />
      </FormGroup>

      <FormGroup label={t('Name')} fieldId="form-name-input">
        <TextInput
          isRequired
          id="simple-form-name-01"
          name="simple-form-name-01"
          value={name}
          onChange={handleChangeName}
        />
      </FormGroup>

      <FormGroup label={t('Cost')} fieldId="form-cost-input">
        <TextInput
          isRequired
          id="form-cost"
          name="form-cost"
          aria-describedby="form cost input"
          value={cost}
          onChange={handleChangeCost}
        />
      </FormGroup>
    </Form>
  );
};

const Summary = function () {
  const { t } = useTranslation(I18nNamespace);
  const {
    state: { name, fileName },
    setIsLoading: setExternalLoading,
    validated: error,
    setValidated
  } = useFormContext();

  const [isLoading, setIsLoading] = useState(true);
  const { data: accessToken } = useQuery({
    queryKey: ['get-access-token-query', name || fileName],
    queryFn: () => RESTApi.findAccessToken(name || fileName),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  const { data: link } = useQuery({
    queryKey: ['get-link-query', name || fileName],
    queryFn: () => RESTApi.findLink(name || fileName),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  useEffect(() => {
    if (accessToken?.status?.status || link?.status?.status) {
      if (link?.status?.status === CR_STATUS_OK) {
        setValidated(undefined);
        setIsLoading(false);
        setExternalLoading(false);
      } else if (
        accessToken?.status?.status !== CR_STATUS_OK ||
        (accessToken?.status?.status && link?.status?.status && link?.status?.status !== CR_STATUS_OK)
      ) {
        setIsLoading(false);
        setExternalLoading(false);
        setValidated(link?.status?.status || accessToken?.status?.status);
      }
    }
  }, [accessToken?.status?.status, link?.status?.status, setValidated, setIsLoading, setExternalLoading]);

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
              <Text>{t('Click Done to close the window')}</Text>
            </TextContent>
          </FlexItem>
        </Flex>
      </Bullseye>
    </div>
  );
};

const ButtonName: string[] = ['Next', 'Create', 'Done'];

interface FooterProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const Footer: FC<FooterProps> = function ({ onCancel, onSubmit }) {
  const { t } = useTranslation();
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const {
    state: { name, fileContent },
    isLoading,
    validated,
    setIsLoading,
    setValidated,
    dispatch
  } = useFormContext();

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

function getFilenameWithoutExtension(filename: string) {
  const parts = filename.split('.');
  parts.pop();

  return parts.join('.');
}
