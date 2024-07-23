import { FC, useState } from 'react';

import {
  Title,
  Button,
  Modal,
  ModalVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Alert,
  Icon,
  AlertActionCloseButton,
  Timestamp,
  Stack,
  StackItem,
  CardBody,
  CardHeader,
  Card
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { CR_STATUS_OK, EMPTY_VALUE_SYMBOL, I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import SkTable from '@core/components/SkTable';
import { ClaimCrdResponse, GrantCrdResponse, ISO8601Timestamp, LinkCrdResponse } from '@interfaces/CRD.interfaces';
import { Grant, Link } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';

import GrantForm from './components/GrantForm';
import LinkForm from './components/LinkForm';

const Links: FC<{ siteId: string }> = function ({ siteId }) {
  const { t } = useTranslation(I18nNamespace);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean | undefined>();
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean | undefined>();
  const [showAlert, setShowAlert] = useState<boolean>(true);

  const { data: grants, refetch: refetchGrants } = useQuery({
    queryKey: ['get-grants-query'],
    queryFn: () => RESTApi.getGrants(),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const { data: claims, refetch: refetchClaims } = useQuery({
    queryKey: ['get-claims-query'],
    queryFn: () => RESTApi.getClaims(),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const { data: links, refetch: refetchLinks } = useQuery({
    queryKey: ['get-links-query'],
    queryFn: () => RESTApi.getLinks(),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const { data: remoteLinks, refetch: refetchRemoteLinks } = useQuery({
    queryKey: ['get-remote-links-query'],
    queryFn: () => RESTApi.getRemoteLinks(),
    refetchInterval: isLinkModalOpen || isTokenModalOpen ? 0 : REFETCH_QUERY_INTERVAL
  });

  const mutationDeleteGrant = useMutation({
    mutationFn: (name: string) => RESTApi.deleteGrant(name),
    onSuccess: () => {
      setTimeout(() => {
        refetchGrants();
      }, 500);
    }
  });

  const mutationDeleteLink = useMutation({
    mutationFn: (name: string) => RESTApi.deleteLink(name),
    onSuccess: () => {
      setTimeout(() => {
        refetchClaims();
        refetchLinks();
        refetchRemoteLinks();
      }, 500);
    }
  });

  const mutationDeleteClaim = useMutation({
    mutationFn: (name: string) => RESTApi.deleteClaim(name)
  });

  function handleDeleteLink(name: string) {
    mutationDeleteClaim.mutate(name);
    mutationDeleteLink.mutate(name);
  }

  const handleDownload = (grant: GrantCrdResponse) => {
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

  function handleDeleteGrant(name: string) {
    mutationDeleteGrant.mutate(name);
  }

  const handleRefreshLinks = () => {
    setTimeout(() => {
      refetchClaims();
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
      refetchGrants();
    }, 1000);

    setIsTokenModalOpen(false);
  };

  const grantColumns: SKColumn<Grant>[] = [
    {
      name: t('Name'),
      prop: 'name'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'status'
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
      customCellName: 'date'
    },
    {
      name: '',
      customCellName: 'actions',
      modifier: 'fitContent'
    }
  ];

  const localLinkColumns: SKColumn<Link>[] = [
    {
      name: t('Name'),
      prop: 'name'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'status'
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
    status: ({ data }: SKComponentProps<Link>) => (
      <>
        {!data.status && (
          <span>
            <Icon isInline>{<InProgressIcon />}</Icon> {t('In progress')}
          </span>
        )}
        {data.status && (
          <span>
            <Icon isInline status={data.status === CR_STATUS_OK ? 'success' : 'danger'}>
              {data.status === CR_STATUS_OK ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
            </Icon>{' '}
            {data.status === CR_STATUS_OK ? t('Configured') : data.status}
          </span>
        )}
      </>
    ),

    actions: ({ data }: SKComponentProps<Link>) => (
      <Button onClick={() => handleDeleteLink(data.name)} variant="link">
        {t('Delete')}
      </Button>
    )
  };

  const customGrantCells = {
    status: ({ data }: SKComponentProps<Grant>) => (
      <>
        {!data.status && (
          <span>
            <Icon isInline>{<InProgressIcon />}</Icon> {t('In progress')}
          </span>
        )}
        {data.status && (
          <span>
            <Icon isInline status={data.status === CR_STATUS_OK ? 'success' : 'danger'}>
              {data.status === CR_STATUS_OK ? <CheckCircleIcon /> : <ExclamationCircleIcon />}
            </Icon>{' '}
            {data.status}
          </span>
        )}
      </>
    ),
    date: ({ value, data }: SKComponentProps<Grant>) => {
      const now = new Date();
      const ValidFor = new Date(value as ISO8601Timestamp);

      return now > ValidFor ? t('Expired') : data.status ? <Timestamp date={ValidFor} /> : '';
    },
    actions: ({ data }: SKComponentProps<Grant>) => (
      <>
        <Button
          onClick={() => handleDownload(data.data)}
          variant="link"
          isDisabled={
            !data.status ||
            data.status !== CR_STATUS_OK ||
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
            {showAlert && (
              <Alert
                hidden={true}
                variant="info"
                isInline
                actionClose={<AlertActionCloseButton onClose={() => setShowAlert(false)} />}
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
              columns={localLinkColumns}
              rows={[...convertAccessTokensToLinks(claims?.items || []), ...parseLinks(links?.items || [])]}
              customCells={customLinkCells}
              alwaysShowPagination={false}
              isPlain
            />
          </CardBody>
        </Card>
      </StackItem>

      <StackItem>
        <Card isPlain>
          <CardHeader>
            <Title headingLevel="h1">{t('Links from remote sites')}</Title>
          </CardHeader>

          <CardBody>
            <SkTable
              columns={remoteLinkColumns}
              rows={
                remoteLinks?.map((link) => ({
                  connectedTo: extractSiteNameFromUrl(link.name, '', '-skupper-router')
                })) || []
              }
              alwaysShowPagination={false}
              isPlain
            />
          </CardBody>
        </Card>
      </StackItem>

      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Grants')}</Title>
        </CardHeader>

        <CardBody>
          <SkTable
            columns={grantColumns}
            rows={parseGrants(grants?.items || [])}
            customCells={customGrantCells}
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

function parseLinks(links: LinkCrdResponse[]): Link[] {
  return links.map((link) => {
    const id = link.metadata?.uid;
    const name = link.metadata?.name;
    const creationTimestamp = link.metadata?.creationTimestamp;

    // TODO: cost need to be enabled in Skupper v2
    const cost = EMPTY_VALUE_SYMBOL;
    const status = link.status?.status;
    const connectedTo =
      extractSiteNameFromUrl(
        link?.spec.endpoints[0].host || '',
        `${link?.spec.endpoints[0].group}-${link?.spec.endpoints[0].name}-`
      ) || EMPTY_VALUE_SYMBOL;

    return {
      connectedTo,
      cost,
      status,
      creationTimestamp,
      name,
      id
    };
  });
}

function convertAccessTokensToLinks(claims: ClaimCrdResponse[]): Link[] {
  const unRedeemedClaims = claims.filter((claim) => !claim.status?.redeemed);

  return unRedeemedClaims.map((claim) => {
    const id = claim.metadata?.uid;
    const name = claim.metadata?.name;
    const creationTimestamp = claim.metadata?.creationTimestamp;

    const status = claim.status?.status;
    const cost = EMPTY_VALUE_SYMBOL;
    const connectedTo = EMPTY_VALUE_SYMBOL;

    return {
      connectedTo,
      cost,
      status,
      creationTimestamp,
      name,
      id
    };
  });
}

function parseGrants(grants: GrantCrdResponse[]): Grant[] {
  return grants.map((grant) => {
    const id = grant.metadata?.uid;
    const name = grant.metadata?.name;
    const creationTimestamp = grant.metadata?.creationTimestamp;

    // TODO: cost need to be enabled in Skupper v2
    const redemptionsAllowed = grant.spec?.redemptionsAllowed || 0;
    const redeemed = grant.status?.redeemed || 0;
    const status = grant.status?.status;
    const expirationWindow = grant.status?.expiration;

    return {
      data: grant,
      redemptionsAllowed,
      redeemed,
      expirationWindow,
      status,
      creationTimestamp,
      name,
      id
    };
  });
}

function extractSiteNameFromUrl(url?: string, prefix?:string, suffix = '.') {
  // Check if the input is an IP address
  const ipPattern = new RegExp(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
  if (url && ipPattern.test(url)) {
    // If it's an IP address, return it as is
    return url;
  }

  // If it's not an IP address, apply the original regex pattern
  let regexPattern = `(?:)?([^.-]+(?:\\.[^.-]+)?)${suffix}`;

  if (prefix) {
    regexPattern = `${prefix}([^.-]+(?:-[^.-]+)?)${suffix}`;
  }

  const match = url?.match(new RegExp(regexPattern));

  return match ? match[1] : null;
}

export default Links;
