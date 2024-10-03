import { FC, useCallback, useState } from 'react';

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
  CardBody,
  CardHeader,
  Card
} from '@patternfly/react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { convertAccessTokensToLinks, hasType } from '@API/REST.utils';
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import FormatOCPDateCell from '@core/components/FormatOCPDate';
import SkTable from '@core/components/SkTable';
import StatusCell from '@core/components/StatusCell';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdResponse } from '@interfaces/CRD_AccessToken';
import { ISO8601Timestamp } from '@interfaces/CRD_Base';
import { AccessGrant, Link } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';

import GrantForm from './components/GrantForm';
import LinkForm from './components/LinkForm';

const Links: FC<{ siteId: string }> = function ({ siteId }) {
  const { t } = useTranslation(I18nNamespace);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean | undefined>();
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean | undefined>();
  const [showAlert, setShowAlert] = useState<string>(sessionStorage.getItem('showALinkAlert') || 'show');

  const { data: accessGrants, refetch: refetchAccessGrants } = useQuery({
    queryKey: ['get-grants-query'],
    queryFn: () => RESTApi.getAccessGrantsView(),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const { data: accessTokens, refetch: refetchAccessTokens } = useQuery({
    queryKey: ['get-claims-query'],
    queryFn: () => RESTApi.getAccessTokens(),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const { data: links, refetch: refetchLinks } = useQuery({
    queryKey: ['get-links-query'],
    queryFn: () => RESTApi.getLinksView(),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const { data: remoteLinks, refetch: refetchRemoteLinks } = useQuery({
    queryKey: ['get-remote-links-query'],
    queryFn: () => RESTApi.getRemoteLinks(siteId),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const mutationDeleteAccessGrant = useMutation({
    mutationFn: (name: string) => RESTApi.deleteGrant(name),
    onSuccess: () => {
      setTimeout(() => {
        refetchAccessGrants();
      }, 500);
    }
  });

  const mutationDeleteLink = useMutation({
    mutationFn: (name: string) => RESTApi.deleteLink(name),
    onSuccess: () => {
      setTimeout(() => {
        refetchAccessTokens();
        refetchLinks();
        refetchRemoteLinks();
      }, 500);
    }
  });

  const mutationDeleteAccessToken = useMutation({
    mutationFn: (name: string) => RESTApi.deleteAccessToken(name)
  });

  function handleDeleteLink(name: string) {
    let accessTokenName = accessTokens?.items.find((item) => item.metadata.name === name);

    if (!accessTokenName) {
      // HA case
      accessTokenName = accessTokens?.items.find((item) => name.includes(item.metadata.name));
    }

    if (accessTokenName) {
      mutationDeleteAccessToken.mutate(accessTokenName?.metadata.name);
    }

    mutationDeleteLink.mutate(name);
  }

  const handleDownload = (grant: AccessGrantCrdResponse) => {
    if (grant?.status) {
      const blob = new Blob([stringify(grant)], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${grant.metadata.name}.yaml`;
      link.setAttribute('download', `${grant.metadata.name}.yaml`);

      document.body.appendChild(link).click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteGrant = useCallback(
    (name: string) => {
      mutationDeleteAccessGrant.mutate(name);
    },
    [mutationDeleteAccessGrant]
  );

  const handleRefreshLinks = () => {
    setTimeout(() => {
      refetchAccessTokens();
      refetchLinks();
      refetchRemoteLinks();
    }, 1000);

    handleModalClose();
  };

  const handleModalClose = () => {
    setIsLinkModalOpen(undefined);
  };

  const handleTokenModalClose = () => {
    setTimeout(() => {
      refetchAccessGrants();
    }, 1000);

    setIsTokenModalOpen(false);
  };

  const handleCloseAlert = () => {
    setShowAlert('hide');
    sessionStorage.setItem('showALinkAlert', 'hide');
  };

  const accessGrantColumns: SKColumn<AccessGrant>[] = [
    {
      name: t('Name'),
      prop: 'name'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'StatusCell'
    },
    {
      name: t('Redemptions Allowed'),
      prop: 'redemptionsAllowed'
    },
    {
      name: t('Redeemed'),
      prop: 'redeemed'
    },
    {
      name: t('Expiration'),
      prop: 'expirationWindow',
      customCellName: 'date',
      modifier: 'fitContent'
    },
    {
      name: '',
      customCellName: 'actions',
      modifier: 'fitContent'
    }
  ];

  const LinkColumns: SKColumn<Link>[] = [
    {
      name: t('Name'),
      prop: 'name'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'StatusCell'
    },
    {
      name: t('Linked to'),
      prop: 'connectedTo'
    },
    {
      name: t('Cost'),
      prop: 'cost'
    },
    {
      name: '',
      customCellName: 'actions',
      modifier: 'fitContent'
    }
  ];

  const remoteLinkColumns: SKColumn<{ connectedTo: string | null }>[] = [
    {
      name: t('Linked to'),
      prop: 'connectedTo'
    }
  ];

  const customLinkCells = {
    StatusCell,

    actions: ({ data }: SKComponentProps<Link>) => (
      <Button onClick={() => handleDeleteLink(data.name)} variant="link">
        {t('Delete')}
      </Button>
    )
  };

  const customAccessGrantCells = {
    StatusCell,

    date: ({ value, data }: SKComponentProps<AccessGrant>) => {
      const now = new Date();
      const ValidFor = new Date(value as ISO8601Timestamp);

      return now > ValidFor ? t('Expired') : data.status ? <FormatOCPDateCell value={ValidFor} /> : '';
    },
    actions: ({ data }: SKComponentProps<AccessGrant>) => (
      <>
        <Button
          onClick={() => handleDownload(data.data)}
          variant="link"
          isDisabled={
            !data.status ||
            data.hasError ||
            new Date() > new Date(data.expirationWindow as ISO8601Timestamp) ||
            (data.redeemed || 0) >= (data.redemptionsAllowed || 0)
          }
        >
          {t('Download')}
        </Button>
        <Button onClick={() => handleDeleteGrant(data.name)} variant="link">
          {t('Delete')}
        </Button>
      </>
    )
  };

  return (
    <Stack hasGutter>
      <StackItem>
        <Card isPlain>
          <CardBody>
            {showAlert === 'show' && (
              <Alert
                hidden={true}
                variant="info"
                isInline
                actionClose={<AlertActionCloseButton onClose={handleCloseAlert} />}
                title={t(
                  'Links enable communication between sites. Once sites are linked, they form a network. Click create token button to generate a downloadable token file for linking a remote site.'
                )}
              />
            )}

            <Toolbar>
              <ToolbarContent className="pf-v5-u-pl-0">
                <ToolbarItem>
                  <Button onClick={() => setIsLinkModalOpen(true)}>{t('Create link')}</Button>
                </ToolbarItem>
                <ToolbarItem>
                  <Button variant="secondary" onClick={() => setIsTokenModalOpen(true)}>
                    {t('Create token')}
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            <SkTable
              columns={LinkColumns}
              rows={[...convertUnredeemedAccessTokensToLinks(accessTokens?.items || []), ...(links || [])]}
              customCells={customLinkCells}
              alwaysShowPagination={false}
              isPlain
            />
          </CardBody>
        </Card>
      </StackItem>

      {!!remoteLinks?.length && (
        <StackItem>
          <Card isPlain>
            <CardHeader>
              <Title headingLevel="h1">{t('Links from remote sites')}</Title>
            </CardHeader>

            <CardBody>
              <SkTable
                columns={remoteLinkColumns}
                rows={
                  remoteLinks?.map((name) => ({
                    connectedTo: name
                  })) || []
                }
                alwaysShowPagination={false}
                isPlain
              />
            </CardBody>
          </Card>
        </StackItem>
      )}

      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Grants')}</Title>
        </CardHeader>

        <CardBody>
          <SkTable
            columns={accessGrantColumns}
            rows={accessGrants || []}
            customCells={customAccessGrantCells}
            alwaysShowPagination={false}
            isPlain
          />
        </CardBody>
      </Card>

      <Modal
        hasNoBodyWrapper
        isOpen={isLinkModalOpen}
        variant={ModalVariant.large}
        aria-label="Form create link"
        showClose={false}
      >
        <LinkForm onSubmit={handleRefreshLinks} onCancel={handleRefreshLinks} siteId={siteId} />
      </Modal>

      <Modal
        hasNoBodyWrapper
        isOpen={!!isTokenModalOpen}
        variant={ModalVariant.large}
        aria-label="Form create token"
        showClose={false}
      >
        <GrantForm onSubmit={handleTokenModalClose} onCancel={handleTokenModalClose} />
      </Modal>
    </Stack>
  );
};

function convertUnredeemedAccessTokensToLinks(accessTokens: AccessTokenCrdResponse[]): Link[] {
  const unRedeemedAccessTokens = accessTokens.filter(
    (accessToken) => !hasType(accessToken.status?.conditions, 'Redeemed')
  );

  return convertAccessTokensToLinks(unRedeemedAccessTokens);
}

export default Links;
