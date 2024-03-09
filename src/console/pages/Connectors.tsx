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
  DrawerContentBody
} from '@patternfly/react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import SkTable from '@core/components/SkTable';
import { ConnectorCrdResponse, ListCrdResponse } from '@interfaces/CRD.interfaces';
import { Connector } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';

import ConnectorForm from './components/ConnectorForm';
import ConnectorDetails from './ConnectorDetails';

const Connectors = function () {
  const { t } = useTranslation(I18nNamespace);

  const [isOpen, setIsOpen] = useState<boolean>();
  const [showAlert, setShowAlert] = useState<boolean>(true);
  const [nameSelected, setNameSelected] = useState<string | undefined>();

  const { data: connectors, refetch } = useQuery({
    queryKey: ['get-connectors-query'],
    queryFn: () => RESTApi.getConnectors()
  });

  const mutationDelete = useMutation({
    mutationFn: (name: string) => RESTApi.deleteConnector(name),
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

  const handleOpenDetails = (name: string) => {
    setNameSelected(name);
  };

  const handleCloseDetails = () => {
    setNameSelected(undefined);
  };

  const handleModalClose = () => {
    setIsOpen(undefined);
  };

  if (!connectors) {
    return null;
  }

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
        {nameSelected && <ConnectorDetails name={nameSelected} onRefetch={handleRefresh} />}
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
              actionClose={<AlertActionCloseButton onClose={() => setShowAlert(false)} />}
              isInline
              title={t(
                'A connector binds local servers (pods, containers, or processes) to connection listeners in remote sites. Connectors are linked to listeners by a matching routing key.'
              )}
            />
          )}
        </StackItem>

        <StackItem isFilled>
          <Drawer isExpanded={!!nameSelected} isInline>
            <DrawerContent panelContent={panelContent}>
              <DrawerContentBody>
                <Button onClick={() => setIsOpen(true)}>{t('Create a connector')}</Button>
                <SkTable
                  columns={Columns}
                  rows={parseConnectors(connectors)}
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
        title={t('Create a Connector')}
        isOpen={!!isOpen}
        variant={ModalVariant.medium}
        aria-label="Form create connector"
      >
        <ConnectorForm onSubmit={handleRefresh} onCancel={handleModalClose} />
      </Modal>
    </>
  );
};

export default Connectors;

function parseConnectors({ items }: ListCrdResponse<ConnectorCrdResponse>): Connector[] {
  return items.map((item) => ({
    id: item.metadata.uid,
    name: item.metadata.name,
    creationTimestamp: item.metadata.creationTimestamp,
    routingKey: item.spec.routingKey,
    selector: item.spec.selector,
    host: item.spec.host,
    port: item.spec.port
  }));
}
