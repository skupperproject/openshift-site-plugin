import { FC, useState } from 'react';

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
  FlexItem
} from '@patternfly/react-core';
import { PenIcon } from '@patternfly/react-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { createSiteInfo } from '@config/db';
import { TooltipInfoButton } from '@core/components/HelpTooltip';

import DeleteSiteButton from './components/DeleteSiteButton';
import SiteForm from './components/SiteForm';

const Details: FC<{ onGoTo: (page: number) => void; onDeleteSite: () => void }> = function ({ onGoTo, onDeleteSite }) {
  const { t } = useTranslation(I18nNamespace);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleModalPros, setVisibleModalProps] = useState<Record<string, boolean>>({});

  const { data: site, refetch } = useQuery({
    queryKey: ['find-site-query'],
    queryFn: () => RESTApi.findSiteView()
  });

  const handleOpenModal = (props: Record<string, boolean>) => {
    setIsModalOpen(true);
    setVisibleModalProps(props);
  };

  const handleSubmit = () => {
    handleClose();
    setTimeout(() => {
      refetch();
    }, 500);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  if (!site) {
    return null;
  }

  createSiteInfo({ name: site.name, resourceVersion: site.resourceVersion });

  return (
    <>
      <Card isPlain>
        <CardHeader>
          <Flex style={{ width: '100%' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <Title headingLevel="h1">{t('Site settings')}</Title>
            </FlexItem>
            <FlexItem>
              <DeleteSiteButton onClick={onDeleteSite} />
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
              <DescriptionListDescription>{site.name} </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('Link access')} <TooltipInfoButton content={t('tooltipSiteLinkAccessValue')} />
              </DescriptionListTerm>
              <DescriptionListDescription>
                {site.linkAccess || t('default')}{' '}
                <Button variant="plain" onClick={() => handleOpenModal({ ingress: true })} icon={<PenIcon />} />
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
          <DescriptionList
            columnModifier={{
              default: '2Col'
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Linked sites')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Button variant="link" isInline onClick={() => onGoTo(3)}>
                  {t('remoteSiteWithCount', { count: site.linkCount })}
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Properties')}</Title>
        </CardHeader>

        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Controller version')}</DescriptionListTerm>
              <DescriptionListDescription>{`${site.controllerVersion}`}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Router version')}</DescriptionListTerm>
              <DescriptionListDescription>{`${site.routerVersion}`}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
              <DescriptionListDescription>
                <Timestamp date={new Date(site.creationTimestamp)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Modal title={t('Edit site')} variant={ModalVariant.medium} isOpen={isModalOpen} aria-label="Form edit site">
        <SiteForm
          show={visibleModalPros}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          properties={{ name: site.name, ingress: site.linkAccess }}
          siteName={site.name}
        />
      </Modal>
    </>
  );
};

export default Details;
