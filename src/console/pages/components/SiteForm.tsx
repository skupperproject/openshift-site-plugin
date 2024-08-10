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
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import { getSiteInfo } from '@config/db';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import LoadingPage from '@core/components/Loading';
import { createSiteData } from '@core/utils/createCRD';
import { SiteCrdParams, SiteSpec } from '@interfaces/CRD_Site';
import { HTTPError } from '@interfaces/REST.interfaces';
import useValidatedInput from 'console/hooks/useValidation';

const options = [
  { value: 'route', label: 'route', disabled: false },
  { value: 'loadbalancer', label: 'loadbalancer', disabled: false },
  { value: 'default', label: 'default', disabled: false }
];

const SiteForm: FC<{
  onSubmit: () => void;
  onCancel: () => void;
  properties?: SiteSpec;
  siteName?: string;
  show?: { linkAccess?: boolean; name?: boolean; ha?: boolean; serviceAccount?: string };
}> = function ({
  onSubmit,
  onCancel,
  properties,
  siteName,
  show = { linkAccess: true, name: true, ha: true, serviceAccount: true }
}) {
  const { t } = useTranslation(I18nNamespace);

  const [isExpanded, setIsExpanded] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(properties?.name || '');
  const [linkAccess, setLinkAccess] = useState(properties?.linkAccess || options[0].value);
  const [isLinkAccessDisabled, setIsLinkAccessDisabled] = useState(!properties?.linkAccess);
  const [serviceAccount, setServiceAccount] = useState(properties?.serviceAccount || '');
  const [ha, setHa] = useState(properties?.ha || false);

  const { validated, validateInput } = useValidatedInput();

  const { data: site } = useQuery({
    queryKey: ['find-site-query'],
    queryFn: () => RESTApi.findSiteView(),
    enabled: isLoading,
    refetchInterval(data) {
      return isLoading && data?.isConfigured ? 0 : REFETCH_QUERY_INTERVAL;
    }
  });

  const mutationCreateOrUpdate = useMutation({
    mutationFn: (data: SiteCrdParams) => RESTApi.createOrUpdateSite(data, siteName),
    onError: (data: HTTPError) => {
      validateInput(data.descriptionMessage);
    },
    onSuccess: () => {
      setIsLoading(true);
    }
  });

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
      metadata: { name, resourceVersion: getSiteInfo()?.resourceVersion || '' },
      spec: {
        linkAccess: isLinkAccessDisabled ? undefined : linkAccess,
        serviceAccount,
        ha
      }
    });

    mutationCreateOrUpdate.mutate(data);
  };

  const handleToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    if (isLoading && site?.identity && site.isConfigured) {
      setIsLoading(false);
      onSubmit();
    }
  }, [onSubmit, site?.identity, site?.isConfigured, isLoading]);

  if (isLoading && site?.identity && !site.isConfigured) {
    return (
      <Card isPlain>
        <CardBody>
          <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
            <LoadingPage message={t('Please wait while the Site is being installed. This may take a few seconds...')} />
          </PageSection>
        </CardBody>
        <Button variant="link" onClick={onSubmit} style={{ display: 'flex' }}>
          {t('Dismiss')}
        </Button>
      </Card>
    );
  }

  const canSubmit = !!name; //&& !validated;

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
              onChange={(_, value) => handleChangeServiceAccount(value)}
            />
          </FormGroup>
        )}

        {show.ha && (
          <FormGroup fieldId="ha-checkbox">
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

  return (
    <Form isHorizontal>
      {(show.name || show.ha) && (
        <FormGroup fieldId="name-input" isRequired label={t('Name')}>
          <TextInput
            aria-label="form name input"
            value={name}
            onChange={(_, value) => handleChangeName(value)}
            isDisabled={!!properties?.name}
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
                  onClick={() => setIsLinkAccessDisabled(!isLinkAccessDisabled)}
                  isChecked={!isLinkAccessDisabled}
                  className="pf-v5-u-mb-md"
                />

                <FormSelect
                  aria-label="form link access select"
                  value={linkAccess}
                  onChange={(_, value) => handleChangeLinkAccess(value)}
                  isDisabled={isLinkAccessDisabled}
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

export default SiteForm;
