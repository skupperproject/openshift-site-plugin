import { useState, FC, useEffect, useCallback } from 'react';

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
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { DEFAULT_SERVICE_ACCOUNT, I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import LoadingPage from '@core/components/Loading';
import { createSiteData } from '@core/utils/createCRD';
import { SiteCrdParams } from '@interfaces/CRD_Site';
import { HTTPError } from '@interfaces/REST.interfaces';
import useValidatedInput from 'console/hooks/useValidation';

const options = [
  { value: 'route', label: 'route', disabled: false },
  { value: 'loadbalancer', label: 'loadbalancer', disabled: false },
  { value: 'default', label: 'default', disabled: false }
];

interface SiteFormProps {
  siteName?: string;
  linkAccess?: string;
  serviceAccount?: string;
  ha?: boolean;
  resourceVersion?: string;
  show?: { linkAccess?: boolean; name?: boolean; ha?: boolean; serviceAccount?: boolean };
  onReady: () => void;
  onCancel: () => void;
}

const SiteForm: FC<SiteFormProps> = function ({
  siteName,
  linkAccess: initLinkAccess,
  serviceAccount: initServiceAccount,
  ha: initHa,
  resourceVersion,
  show = { linkAccess: true, name: true, ha: true, serviceAccount: true },
  onReady,
  onCancel
}) {
  const [step, setNextStep] = useState(0);

  const handleReady = () => {
    siteName ? onReady() : setNextStep(1);
  };

  const steps = [
    <FormPage
      key={1}
      show={show}
      siteName={siteName}
      initLinkAccess={initLinkAccess}
      initServiceAccount={initServiceAccount}
      initHa={initHa}
      resourceVersion={resourceVersion}
      onSubmit={handleReady}
      onCancel={onCancel}
    />,
    <WaitSiteCreation key={2} onReady={onReady} />
  ];

  return steps[step];
};

export default SiteForm;

interface FormPageProps {
  siteName?: string;
  initLinkAccess?: string;
  initServiceAccount?: string;
  initHa?: boolean;
  resourceVersion?: string;
  show: { linkAccess?: boolean; name?: boolean; ha?: boolean; serviceAccount?: boolean };
  onSubmit: () => void;
  onCancel: () => void;
}

const FormPage: FC<FormPageProps> = function ({
  show,
  siteName,
  initLinkAccess,
  initServiceAccount,
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

  const [name, setName] = useState(siteName || '');
  const [linkAccess, setLinkAccess] = useState(initLinkAccess || options[0].value);
  const [isLinkAccessExist, setToggleLinkAccess] = useState(!!initLinkAccess || (!siteName && true));
  const [serviceAccount, setServiceAccount] = useState(initServiceAccount || '');
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

  const handleChangeServiceAccount = (value: string) => {
    // validateInput(value, [validateRFC1123Subdomain]);
    setServiceAccount(value);
  };

  const handleChangeHa = (value: boolean) => {
    setHa(value);
  };

  const handleSubmit = () => {
    const data: SiteCrdParams = createSiteData({
      metadata: { name, resourceVersion },
      spec: {
        linkAccess: isLinkAccessExist ? linkAccess : undefined,
        serviceAccount,
        ha
      }
    });

    mutationCreateOrUpdate.mutate(data);
  };

  const SecondaryOptions = function () {
    return (
      <>
        {show.serviceAccount && (
          <FormGroup
            fieldId="service-account-input"
            label={t('Service account')}
            labelIcon={<TooltipInfoButton content={t('tooltipServiceAccount')} />}
          >
            <TextInput
              aria-label="form service account input"
              value={serviceAccount}
              placeholder={DEFAULT_SERVICE_ACCOUNT}
              onChange={(_, value) => handleChangeServiceAccount(value)}
            />
          </FormGroup>
        )}

        {show.ha && (
          <FormGroup fieldId="ha-checkbox" className="pf-v5-u-mt-md">
            <Checkbox
              aria-label="form ha checkbox"
              id="ha checkbox"
              label={t('tooltipHighAvailability')}
              onClick={() => handleChangeHa(!ha)}
              isChecked={ha}
            />
          </FormGroup>
        )}
      </>
    );
  };

  const canSubmit = !!name; //&& !validated;

  return (
    <Form isHorizontal>
      {(show.name || show.ha) && (
        <FormGroup fieldId="name-input" isRequired label={t('Name')}>
          <TextInput
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
        >
          <Panel variant="bordered">
            <PanelMain>
              <PanelMainBody>
                <Checkbox
                  id="enable-link-access"
                  label={t('Enable link access')}
                  onClick={() => setToggleLinkAccess(!isLinkAccessExist)}
                  isChecked={isLinkAccessExist}
                  className="pf-v5-u-mb-md"
                />

                <FormSelect
                  aria-label="form link access select"
                  value={linkAccess}
                  onChange={(_, value) => handleChangeLinkAccess(value)}
                  isDisabled={!isLinkAccessExist}
                >
                  {options.map((option, index) => (
                    <FormSelectOption
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

      {!(show.serviceAccount && show.ha) && <SecondaryOptions />}

      {show.serviceAccount && show.ha && (
        <ExpandableSection
          toggleText={isExpanded ? 'Show less' : 'Show more'}
          onToggle={handleToggle}
          isExpanded={isExpanded}
        >
          <SecondaryOptions />
        </ExpandableSection>
      )}

      {validated && (
        <FormAlert>
          <Alert variant="danger" title={t('An error occurred')} aria-live="polite" isInline>
            {validated}
          </Alert>
        </FormAlert>
      )}

      <ActionGroup style={{ display: 'flex' }}>
        <Button variant="primary" onClick={handleSubmit} isDisabled={!canSubmit}>
          {t('Submit')}
        </Button>

        <Button variant="link" onClick={onCancel}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </Form>
  );
};

const WaitSiteCreation: FC<{ onReady: () => void }> = function ({ onReady }) {
  const { t } = useTranslation(I18nNamespace);

  const { data: site, isFetching } = useQuery({
    queryKey: ['find-site-query'],
    queryFn: () => RESTApi.findSiteView(),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  useEffect(() => {
    if (!isFetching && site?.isConfigured) {
      onReady();
    }
  }, [isFetching, site?.isConfigured, onReady]);

  return (
    <Card isPlain>
      <CardBody>
        <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
          <LoadingPage message={t('Please wait while the Site is being installed. This may take a few seconds...')} />
        </PageSection>
      </CardBody>
      <Button variant="link" onClick={onReady} style={{ display: 'flex' }}>
        {t('Dismiss')}
      </Button>
    </Card>
  );
};
