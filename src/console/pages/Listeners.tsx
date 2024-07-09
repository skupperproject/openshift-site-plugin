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
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  Icon,
  Card,
  CardBody
} from '@patternfly/react-core';
import { CheckCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';
import SkTable from '@core/components/SkTable';
import { Listener } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';

import ListenerForm from './components/ListenerForm';
import ListenerDetails from './ListenerDetails';

const Listeners = function () {
  const { t } = useTranslation(I18nNamespace);

  const [isOpen, setIsOpen] = useState<boolean>();
  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [nameSelected, setNameSelected] = useState<string | undefined>();

  const { data: listeners, refetch } = useQuery({
    queryKey: ['get-listeners-query'],
    queryFn: () => RESTApi.getListenersView(),
    refetchInterval: REFETCH_QUERY_INTERVAL
  });

  const mutationDelete = useMutation({
    mutationFn: (name: string) => RESTApi.deleteListener(name),
    onSuccess: () => {
      handleCloseDetails();
      refetch();
    }
  });

  function handleDelete(name: string) {
    mutationDelete.mutate(name);
  }

  const handleModalSubmit = useCallback(() => {
    handleModalClose();
    refetch();
  }, [refetch]);

  const handleModalClose = () => {
    setIsOpen(undefined);
  };

  const handleOpenDetails = (name: string) => {
    setNameSelected(name);
  };

  const handleCloseDetails = () => {
    setNameSelected(undefined);
  };

  const Columns: SKColumn<Listener>[] = [
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
      name: t('Service name'),
      prop: 'serviceName'
    },
    {
      name: t('Port'),
      prop: 'port'
    },
    {
      name: t('Type'),
      prop: 'type'
    },
    {
      name: t('Connected'),
      prop: 'connected',
      customCellName: 'connectedCell'
    },
    {
      name: '',
      customCellName: 'actions',
      modifier: 'fitContent'
    }
  ];

  const customCells = {
    linkCell: ({ data }: SKComponentProps<Listener>) => (
      <Button variant="link" onClick={() => handleOpenDetails(data.name)}>
        {data.name}
      </Button>
    ),

    connectedCell: ({ value }: SKComponentProps<Listener>) => (
      <Icon isInline status={value ? 'success' : 'danger'}>
        {value ? <CheckCircleIcon /> : <TimesIcon />}
      </Icon>
    ),

    actions: ({ data }: SKComponentProps<Listener>) => (
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
        {nameSelected && <ListenerDetails name={nameSelected} onUpdate={handleModalSubmit} />}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            {showAlert && (
              <Alert
                hidden={true}
                variant="info"
                isInline
                actionClose={<AlertActionCloseButton onClose={() => setShowAlert(false)} />}
                title={t(
                  'A listener is a local connection endpoint that is associated with remote servers. Listeners expose a host and port for accepting connections. Listeners use a routing key to forward connection data to remote connectors.'
                )}
              />
            )}
          </StackItem>

          <StackItem isFilled>
            <Button onClick={() => setIsOpen(true)}>{t('Create a listener')}</Button>
            <Drawer isExpanded={!!nameSelected} isInline>
              <DrawerContent panelContent={panelContent}>
                <DrawerContentBody>
                  <SkTable
                    columns={Columns}
                    rows={listeners || []}
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
          title={t('Create a listener')}
          isOpen={!!isOpen}
          variant={ModalVariant.medium}
          aria-label="Form create listener"
          showClose={false}
        >
          <ListenerForm onSubmit={handleModalSubmit} onCancel={handleModalClose} />
        </Modal>
      </CardBody>
    </Card>
  );
};

export default Listeners;
