import { FC, useCallback, useState } from 'react';

import { I18nNamespace } from '@config/config';
import {
  Title,
  Button,
  Modal,
  ModalVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Alert,
  AlertActionCloseButton,
  Stack,
  StackItem,
  PageSection
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import {} from '@interfaces/CRD_AccessToken';

import AccessGrantTable from './GrantsTable';
import { useLinks } from './hooks/useLinks';
import { LinksTable, RemoteLinksTable } from './LinksTable';
import LoadingPage from '../../../core/components/Loading';
import GrantForm from '../../components/forms/GrantForm';
import LinkForm from '../../components/forms/LinkForm';

const Links: FC<{ siteId: string }> = function ({ siteId }) {
  const { t } = useTranslation(I18nNamespace);
  const { data, loading, actions } = useLinks();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean | undefined>();
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean | undefined>();
  const [showAlert, setShowAlert] = useState<string>(sessionStorage.getItem('showALinkAlert') || 'show');

  const handleModalClose = useCallback(() => {
    setIsLinkModalOpen(undefined);
  }, []);

  const handleTokenModalClose = useCallback(() => {
    setIsTokenModalOpen(false);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setShowAlert('hide');
    sessionStorage.setItem('showALinkAlert', 'hide');
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <PageSection>
      {showAlert === 'show' && (
        <Alert
          hidden={true}
          variant="info"
          isInline
          actionClose={<AlertActionCloseButton onClose={handleCloseAlert} />}
          title={t(
            'Links enable communication between sites. Once sites are linked, they form a network. Click issue token button to generate a downloadable token file for linking a remote site.'
          )}
        />
      )}

      <Toolbar>
        <ToolbarContent className="pf-v5-u-pl-0">
          <ToolbarItem>
            <Button onClick={() => setIsLinkModalOpen(true)}>{t('Create link')}</Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="secondary" onClick={setIsTokenModalOpen.bind(null, true)}>
              {t('Create token')}
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Stack hasGutter>
        <StackItem className="pf-v5-u-mb-lg">
          <LinksTable
            links={[...(data.accessTokens?.filter(({ status }) => status !== 'Ready') || []), ...(data.links || [])]}
            onDeleteLink={actions.handleDeleteLink}
            t={t}
          />
        </StackItem>

        {!!data.remoteLinks?.length && (
          <StackItem className="pf-v5-u-mb-lg">
            <Title headingLevel="h1">{t('Links from remote sites')}</Title>

            <RemoteLinksTable links={data.remoteLinks} t={t} />
          </StackItem>
        )}

        <StackItem>
          <Title headingLevel="h1">{t('Grants')}</Title>

          <AccessGrantTable
            grants={data.accessGrants || []}
            onDownloadGrant={actions.handleDownloadGrant}
            onDeleteGrant={actions.handleDeleteGrant}
            t={t}
          />
        </StackItem>

        <Modal
          hasNoBodyWrapper
          isOpen={isLinkModalOpen}
          variant={ModalVariant.large}
          aria-label="Form create link"
          showClose={false}
        >
          <LinkForm onSubmit={handleModalClose} onCancel={handleModalClose} siteId={siteId} />
        </Modal>

        <Modal
          hasNoBodyWrapper
          isOpen={!!isTokenModalOpen}
          variant={ModalVariant.large}
          aria-label="Form issue token"
          showClose={false}
        >
          <GrantForm onSubmit={handleTokenModalClose} onCancel={handleTokenModalClose} />
        </Modal>
      </Stack>
    </PageSection>
  );
};

export default Links;
