import { FC, useCallback, useState } from 'react';

import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Button,
  Flex,
  FlexItem,
  Icon,
  Label,
  Modal,
  ModalVariant,
  Title
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { TFunction } from 'react-i18next';

import { SiteView } from '../../../interfaces/REST.interfaces';
import DeleteSiteButton from '../../components/DeleteSiteButton';
import { ImportForm } from '../../components/forms/ImportForm';

const Header: FC<{ site: SiteView | undefined; t: TFunction }> = function ({ site, t }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportOpen = useCallback(() => {
    setIsImportModalOpen(true);
  }, []);

  const handleImportClose = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  return (
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
              {!site?.hasError && !!site?.isConfigured && !!site?.isReady && (
                <Icon status="success">
                  <CheckCircleIcon />
                </Icon>
              )}
              {'  '} {site?.status} {'  '}
              {!site?.hasError && site?.hasSecondaryErrors && (
                <Icon status="warning">{<YellowExclamationTriangleIcon />}</Icon>
              )}
            </Label>
          )}
        </Flex>
      </FlexItem>
      {site?.name && (
        <FlexItem>
          <ActionList>
            <ActionListItem>
              <Button onClick={handleImportOpen}>{t('Import')}</Button>
            </ActionListItem>
            <ActionListItem>
              <DeleteSiteButton id={site.name} />
            </ActionListItem>
          </ActionList>
        </FlexItem>
      )}

      <Modal hasNoBodyWrapper isOpen={isImportModalOpen} variant={ModalVariant.large} showClose={false}>
        <ImportForm onSubmit={handleImportClose} />
      </Modal>
    </Flex>
  );
};

export default Header;
