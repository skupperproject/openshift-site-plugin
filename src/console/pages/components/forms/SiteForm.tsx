import { useState, FC, useCallback, KeyboardEvent } from 'react';

import { RESTApi } from '@API/REST.api';
import { DEFAULT_ISSUER, DEFAULT_SERVICE_ACCOUNT, I18nNamespace } from '@config/config';
import { NamespaceManager } from '@config/db';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import LoadingPage from '@core/components/Loading';
import { createSiteData } from '@core/utils/createCRD';
import useValidatedInput from '@hooks/useValidation';
import { SiteCrdParams } from '@interfaces/CRD_Site';
import { HTTPError } from '@interfaces/REST.interfaces';
import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
  FormAlert,
  Alert,
  FormSelect,
  FormSelectOption,
  Checkbox,
  Panel,
  PanelMain,
  PanelMainBody,
  Card,
  PageSection,
  PageSectionVariants,
  CardBody,
  ExpandableSection
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const options = [
  { value: 'route', label: 'route', disabled: false },
  { value: 'loadbalancer', label: 'loadbalancer', disabled: false },
  { value: 'default', label: 'default', disabled: false }
];

interface SiteFormProps {
  siteName?: string;
  linkAccess?: string;
  serviceAccount?: string;
  defaultIssuer?: string;
  ha?: boolean;
  resourceVersion?: string;
  show?: { linkAccess?: boolean; name?: boolean; ha?: boolean; serviceAccount?: boolean; defaultIssuer?: boolean };
  onCancel: () => void;
}

const SiteForm: FC<SiteFormProps> = function ({
  siteName,
  linkAccess: initLinkAccess,
  serviceAccount: initServiceAccount,
  defaultIssuer: initDefaultIssuer,
  ha: initHa,
  resourceVersion,
  show = { linkAccess: true, name: true, ha: true, serviceAccount: true, defaultIssuer: true },
  onCancel
}) {
  const [step, setNextStep] = useState(0);

  const handleReady = () => {
    if (siteName) {
      onCancel?.();
    } else {
      setNextStep(1);
    }
  };

  const steps = [
    <FormPage
      key={1}
      show={show}
      siteName={siteName}
      initLinkAccess={initLinkAccess}
      initServiceAccount={initServiceAccount}
      initDefaultIssuer={initDefaultIssuer}
      initHa={initHa}
      resourceVersion={resourceVersion}
      onSubmit={handleReady}
      onCancel={onCancel}
    />,
    <WaitSiteCreation key={2} />
  ];

  return steps[step];
};

export default SiteForm;

interface FormPageProps {
  siteName?: string;
  initLinkAccess?: string;
  initServiceAccount?: string;
  initDefaultIssuer?: string;
  initHa?: boolean;
  resourceVersion?: string;
  show: { linkAccess?: boolean; name?: boolean; ha?: boolean; serviceAccount?: boolean; defaultIssuer?: boolean };
  onSubmit: () => void;
  onCancel: () => void;
}

const FormPage: FC<FormPageProps> = function ({
  show,
  siteName,
  initLinkAccess,
  initServiceAccount,
  initDefaultIssuer,
  initHa,
  resourceVersion,
  onSubmit,
  onCancel
}) {
  const { t } = useTranslation(I18nNamespace);

  const mutationCreateOrUpdate = useMutation({
    mutationFn: (data: SiteCrdParams) => RESTApi.createOrUpdateSite(data, siteName),
    onError: (data: HTTPError) => {
      validateInput(data.descriptionMessage);
    },
    onSuccess: onSubmit
  });

  const [name, setName] = useState(siteName || NamespaceManager.getNamespace());
  const [linkAccess, setLinkAccess] = useState(initLinkAccess || options[0].value);
  const [isLinkAccessExist, setToggleLinkAccess] = useState(!!initLinkAccess || (!siteName && true));
  const [serviceAccount, setServiceAccount] = useState(initServiceAccount || '');
  const [defaultIssuer, setDefaultIssuer] = useState(initDefaultIssuer || '');
  const [ha, setHa] = useState(initHa || false);

  const [isExpanded, setIsExpanded] = useState(false);
  const { validated, validateInput } = useValidatedInput();

  const handleToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleChangeName = (value: string) => {
    // validateInput(value, [validateRFC1123Subdomain]);
    setName(value);
  };

  const handleChangeLinkAccess = (value: string) => {
    setLinkAccess(value);
  };

  const handleChangeServiceAccount = useCallback((value: string) => {
    // validateInput(value, [validateRFC1123Subdomain]);
    setServiceAccount(value);
  }, []);

  const handleDefaultIssuer = useCallback((value: string) => {
    // validateInput(value, [validateRFC1123Subdomain]);
    setDefaultIssuer(value);
  }, []);

  const handleChangeHa = useCallback((value: boolean) => {
    setHa(value);
  }, []);

  const handleSubmit = () => {
    const data: SiteCrdParams = createSiteData({
      metadata: { name, resourceVersion },
      spec: {
        linkAccess: isLinkAccessExist ? linkAccess : undefined,
        serviceAccount,
        defaultIssuer,
        ha
      }
    });

    mutationCreateOrUpdate.mutate(data);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !!name) {
      event.preventDefault(); // Prevents the default Enter key behavior
      handleSubmit();
    }
  };

  const canSubmit = !!name; //&& !validated;

  return (
    <Form isHorizontal onKeyDown={handleKeyPress} data-testid="site-form">
      {(show.name || show.ha) && (
        <FormGroup fieldId="name-input" isRequired label={t('Name')} data-testid="name-group">
          <TextInput
            data-testid="name-input"
            aria-label="form name input"
            value={name}
            onChange={(_, value) => handleChangeName(value)}
            isDisabled={!!siteName}
          />
        </FormGroup>
      )}

      {show.linkAccess && (
        <FormGroup
          label={t('Link access')}
          labelIcon={<TooltipInfoButton content={t('tooltipSiteLinkAccess')} />}
          fieldId="form-linkAccess"
          data-testid="link-access-group"
        >
          <Panel variant="bordered">
            <PanelMain>
              <PanelMainBody>
                <Checkbox
                  data-testid="link-access-checkbox"
                  id="enable-link-access"
                  label={t('Enable link access')}
                  onChange={() => setToggleLinkAccess(!isLinkAccessExist)}
                  isChecked={isLinkAccessExist}
                  className="pf-v5-u-mb-md"
                />

                <FormSelect
                  data-testid="link-access-select"
                  aria-label="form link access select"
                  value={linkAccess}
                  onChange={(_, value) => handleChangeLinkAccess(value)}
                  isDisabled={!isLinkAccessExist}
                >
                  {options.map((option, index) => (
                    <FormSelectOption
                      data-testid={`link-access-option-${option.value}`}
                      isDisabled={option.disabled}
                      key={index}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </FormSelect>
              </PanelMainBody>
            </PanelMain>
          </Panel>
        </FormGroup>
      )}

      {!(show.serviceAccount && show.ha) && (
        <SecondaryOptions
          showServiceAccount={show.serviceAccount ?? false}
          showHa={show.ha ?? false}
          showDefaultIssuer={show.defaultIssuer ?? false}
          serviceAccount={serviceAccount}
          defaultIssuer={defaultIssuer}
          ha={ha}
          onChangeServiceAccount={handleChangeServiceAccount}
          onDefaultIssuer={handleDefaultIssuer}
          onChangeHa={handleChangeHa}
        />
      )}

      {show.serviceAccount && show.ha && (
        <ExpandableSection
          data-testid="expandable-section"
          toggleText={isExpanded ? 'Show less' : 'Show more'}
          onToggle={handleToggle}
          isExpanded={isExpanded}
        >
          <SecondaryOptions
            showServiceAccount={show.serviceAccount ?? false}
            showHa={show.ha ?? false}
            showDefaultIssuer={show.defaultIssuer ?? false}
            serviceAccount={serviceAccount}
            defaultIssuer={defaultIssuer}
            ha={ha}
            onChangeServiceAccount={handleChangeServiceAccount}
            onDefaultIssuer={handleDefaultIssuer}
            onChangeHa={handleChangeHa}
          />
        </ExpandableSection>
      )}

      {validated && (
        <FormAlert>
          <Alert
            data-testid="validation-alert"
            variant="danger"
            title={t('An error occurred')}
            aria-live="polite"
            isInline
          >
            {validated}
          </Alert>
        </FormAlert>
      )}

      <ActionGroup style={{ display: 'flex' }}>
        <Button data-testid="submit-button" variant="primary" onClick={handleSubmit} isDisabled={!canSubmit}>
          {t('Submit')}
        </Button>

        <Button data-testid="cancel-button" variant="link" onClick={onCancel}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </Form>
  );
};
const WaitSiteCreation = function () {
  const { t } = useTranslation(I18nNamespace);

  return (
    <Card isPlain data-testid="loading-card">
      <CardBody>
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
          <LoadingPage message={t('Please wait while the Site is being installed. This may take a few seconds...')} />
        </PageSection>
      </CardBody>
    </Card>
  );
};

interface SecondaryOptionsProps {
  showServiceAccount: boolean;
  showHa: boolean;
  showDefaultIssuer: boolean;
  serviceAccount: string;
  defaultIssuer: string;
  ha: boolean;
  onChangeServiceAccount: (value: string) => void;
  onDefaultIssuer: (value: string) => void;
  onChangeHa: (value: boolean) => void;
}

const SecondaryOptions: FC<SecondaryOptionsProps> = function ({
  showServiceAccount,
  showHa,
  showDefaultIssuer,
  serviceAccount,
  defaultIssuer,
  ha,
  onChangeServiceAccount,
  onDefaultIssuer,
  onChangeHa
}) {
  const { t } = useTranslation(I18nNamespace);

  return (
    <>
      {showServiceAccount && (
        <FormGroup
          fieldId="service-account-input"
          label={t('Service account')}
          labelIcon={<TooltipInfoButton content={t('tooltipServiceAccount')} />}
          data-testid="service-account-group"
        >
          <TextInput
            data-testid="service-account-input"
            aria-label="form service account input"
            value={serviceAccount}
            placeholder={DEFAULT_SERVICE_ACCOUNT}
            onChange={(_, value) => onChangeServiceAccount(value)}
          />
        </FormGroup>
      )}

      {showDefaultIssuer && (
        <FormGroup
          fieldId="defaultIssuer-checkbox"
          label={t('Default issuer')}
          labelIcon={<TooltipInfoButton content={t('tooltipDefaultIssuer')} />}
          className="pf-v5-u-mt-md"
          data-testid="default-issuer-group"
        >
          <TextInput
            data-testid="default-issuer-input"
            aria-label="form Default issuer input"
            value={defaultIssuer}
            placeholder={DEFAULT_ISSUER}
            onChange={(_, value) => onDefaultIssuer(value)}
          />
        </FormGroup>
      )}

      {showHa && (
        <FormGroup fieldId="ha-checkbox" className="pf-v5-u-mt-md" data-testid="ha-group">
          <Checkbox
            data-testid="ha-checkbox"
            aria-label="form ha checkbox"
            id="ha-checkbox"
            label={t('tooltipHighAvailability')}
            onChange={() => onChangeHa(!ha)}
            isChecked={ha}
          />
        </FormGroup>
      )}
    </>
  );
};
