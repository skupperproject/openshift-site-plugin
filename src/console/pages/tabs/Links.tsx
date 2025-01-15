import { FC, useCallback, useState } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import FormatOCPDateCell from '@core/components/FormatOCPDate';
import SkTable from '@core/components/SkTable';
import StatusCell from '@core/components/StatusCell';
import { AccessGrantCrdResponse } from '@interfaces/CRD_AccessGrant';
import { ISO8601Timestamp } from '@interfaces/CRD_Base';
import { AccessGrant, Link } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';
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
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

import {} from '@interfaces/CRD_AccessToken';

import LoadingPage from '../../core/components/Loading';
import { useWatchedSkupperResource } from '../../hooks/useSkupperWatchResource';
import GrantForm from '../components/forms/GrantForm';
import LinkForm from '../components/forms/LinkForm';

const Links: FC<{ siteId: string }> = function ({ siteId }) {
  const { t } = useTranslation(I18nNamespace);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean | undefined>();
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean | undefined>();
  const [showAlert, setShowAlert] = useState<string>(sessionStorage.getItem('showALinkAlert') || 'show');

  const { data: accessGrants, loaded: grantLoaded } = useWatchedSkupperResource({ kind: 'AccessGrant' });
  const { data: accessTokens, loaded: tokenLoaded } = useWatchedSkupperResource({ kind: 'AccessToken' });
  const { data: links, loaded: linkLoaded } = useWatchedSkupperResource({ kind: 'Link' });
  const { data: sites, loaded: siteLoaded } = useWatchedSkupperResource({ kind: 'Site' });

  const remoteLinks =
    sites?.[0].remoteLinks?.map((name) => ({
      connectedTo: name
    })) || [];
  const mutationDeleteAccessGrant = useMutation({
    mutationFn: (name: string) => RESTApi.deleteGrant(name)
  });

  const mutationDeleteLink = useMutation({
    mutationFn: (name: string) => RESTApi.deleteLink(name)
  });

  const mutationDeleteAccessToken = useMutation({
    mutationFn: (name: string) => RESTApi.deleteAccessToken(name)
  });

  function handleDeleteLink(name: string) {
    let accessTokenName = accessTokens?.find((item) => item.name === name);

    if (!accessTokenName) {
      // HA case
      accessTokenName = accessTokens?.find((item) => name.includes(item.name));
    }

    if (accessTokenName) {
      mutationDeleteAccessToken.mutate(accessTokenName?.name);
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

  const accessGrantColumns: SKColumn<AccessGrant>[] = [
    {
      name: t('Name'),
      prop: 'name'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'StatusCell',
      width: 15
    },
    {
      name: t('Message'),
      prop: 'statusMessage'
    },
    {
      name: t('Redemptions Allowed'),
      prop: 'redemptionsAllowed'
    },
    {
      name: t('Redeemed'),
      prop: 'redemptions'
    },
    {
      name: t('Expiration'),
      prop: 'expirationTime',
      customCellName: 'Date',
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
      customCellName: 'StatusCell',
      width: 15
    },
    {
      name: t('Message'),
      prop: 'statusMessage'
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

    Date: ({ value, data }: SKComponentProps<AccessGrant>) => {
      const now = new Date();
      const ValidFor = new Date(value as ISO8601Timestamp);

      return now > ValidFor ? t('Expired') : data.status ? <FormatOCPDateCell value={ValidFor} /> : '';
    },
    actions: ({ data }: SKComponentProps<AccessGrant>) => (
      <>
        <Button
          onClick={() => handleDownload(data.rawData)}
          variant="link"
          isDisabled={
            !data.status ||
            data.hasError ||
            new Date() > new Date(data.expirationTime as ISO8601Timestamp) ||
            (data.redemptions || 0) >= (data.redemptionsAllowed || 0)
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

  if (!grantLoaded || !tokenLoaded || !linkLoaded || !siteLoaded) {
    return <LoadingPage />;
  }

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

            <SkTable
              columns={LinkColumns}
              rows={[...(accessTokens?.filter(({ status }) => status !== 'Ready') || []), ...(links || [])]}
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
              <SkTable columns={remoteLinkColumns} rows={remoteLinks} alwaysShowPagination={false} isPlain />
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
  );
};

export default Links;
