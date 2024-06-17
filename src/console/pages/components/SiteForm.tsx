import { useState, FC, FormEvent, useCallback } from 'react';

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
  PanelMainBody
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { getSiteInfo } from '@config/db';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import { createSiteData } from '@core/utils/createCRD';
import { validateRFC1123Subdomain } from '@core/utils/validations';
import { K8sResourceConfigMapData, SiteCrdParams } from '@interfaces/CRD.interfaces';
import { HTTPError } from '@interfaces/REST.interfaces';

const options = [
  { value: 'route', label: 'route', disabled: false },
  { value: 'nodeport', label: 'nodeport', disabled: false },
  { value: 'loadbalancer', label: 'loadbalancer', disabled: false },
  { value: 'none', label: 'none', disabled: false }
];

type SubmitFunction = () => void;

type CancelFunction = () => void;

const SiteForm: FC<{
  onSubmit: SubmitFunction;
  onCancel: CancelFunction;
  properties?: K8sResourceConfigMapData;
  siteName?: string;
  show?: { ingress?: boolean; name?: boolean };
}> = function ({ onSubmit, onCancel, properties, siteName, show = { ingress: true, name: true } }) {
  const { t } = useTranslation(I18nNamespace);

  const [validated, setValidated] = useState<string | undefined>();
  const [name, setName] = useState(properties?.name || '');
  const [linkAccess, setLinkAccess] = useState(properties?.ingress || options[0].value);
  const [isLinkAccessDisabled, setIsLinkAccessDisabled] = useState(!properties?.ingress);

  const mutationCreate = useMutation({
    mutationFn: (data: SiteCrdParams) => RESTApi.createOrUpdateSite(data, siteName),
    onError: (data: HTTPError) => {
      setValidated(data.descriptionMessage);
    },
    onSuccess: onSubmit
  });

  const validatedInput = (value: string, callback: Function) => {
    const error = callback(value);

    if (error) {
      setValidated(t(error));
    } else {
      setValidated(undefined);
    }
  };

  const isValidated = useCallback(() => !!name, [name]);

  const handleChangeName = (_: FormEvent, value: string) => {
    validatedInput(value, validateRFC1123Subdomain);
    setName(value);
  };

  const handleChangeIngress = (_: FormEvent, value: string) => {
    setLinkAccess(value);
  };

  const handleSubmit = () => {
    const data = {
      metadata: { name, resourceVersion: getSiteInfo()?.resourceVersion || '' },
      spec: {
        linkAccess: isLinkAccessDisabled ? undefined : linkAccess
      }
    };
    mutationCreate.mutate(createSiteData(data));
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Form isHorizontal className="pf-v5-u-p-xl">
      {validated && (
        <FormAlert>
          <Alert variant="danger" title={validated} aria-live="polite" isInline />
        </FormAlert>
      )}
      {show.name && (
        <FormGroup
          label={t('Name')}
          isRequired
          fieldId="form-name"
          labelIcon={<TooltipInfoButton content={t('tooltipSiteNameValue')} />}
        >
          <TextInput isRequired type="text" aria-label="form name input" value={name} onChange={handleChangeName} />
        </FormGroup>
      )}

      {show.ingress && (
        <FormGroup
          label={t('Link access')}
          labelIcon={<TooltipInfoButton content={t('tooltipSiteLinkAccessValue')} />}
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
                  value={linkAccess}
                  onChange={handleChangeIngress}
                  aria-label="form link access select"
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

      <ActionGroup style={{ display: 'flex' }}>
        <Button variant="primary" onClick={handleSubmit} isDisabled={!isValidated()}>
          {t('Submit')}
        </Button>

        <Button variant="link" onClick={handleCancel}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </Form>
  );
};

export default SiteForm;
