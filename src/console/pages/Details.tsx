import { FC, useEffect, useState } from 'react';

import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Card,
  CardHeader,
  CardBody,
  Timestamp,
  Title,
  Button,
  Modal,
  ModalVariant,
  Flex,
  FlexItem,
  Label,
  Icon
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon, PenIcon, SyncAltIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import {
  DEFAULT_SERVICE_ACCOUNT,
  EMPTY_LINK_ACCESS_STATUS,
  EMPTY_VALUE_SYMBOL,
  I18nNamespace,
  REFETCH_QUERY_INTERVAL
} from '@config/config';
import { createSiteInfo } from '@config/db';
import { TooltipInfoButton } from '@core/components/HelpTooltip';

import DeleteSiteButton from './components/DeleteSiteButton';
import SiteForm from './components/SiteForm';

const Details: FC<{ onGoTo: (page: number) => void; onDataUpdated: () => void }> = function ({
  onGoTo,
  onDataUpdated
}) {
  const { t } = useTranslation(I18nNamespace);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleModalPros, setVisibleModalProps] = useState<Record<string, boolean>>({});

  const { data: site, refetch } = useQuery({
    queryKey: ['find-site-query'],
    queryFn: () => RESTApi.findSiteView(),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  const handleOpenModal = (props: Record<string, boolean>) => {
    setIsModalOpen(true);
    setVisibleModalProps(props);
  };

  const handleSubmit = () => {
    handleClose();
    refetch();
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (site?.name && site?.resourceVersion) {
      createSiteInfo({ name: site.name, resourceVersion: site.resourceVersion });
    }
    if (site?.isInitialized) {
      onDataUpdated();
    }
  }, [site?.isInitialized, site?.name, site?.resourceVersion, onDataUpdated]);

  return (
    <>
      <Card isPlain>
        <CardHeader>
          <Flex style={{ width: '100%' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <Flex>
                <FlexItem>
                  <Title headingLevel="h1">{t('Site settings')}</Title>
                </FlexItem>
                {!site?.hasError && !site?.isInitialized && (
                  <Label>
                    <Icon isInline>{<InProgressIcon />}</Icon> {t('In progress')}
                  </Label>
                )}
                {!site?.hasError && !!site?.isInitialized && !site?.isReady && (
                  <Label>
                    <Icon isInline status="success">
                      {<CheckCircleIcon />}
                    </Icon>{' '}
                    {t('Active')}
                  </Label>
                )}
                {!site?.hasError && !!site?.isInitialized && !!site?.isReady && (
                  <Label>
                    <Icon isInline>{<SyncAltIcon />}</Icon> {t('Running')}
                  </Label>
                )}
                {!!site?.hasError && (
                  <Label>
                    <Icon isInline status="danger">
                      <ExclamationCircleIcon />
                    </Icon>{' '}
                    {site?.status}
                  </Label>
                )}
              </Flex>
            </FlexItem>
            <FlexItem>
              <DeleteSiteButton onClick={onDataUpdated} />
            </FlexItem>
          </Flex>
        </CardHeader>

        <CardBody>
          <DescriptionList
            columnModifier={{
              default: '2Col'
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
              <DescriptionListDescription>{site?.name}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('Link access')} <TooltipInfoButton content={t('tooltipSiteLinkAccess')} />
              </DescriptionListTerm>
              <DescriptionListDescription>
                {site?.linkAccess || EMPTY_LINK_ACCESS_STATUS}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ linkAccess: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isReady}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Service account')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.serviceAccount}` || DEFAULT_SERVICE_ACCOUNT}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ serviceAccount: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isReady}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('tooltipHighAvailability')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.ha}`}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ ha: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isReady}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Status')}</Title>
        </CardHeader>

        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Sites in the network')}</DescriptionListTerm>
              {t('sitesInNetwork', { count: site?.sitesInNetwork })}
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Linked sites')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Button variant="link" isInline onClick={() => onGoTo(3)} isDisabled={!site?.linkCount}>
                  {t('remoteSiteWithCount', { count: site?.linkCount })}
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Details')}</Title>
        </CardHeader>

        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Controller version')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.controllerVersion}` || EMPTY_VALUE_SYMBOL}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
              <DescriptionListDescription>
                {site?.isInitialized ? <Timestamp date={new Date(site.creationTimestamp)} /> : EMPTY_VALUE_SYMBOL}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Modal
        title={t('Edit site')}
        variant={ModalVariant.medium}
        isOpen={isModalOpen}
        aria-label="Form edit site"
        showClose={false}
      >
        {site?.isInitialized && (
          <SiteForm
            show={visibleModalPros}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            properties={{
              name: site.name,
              linkAccess: site.linkAccess,
              ha: site.ha,
              serviceAccount: site.serviceAccount
            }}
            siteName={site.name}
          />
        )}
      </Modal>
    </>
  );
};

export default Details;
