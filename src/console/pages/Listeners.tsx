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
  DrawerPanelBody
} from '@patternfly/react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import SkTable from '@core/components/SkTable';
import { ListCrdResponse, ListenerCrdResponse } from '@interfaces/CRD.interfaces';
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
    queryFn: () => RESTApi.getListeners()
  });

  const mutationDelete = useMutation({
    mutationFn: (name: string) => RESTApi.deleteListener(name),
    onSuccess: () => {
      setTimeout(() => {
        refetch();
      }, 500);
    }
  });

  function handleDelete(name: string) {
    mutationDelete.mutate(name);
  }

  const handleRefresh = useCallback(() => {
    setTimeout(() => {
      refetch();
    }, 500);

    handleModalClose();
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

  if (!listeners) {
    return null;
  }

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
        {nameSelected && <ListenerDetails name={nameSelected} onRefetch={handleRefresh} />}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
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
                  rows={parseListeners(listeners)}
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
      >
        <ListenerForm onSubmit={handleRefresh} onCancel={handleModalClose} />
      </Modal>
    </>
  );
};

export default Listeners;

function parseListeners({ items }: ListCrdResponse<ListenerCrdResponse>): Listener[] {
  return items.map((item) => ({
    id: item.metadata.uid,
    name: item.metadata.name,
    creationTimestamp: item.metadata.creationTimestamp,
    routingKey: item.spec.routingKey,
    serviceName: item.spec.host,
    port: item.spec.port
  }));
}
