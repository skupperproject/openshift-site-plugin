import { useState, useEffect } from 'react';

import { Icon, Bullseye, Spinner, TextContent, Text, TextVariants, Flex, FlexItem } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { CR_STATUS_OK, I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import { QueryKeys } from '@config/reactQuery';

import { useLinkForm } from './hooks/useLinkForm';

const WizardContentHeight = '400px';

export const SummaryPage = function () {
  const { t } = useTranslation(I18nNamespace);
  const {
    state: { name, fileName },
    setIsLoading: setExternalLoading,
    validated: error,
    setValidated
  } = useLinkForm();

  const [isLoading, setIsLoading] = useState(true);
  const { data: accessToken } = useQuery({
    queryKey: [QueryKeys.FindAccessToken, name || fileName],
    queryFn: () => RESTApi.findAccessToken(name || fileName),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  const { data: link } = useQuery({
    queryKey: [QueryKeys.FindLink, name || fileName],
    queryFn: () => RESTApi.findLink(name || fileName),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  const hasStatus = accessToken?.status?.status || link?.status?.status;
  const isConfigured = link?.status?.conditions.find(({ type, status }) => type === 'Configured' && status === 'True');
  const hasError =
    accessToken?.status?.status !== CR_STATUS_OK ||
    (accessToken?.status?.status && link?.status?.status && link?.status?.status !== CR_STATUS_OK);
  const errorMessage = link?.status?.status || accessToken?.status?.status;

  useEffect(() => {
    if (!hasStatus) {
      return;
    }

    if (isConfigured) {
      setValidated(undefined);
      setIsLoading(false);
      setExternalLoading(false);

      return;
    }

    if (hasError) {
      setIsLoading(false);
      setExternalLoading(false);
      setValidated(errorMessage);
    }
  }, [setValidated, setIsLoading, setExternalLoading, isConfigured, hasError, hasStatus, errorMessage]);

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
