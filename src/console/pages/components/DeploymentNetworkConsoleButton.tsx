import { useEffect, useState } from 'react';

import { Button, Flex } from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import ExternalLink from '@core/components/ExternalLink';
import { getSkupperNamespace } from '@config/db';
import { CubesIcon } from '@patternfly/react-icons';

const groupVersionKind = {
  group: 'route.openshift.io',
  version: 'v1',
  kind: 'Route'
};

const DeploymentNetworkConsoleButton = function () {
  const { t } = useTranslation(I18nNamespace);
  const [isDeployLoading, setIsDeployingLoading] = useState(false);
  const [url, setUrl] = useState<string | undefined>();

  const watchResource = {
    groupVersionKind,
    namespace: getSkupperNamespace(),
    isList: false,
    name: 'network-console'
  };

  const [data] = useK8sWatchResource(watchResource) as any;

  const mutationCreate = useMutation({
    mutationFn: () => RESTApi.createDeployment(),
    onSuccess: () => {
      setTimeout(() => {
        setIsDeployingLoading(false);
      }, 4000);
    }
  });

  const mutationDelete = useMutation({
    mutationFn: () => RESTApi.deleteDeployment(),
    onSuccess: () => {
      setIsDeployingLoading(false);
      setUrl(undefined);
    }
  });

  const handleDeployConsole = async () => {
    setIsDeployingLoading(true);
    mutationCreate.mutate();
  };

  const handleDeleteConsole = async () => {
    setIsDeployingLoading(true);
    mutationDelete.mutate();
  };

  useEffect(() => {
    if (data?.status) {
      const newUrl = data?.spec?.host ? `${data?.spec?.port.targetPort}://${data?.spec?.host}` : undefined;
      setUrl(newUrl);
    }
  }, [data?.status]);

  return (
    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      {!url && (
        <Button onClick={handleDeployConsole} isLoading={isDeployLoading} icon={<CubesIcon />}>
          {t('Deploy the Network Console')}
        </Button>
      )}

      {url && <ExternalLink href={url} text={t('Open the Network Console')} />}
      {url && (
        <Button onClick={handleDeleteConsole} variant="secondary" icon={<CubesIcon />}>
          {t('Delete the Network Console')}
        </Button>
      )}
    </Flex>
  );
};

export default DeploymentNetworkConsoleButton;
