import { FC, FunctionComponent, useCallback, useMemo, useState } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import SkTable from '@core/components/SkTable';
import { createListenerRequest, createConnectorRequest } from '@core/utils/createCRD';
import { ConnectorCrdParams, ConnectorSpec, ConnectorParams } from '@interfaces/CRD_Connector';
import { ListenerCrdParams, ListenerSpec, ListenerParams } from '@interfaces/CRD_Listener';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';
import {
  FileUpload,
  DropEvent,
  Card,
  CardBody,
  Button,
  CardFooter,
  Stack,
  StackItem,
  Icon,
  TextContent,
  Tabs,
  Tab,
  TabTitleText,
  Alert,
  CardTitle,
  Title
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, ImportIcon } from '@patternfly/react-icons';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';

import { useWatchedSkupperResource } from '../../../hooks/useSkupperWatchResource';

interface ImportStatus {
  name: string;
  resourceVersion?: string;
  status?: 'Error' | 'Updated' | 'Created';
}

interface ListenerImportItem extends ListenerSpec, ImportStatus {}
interface ConnectorImportItem extends ConnectorSpec, ImportStatus {}

type DocumentParams = (ListenerParams & { kind: 'Listener' }) | (ConnectorParams & { kind: 'Connector' });

const title = 'Import Listeners and Connectors';

export const ImportForm: FC<{
  onSubmit: () => void;
}> = function ({ onSubmit }) {
  const { t } = useTranslation(I18nNamespace);
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [listeners, setListeners] = useState<ListenerImportItem[]>([]);
  const [connectors, setConnectors] = useState<ConnectorImportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'listeners' | 'connectors'>('listeners');
  const [step, setStep] = useState(0);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);

  const { data: oldConnectors } = useWatchedSkupperResource({ kind: 'Connector' });
  const { data: oldListeners } = useWatchedSkupperResource({ kind: 'Listener' });

  const mutationCreateListener = useMutation({
    mutationFn: async (data: ListenerCrdParams) =>
      RESTApi.createOrUpdateListener(data, data.metadata.resourceVersion && data.metadata.name)
  });

  const mutationCreateConnector = useMutation({
    mutationFn: async (data: ConnectorCrdParams) =>
      RESTApi.createOrUpdateConnector(data, data.metadata.resourceVersion && data.metadata.name)
  });

  const handleImport = useCallback(async () => {
    const newListenersPromised = listeners.map(async (item) => {
      const data = createListenerRequest({
        metadata: { name: item.name },
        spec: {
          routingKey: item.routingKey,
          host: item.host,
          port: Number(item.port),
          tlsCredentials: item.tlsCredentials
        }
      });

      const match = oldListeners?.find((l) => l.name === item.name);
      if (match) {
        data.metadata.resourceVersion = match.resourceVersion;
      }

      try {
        const status = await mutationCreateListener.mutateAsync(data);

        return { ...item, status } as ListenerImportItem;
      } catch {
        return { ...item, status: 'Error' } as ListenerImportItem;
      }
    });

    // Handle Connectors
    const newConnectorsPromised = connectors.map(async (item) => {
      const data = createConnectorRequest({
        metadata: { name: item.name },
        spec: {
          routingKey: item.routingKey,
          selector: item.selector,
          host: item.host,
          port: Number(item.port),
          tlsCredentials: item.tlsCredentials,
          includeNotReadyPods: item.includeNotReadyPods
        }
      });

      const match = oldConnectors?.find((c) => c.name === item.name);
      if (match) {
        data.metadata.resourceVersion = match.resourceVersion;
      }

      try {
        const status = await mutationCreateConnector.mutateAsync(data);

        return { ...item, status } as ConnectorImportItem;
      } catch {
        return { ...item, status: 'Error' } as ConnectorImportItem;
      }
    });

    const newListeners = await Promise.all(newListenersPromised);
    const newConnectors = await Promise.all(newConnectorsPromised);

    const withStatusError = [...newListeners, ...newConnectors].some((items) => items.status === 'Error');

    setListeners(newListeners);
    setConnectors(newConnectors);
    setStep(withStatusError ? 0 : 1);
    setHasErrors(withStatusError);
  }, [listeners, connectors, mutationCreateListener, mutationCreateConnector, oldListeners, oldConnectors]);

  const handleFileContentChange = useCallback((_: DropEvent, content: string) => {
    setFileContent(content);
    const newListeners: ListenerImportItem[] = [];
    const newConnectors: ConnectorImportItem[] = [];

    const documents = content
      .split('---')
      .filter((doc) => doc.trim() !== '')
      .map((doc) => parse(doc));

    documents.forEach((doc: DocumentParams) => {
      const { kind, metadata, spec } = doc;
      if (kind === 'Listener') {
        newListeners.push({
          name: metadata.name,
          ...(spec as ListenerSpec)
        });
      } else if (kind === 'Connector') {
        newConnectors.push({
          name: metadata.name,
          ...(spec as ConnectorSpec)
        });
      }
    });

    setListeners(newListeners);
    setConnectors(newConnectors);
    setStep(0);
    setHasErrors(undefined);
  }, []);

  const handleFileInputChange = useCallback((_: DropEvent, file: File) => {
    setFileName(file.name);
  }, []);

  const ListenerColumns: SKColumn<ListenerImportItem>[] = [
    {
      name: t('Name'),
      prop: 'name'
    },
    {
      name: t('Routing key'),
      prop: 'routingKey'
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
      customCellName: 'ImportStatusCell'
    }
  ];

  const ConnectorColumns: SKColumn<ConnectorImportItem>[] = [
    {
      name: t('Name'),
      prop: 'name'
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
      customCellName: 'ImportStatusCell'
    }
  ];

  const customCells = useMemo(
    () => ({
      ImportStatusCell: ({ value }: SKComponentProps<ListenerImportItem | ConnectorImportItem>) => (
        <>
          {!value && null}
          {value === 'Created' && (
            <TextContent>
              <Icon isInline status="success">
                <CheckCircleIcon />
              </Icon>{' '}
              {value}
            </TextContent>
          )}
          {value === 'Updated' && (
            <TextContent>
              <Icon isInline status="info">
                <CheckCircleIcon />
              </Icon>{' '}
              {value}
            </TextContent>
          )}
          {value === 'Error' && (
            <TextContent>
              <Icon isInline status="danger">
                <ExclamationCircleIcon />
              </Icon>{' '}
              {value}
            </TextContent>
          )}
        </>
      )
    }),
    []
  );

  const tabSelected = !listeners.length && connectors.length ? 'connectors' : activeTab;

  return (
    <Card isPlain style={{ overflow: 'auto' }}>
      <CardTitle>
        <Title headingLevel="h1">{t(title)}</Title>
      </CardTitle>

      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <FileUpload
              id="import-file"
              type="text"
              value={fileContent}
              filename={fileName}
              filenamePlaceholder="Drag and drop a file or upload one"
              browseButtonText="Upload"
              hideDefaultPreview={true}
              isClearButtonDisabled={true}
              onFileInputChange={handleFileInputChange}
              onDataChange={handleFileContentChange}
            />
          </StackItem>

          <StackItem>
            {hasErrors === false && (
              <Alert variant="success" isInline title={t('All elements have been imported successfully.')} />
            )}

            {hasErrors === true && (
              <Alert
                variant="danger"
                isInline
                title={t(
                  'An error occurred during the upload. Please review the status column for details on each element.'
                )}
              />
            )}
          </StackItem>

          <StackItem>
            <Tabs activeKey={tabSelected} onSelect={(_, key) => setActiveTab(key as typeof tabSelected)}>
              <Tab
                eventKey="listeners"
                title={
                  <TabTitleText>
                    {t('Listeners')} ({listeners.length})
                  </TabTitleText>
                }
              />
              <Tab
                eventKey="connectors"
                title={
                  <TabTitleText>
                    {t('Connectors')} ({connectors.length})
                  </TabTitleText>
                }
              />
            </Tabs>
          </StackItem>
          {tabSelected === 'listeners' && (
            <StackItem>
              <SkTable
                columns={ListenerColumns}
                customCells={customCells as Record<string, FunctionComponent<SKComponentProps<ListenerImportItem>>>}
                rows={listeners}
                alwaysShowPagination={false}
                isPlain
              />
            </StackItem>
          )}

          {tabSelected === 'connectors' && (
            <StackItem>
              <SkTable
                columns={ConnectorColumns}
                customCells={customCells as Record<string, FunctionComponent<SKComponentProps<ConnectorImportItem>>>}
                rows={connectors}
                alwaysShowPagination={false}
                isPlain
              />
            </StackItem>
          )}
        </Stack>
      </CardBody>

      <CardFooter>
        {step === 0 && (
          <Button onClick={handleImport} icon={<ImportIcon />} isDisabled={!fileContent}>
            {t('Import')}
          </Button>
        )}

        {step === 1 && <Button onClick={onSubmit}>{t('Done')}</Button>}

        <Button variant="link" onClick={onSubmit}>
          {t('Dismiss')}
        </Button>
      </CardFooter>
    </Card>
  );
};
