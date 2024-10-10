import { useCallback, useState } from 'react';

import {
  Button,
  Modal,
  ModalVariant,
  Alert,
  Stack,
  StackItem,
  AlertActionCloseButton,
  DrawerPanelContent,
  DrawerActions,
  DrawerCloseButton,
  DrawerPanelBody,
  DrawerHead,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Icon,
  Card,
  CardBody
} from '@patternfly/react-core';
import { CheckCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import { QueryKeys } from '@config/reactQuery';
import SkTable from '@core/components/SkTable';
import StatusCell from '@core/components/StatusCell';
import { Connector } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';

import ConnectorDetails from './ConnectorDetails';
import ConnectorForm from '../components/forms/ConnectorForm';

const Connectors = function () {
  const { t } = useTranslation(I18nNamespace);

  const [areDetailsOpen, setAreDetailsOpen] = useState<boolean>(false);
  const [nameSelected, setNameSelected] = useState<string | undefined>();
  const [showAlert, setShowAlert] = useState<string>(sessionStorage.getItem('showConnectorAlert') || 'show');

  const { data: connectors, refetch } = useQuery({
    queryKey: [QueryKeys.GetConnectors],
    queryFn: () => RESTApi.getConnectorsView(),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  const mutationDelete = useMutation({
    mutationFn: (name: string) => RESTApi.deleteConnector(name),
    onSuccess: () => {
      handleCloseDetails();
      refetch();
    }
  });

  function handleDelete(name: string) {
    mutationDelete.mutate(name);
  }

  const handleModalClose = useCallback(() => {
    setAreDetailsOpen(false);
  }, []);

  const handleModalSubmit = useCallback(() => {
    handleModalClose();
    refetch();
  }, [handleModalClose, refetch]);

  const handleOpenDetails = useCallback((name: string) => {
    setNameSelected(name);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setNameSelected(undefined);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setShowAlert('hide');
    sessionStorage.setItem('showConnectorAlert', 'hide');
  }, []);

  const Columns: SKColumn<Connector>[] = [
    {
      name: t('Name'),
      prop: 'name',
      customCellName: 'linkCell'
    },
    {
      name: t('Routing key'),
      prop: 'routingKey'
    },
    {
      name: t('Selector'),
      prop: 'selector'
    },
    {
      name: t('Host'),
      prop: 'host'
    },
    {
      name: t('Port'),
      prop: 'port'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'StatusCell'
    },
    {
      name: t('Listeners'),
      prop: 'connected'
    },
    {
      name: '',
      customCellName: 'actions',
      modifier: 'fitContent'
    }
  ];

  const customCells = {
    linkCell: ({ data }: SKComponentProps<Connector>) => (
      <Button variant="link" onClick={() => handleOpenDetails(data.name)}>
        {data.name}
      </Button>
    ),

    StatusCell,

    connectedCell: ({ value }: SKComponentProps<Connector>) => (
      <Icon isInline status={value ? 'success' : 'danger'}>
        {value ? <CheckCircleIcon /> : <TimesIcon />}
      </Icon>
    ),

    actions: ({ data }: SKComponentProps<Connector>) => (
      <Button onClick={() => handleDelete(data.name)} variant="link">
        {t('Delete')}
      </Button>
    )
  };

  const panelContent = (
    <DrawerPanelContent isResizable minSize="30%">
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButton onClick={handleCloseDetails} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        {nameSelected && <ConnectorDetails name={nameSelected} onUpdate={handleModalSubmit} />}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            {showAlert === 'show' && (
              <Alert
                hidden={true}
                variant="info"
                actionClose={<AlertActionCloseButton onClose={handleCloseAlert} />}
                isInline
                title={t(
                  'A connector binds local servers (pods, containers, or processes) to connection listeners in remote sites. Connectors are linked to listeners by a matching routing key.'
                )}
              />
            )}
          </StackItem>

          <StackItem isFilled>
            <Button onClick={() => setAreDetailsOpen(true)}>{t('Create a connector')}</Button>
            <Drawer isExpanded={!!nameSelected} isInline>
              <DrawerContent panelContent={panelContent}>
                <DrawerContentBody>
                  <SkTable
                    columns={Columns}
                    rows={connectors || []}
                    alwaysShowPagination={false}
                    customCells={customCells}
                    isPlain
                  />
                </DrawerContentBody>
              </DrawerContent>
            </Drawer>
          </StackItem>
        </Stack>

        <Modal
          hasNoBodyWrapper
          isOpen={areDetailsOpen}
          variant={ModalVariant.medium}
          aria-label="Form create connector"
          showClose={false}
        >
          <ConnectorForm onSubmit={handleModalSubmit} onCancel={handleModalClose} title={t('Create a Connector')} />
        </Modal>
      </CardBody>
    </Card>
  );
};

export default Connectors;
