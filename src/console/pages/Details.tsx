import { FC, useEffect, useState } from 'react';

import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Card,
  CardHeader,
  CardBody,
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
  CR_STATUS_OK,
  DEFAULT_SERVICE_ACCOUNT,
  EMPTY_LINK_ACCESS_STATUS,
  EMPTY_VALUE_SYMBOL,
  I18nNamespace,
  REFETCH_QUERY_INTERVAL
} from '@config/config';
import FormatOCPDateCell from '@core/components/FormatOCPDate';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import SkTable from '@core/components/SkTable';
import { CrdStatusCondition, StatusSiteType } from '@interfaces/CRD_Base';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';

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
    queryKey: ['find-site-query-details'],
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
      onDataUpdated();
    }
  }, [site?.isConfigured, site?.name, site?.resourceVersion, onDataUpdated]);

  const ConditionsColumns: SKColumn<CrdStatusCondition<StatusSiteType>>[] = [
    {
      name: t('Type'),
      prop: 'type',
      width: 20
    },
    {
      name: t('Status'),
      prop: 'status',
      width: 20
    },
    {
      name: t('Updated'),
      prop: 'lastTransitionTime',
      customCellName: 'FormatOCPDateCell',
      width: 20
    },
    {
      name: t('Reason'),
      prop: 'reason',
      customCellName: 'ValueOrEmpty'
    },
    {
      name: t('Message'),
      prop: 'message',
      customCellName: 'ValueOrEmpty'
    }
  ];

  const customSiteCells = {
    FormatOCPDateCell,
    ValueOrEmpty: ({ value }: SKComponentProps<CrdStatusCondition<StatusSiteType>>) =>
      value !== CR_STATUS_OK ? value : EMPTY_VALUE_SYMBOL
  };

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
                {!site?.status && (
                  <Label>
                    <Icon isInline>{<InProgressIcon />}</Icon> {t('In progress')}
                  </Label>
                )}
                {!!site?.status && (
                  <Label>
                    {!!site?.hasError && (
                      <Icon isInline status="danger">
                        <ExclamationCircleIcon />
                      </Icon>
                    )}
                    {!site?.hasError && !!site?.isConfigured && !site?.isReady && (
                      <Icon isInline status="success">
                        {<CheckCircleIcon />}
                      </Icon>
                    )}
                    {!site?.hasError && !!site?.isConfigured && !!site?.isReady && (
                      <Icon isInline>{<SyncAltIcon />}</Icon>
                    )}
                    {'  '} {site?.status}
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
                  isDisabled={!site?.isConfigured}
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
                  isDisabled={!site?.isConfigured}
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
                  isDisabled={!site?.isConfigured}
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
              <DescriptionListTerm>{t('Platform')}</DescriptionListTerm>
              <DescriptionListDescription>{`${site?.platform}` || EMPTY_VALUE_SYMBOL}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
              <DescriptionListDescription>
                {site?.isConfigured ? (
                  <FormatOCPDateCell value={new Date(site.creationTimestamp)} />
                ) : (
                  EMPTY_VALUE_SYMBOL
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      {site?.conditions && (
        <Card isPlain>
          <CardHeader>
            <Title headingLevel="h1">{t('Conditions')}</Title>
          </CardHeader>

          <CardBody>
            <SkTable
              columns={ConditionsColumns}
              rows={site?.conditions}
              alwaysShowPagination={false}
              isPlain
              customCells={customSiteCells}
              variant="compact"
            />
          </CardBody>
        </Card>
      )}
      <Modal
        title={t('Edit site')}
        variant={ModalVariant.medium}
        isOpen={isModalOpen}
        aria-label="Form edit site"
        showClose={false}
      >
        {site?.isConfigured && (
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
