import { useState, FC, useCallback, FormEvent } from 'react';

import { Form, FormGroup, TextInput, ActionGroup, Button, FormAlert, Alert, Title } from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import { createConnectorRequest } from '@core/utils/createCRD';
import { startsWithApp, validatePort, validateRFC1123Subdomain } from '@core/utils/validations';
import { ConnectorCrdParams } from '@interfaces/CRD.interfaces';
import { HTTPError } from '@interfaces/REST.interfaces';

type SubmitFunction = () => void;

type CancelFunction = () => void;

const ConnectorForm: FC<{
  onSubmit: SubmitFunction;
  onCancel: CancelFunction;
  connectorName?: string;
  attributes?: {
    routingKey?: string;
    selector?: string;
    host?: string;
    port?: number;
    name?: string;
    resourceVersion?: string;
  };
}> = function ({ onSubmit, onCancel, connectorName, attributes }) {
  const { t } = useTranslation(I18nNamespace);

  const [validated, setValidated] = useState<string | undefined>();
  const [name, setName] = useState(attributes?.name || '');
  const [routingKey, setRoutingKey] = useState(attributes?.routingKey || '');
  const [selector, setSelector] = useState(attributes?.selector || '');
  const [host, setHost] = useState(attributes?.host || '');
  const [port, setPort] = useState<number | string | undefined>(attributes?.port);

  const mutationCreate = useMutation({
    mutationFn: (data: ConnectorCrdParams) => RESTApi.createOrUpdateConnector(data, connectorName),
    onError: (data: HTTPError) => {
      setValidated(data.descriptionMessage);
    },
    onSuccess: onSubmit
  });

  const validatedInput = (value: string, callbacks: Function[], validateEmpty = true) => {
    if (!validateEmpty && !value) {
      setValidated(undefined);

      return;
    }

    const errors = callbacks.map((callback) => callback(value)).filter(Boolean);
    if (errors.length) {
      setValidated(t(errors[0]));
    } else {
      setValidated(undefined);
    }
  };

  const isValidated = useCallback(
    () => !!(routingKey && port && (host || selector) && !validated),
    [host, selector, port, routingKey, validated]
  );

  const handleChangeName = (_: FormEvent, value: string) => {
    validatedInput(value, [validateRFC1123Subdomain]);
    setName(value);
  };

  const handleChangeSelector = (_: FormEvent, value: string) => {
    validatedInput(value, [startsWithApp, validateRFC1123Subdomain], false);

    setSelector(value);
  };

  const handleChangeHost = (_: FormEvent, value: string) => {
    validatedInput(value, [validateRFC1123Subdomain], false);
    setHost(value);
  };

  const handleChangeRoutingKey = (_: FormEvent, value: string) => {
    validatedInput(value, [validateRFC1123Subdomain]);
    setRoutingKey(value);
  };

  const handleChangePort = (_: FormEvent, value: string) => {
    validatedInput(value, [validatePort]);
    setPort(value);
  };

  const handleSubmit = useCallback(() => {
    const key = selector ? 'selector' : 'host';
    const value = selector || host;

    const data = createConnectorRequest({
      metadata: {
        name,
        resourceVersion: attributes?.resourceVersion || ''
      },
      spec: {
        routingKey,
        [key]: value,
        port: Number(port)
      }
    });

    mutationCreate.mutate(data);
  }, [selector, host, port, routingKey, name, attributes?.resourceVersion, mutationCreate]);

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Form isHorizontal className="pf-v5-u-p-xl">
      <Title headingLevel="h1">{t('Create a connector')}</Title>

      {validated && (
        <FormAlert>
          <Alert variant="danger" title={t(validated)} aria-live="polite" isInline />
        </FormAlert>
      )}

      <FormGroup
        fieldId="form-name-input"
        isRequired
        label={t('Name')}
        labelIcon={<TooltipInfoButton content="...." />}
      >
        <TextInput
          isRequired
          type="text"
          value={name}
          onChange={handleChangeName}
          aria-label="form name input disabled"
          isDisabled={!!connectorName}
        />
      </FormGroup>

      <FormGroup
        fieldId="form-routing-key-input"
        isRequired
        label={t('Routing key')}
        labelIcon={<TooltipInfoButton content="...." />}
      >
        <TextInput isRequired type="text" value={routingKey} onChange={handleChangeRoutingKey} />
      </FormGroup>

      <FormGroup
        label={t('Port')}
        labelIcon={<TooltipInfoButton content="...." />}
        isRequired
        fieldId="form-port-input"
      >
        <TextInput isRequired value={port} onChange={handleChangePort} />
      </FormGroup>

      <FormGroup label={t('Selector')} labelIcon={<TooltipInfoButton content="...." />} fieldId="form-selector-input">
        <TextInput isRequired type="text" value={selector} onChange={handleChangeSelector} placeholder="app=" />
      </FormGroup>

      <FormGroup label={t('Host')} labelIcon={<TooltipInfoButton content="...." />} fieldId="form-host-input">
        <TextInput isRequired type="text" value={host} onChange={handleChangeHost} />
      </FormGroup>

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

export default ConnectorForm;
