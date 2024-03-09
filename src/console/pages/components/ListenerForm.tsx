import { useState, FC, useCallback, FormEvent } from 'react';

import { Form, FormGroup, TextInput, ActionGroup, Button, FormAlert, Alert, Title } from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import { createListenerRequest } from '@core/utils/createCRD';
import { validatePort, validateRFC1123Subdomain } from '@core/utils/validations';
import { ListenerCrdParams } from '@interfaces/CRD.interfaces';
import { HTTPError } from '@interfaces/REST.interfaces';

type SubmitFunction = () => void;

type CancelFunction = () => void;

const ListenerForm: FC<{
  onSubmit: SubmitFunction;
  onCancel: CancelFunction;
  listenerName?: string;
  attributes?: { routingKey?: string; host?: string; port?: number; name?: string; resourceVersion?: string };
}> = function ({ onSubmit, onCancel, listenerName, attributes }) {
  const { t } = useTranslation(I18nNamespace);

  const [validated, setValidated] = useState<string | undefined>();
  const [name, setName] = useState(attributes?.name || '');
  const [routingKey, setRoutingKey] = useState(attributes?.routingKey || '');
  const [host, setHost] = useState(attributes?.host || '');
  const [port, setPort] = useState<string | number | undefined>(attributes?.port);

  const mutationCreate = useMutation({
    mutationFn: (data: ListenerCrdParams) => RESTApi.createOrUpdateListener(data, listenerName),
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

  const isValidated = useCallback(
    () => !!(routingKey && port && host && !validated),
    [host, port, routingKey, validated]
  );

  const handleChangeRoutingKey = (_: FormEvent, value: string) => {
    validatedInput(value, validateRFC1123Subdomain);
    setRoutingKey(value);
  };

  const handleChangeServiceName = (_: FormEvent, value: string) => {
    validatedInput(value, validateRFC1123Subdomain);
    setHost(value);
  };

  const handleChangePort = (_: FormEvent, value: string) => {
    validatedInput(value, validatePort);
    setPort(value);
  };

  const handleChangeName = (_: FormEvent, value: string) => {
    validatedInput(value, validateRFC1123Subdomain);
    setName(value);
  };

  const handleSubmit = useCallback(() => {
    const data = createListenerRequest({
      metadata: {
        name,
        resourceVersion: attributes?.resourceVersion
      },
      spec: {
        routingKey,
        host,
        port: Number(port)
      }
    });

    mutationCreate.mutate(data);
  }, [name, attributes?.resourceVersion, routingKey, host, port, mutationCreate]);

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Form isHorizontal className="pf-v5-u-p-xl">
      <Title headingLevel="h1">{t('Create a listener')}</Title>

      {validated && (
        <FormAlert>
          <Alert variant="danger" title={validated} aria-live="polite" isInline />
        </FormAlert>
      )}

      <FormGroup fieldId="form-name-input" isRequired label={t('Name')} labelIcon={<TooltipInfoButton content="..." />}>
        <TextInput
          type="text"
          value={name}
          onChange={handleChangeName}
          aria-label="form name input"
          isDisabled={!!listenerName}
        />
      </FormGroup>

      <FormGroup
        fieldId="form-routing-key-input"
        isRequired
        label={t('Routing key')}
        labelIcon={<TooltipInfoButton content="..." />}
      >
        <TextInput
          isRequired
          type="text"
          value={routingKey}
          onChange={handleChangeRoutingKey}
          aria-label="form routing key input"
        />
      </FormGroup>

      <FormGroup
        fieldId="form-service-name-input"
        isRequired
        label={t('Service name')}
        labelIcon={<TooltipInfoButton content="..." />}
      >
        <TextInput
          isRequired
          type="text"
          value={host}
          onChange={handleChangeServiceName}
          aria-label="form service name input"
        />
      </FormGroup>

      <FormGroup fieldId="form-port-input" isRequired label={t('Port')} labelIcon={<TooltipInfoButton content="..." />}>
        <TextInput isRequired value={port} onChange={handleChangePort} aria-label="form port input" />
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

export default ListenerForm;
