import { useEffect, useState, useCallback } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { ConsoleRouteManager, NamespaceManager } from '@config/db';
import ExternalLink from '@core/components/ExternalLink';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export interface RouteResource extends K8sResourceCommon {
  spec?: {
    host?: string;
    port?: {
      targetPort?: string;
    };
  };
  status?: {
    ingress?: unknown[];
  };
}

interface PodResource extends K8sResourceCommon {
  status?: {
    phase?: string;
  };
}

const POD_SELECTOR = { 'app.kubernetes.io/part-of': 'skupper-network-observer' };
const POD_LOADED_STATUS = 'Running';
const ROUTE_GROUP = 'route.openshift.io';
const ROUTE_VERSION = 'v1';
const ROUTE_KIND = 'Route';
const POD_GROUP = '';
const POD_VERSION = 'v1';
const POD_KIND = 'Pod';

const podWatchResource = {
  groupVersionKind: { group: POD_GROUP, version: POD_VERSION, kind: POD_KIND },
  isList: true, // SDK Api issue: isList equal false retrieves 2 data: a podlist with all pods into the namespace and the right one. Instaed isList === true retrive an array with 1 element if exists, otherwise
  selector: {
    matchLabels: POD_SELECTOR
  },
  fieldSelector: 'status.phase!=Succeeded'
};

const routeWatchResource = {
  groupVersionKind: { group: ROUTE_GROUP, version: ROUTE_VERSION, kind: ROUTE_KIND },
  isList: true, // same issue metionated above
  selector: {
    matchLabels: POD_SELECTOR
  }
};

const DeploymentNetworkConsoleButton = function () {
  const { t } = useTranslation(I18nNamespace);
  const [url, setUrl] = useState<string | undefined>();

  const [routes] = useK8sWatchResource<RouteResource[]>({
    ...routeWatchResource,
    namespace: NamespaceManager.getNamespace()
  });

  const [pods] = useK8sWatchResource<PodResource[]>({
    ...podWatchResource,
    namespace: NamespaceManager.getNamespace()
  });

  const { mutate: createDeployment } = useMutation({
    mutationFn: () => RESTApi.createDeployment()
  });

  const { mutate: deleteDeployment } = useMutation({
    mutationFn: () => RESTApi.deleteDeployment(),
    onSuccess: () => {
      setUrl(undefined);
    }
  });

  const handleDeployConsole = useCallback(() => {
    createDeployment();
  }, [createDeployment]);

  const handleDeleteConsole = useCallback(() => {
    deleteDeployment();
  }, [deleteDeployment]);

  useEffect(() => {
    const route = routes?.[0];

    if (route?.metadata?.name && route?.spec?.host && route?.spec?.port?.targetPort) {
      setUrl(`${route.spec.port.targetPort}://${route.spec.host}`);
      ConsoleRouteManager.setName(route.metadata.name);
    } else {
      setUrl(undefined); // Ensure URL is cleared if route info is missing.
      ConsoleRouteManager.setName('');
    }
  }, [routes]);
  const pod = pods?.[0];
  const isLoaded = !!url && pod?.status?.phase === POD_LOADED_STATUS;

  return (
    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      {!isLoaded && (
        <Button
          onClick={handleDeployConsole}
          isDisabled={pod && !isLoaded}
          isLoading={pod && !isLoaded}
          icon={<CubesIcon />}
        >
          {t('Deploy the Network Console')}
        </Button>
      )}

      {isLoaded && <ExternalLink href={url} text={t('Open the Network Console')} />}
      {isLoaded && (
        <Button onClick={handleDeleteConsole} variant="secondary" icon={<CubesIcon />}>
          {t('Delete the Network Console')}
        </Button>
      )}
    </Flex>
  );
};

export default DeploymentNetworkConsoleButton;
