import { FC, useCallback, useMemo, useState } from 'react';

import {
  FileUpload,
  DropEvent,
  Card,
  CardTitle,
  Title,
  CardBody,
  Button,
  CardFooter,
  Stack,
  StackItem,
  Icon,
  TextContent
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, ImportIcon } from '@patternfly/react-icons';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import SkTable from '@core/components/SkTable';
import { createConnectorRequest } from '@core/utils/createCRD';
import { ConnectorCrdParams, ConnectorParams, ConnectorSpec } from '@interfaces/CRD_Connector';
import { Connector } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';

interface ConnectorCrdAttributes extends ConnectorSpec {
  name: string;
  resourceVersion?: string;
  status?: 'Error' | 'Updated' | 'Created';
}

const title = 'Create or Update Listeners';

export const ImportConnectorsForm: FC<{ oldItems: Connector[]; onSubmit: () => void; onCancel: () => void }> =
  function ({ oldItems, onSubmit }) {
    const { t } = useTranslation(I18nNamespace);

    const [fileContent, setFileContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [items, setItems] = useState<ConnectorCrdAttributes[]>([]);

    const mutationCreate = useMutation({
      mutationFn: async (data: ConnectorCrdParams) =>
        RESTApi.createOrUpdateConnector(data, data.metadata.resourceVersion && data.metadata.name)
    });

    const handleImport = useCallback(async () => {
      const newItemsPromised = items.map(
        async ({ name, routingKey, selector, host, port, tlsCredentials, includeNotReady }) => {
          const data: ConnectorCrdParams = createConnectorRequest({
            metadata: {
              name
            },
            spec: {
              routingKey,
              host,
              port: Number(port),
              selector,
              tlsCredentials,
              includeNotReady
            }
          });

          const match = oldItems.find((item) => item.name === name);

          if (match) {
            data.metadata.resourceVersion = match.resourceVersion;
          }

          const json: ConnectorCrdAttributes = {
            ...data.metadata,
            ...data.spec
          };

          try {
            const status = await mutationCreate.mutateAsync(data);

            return { ...json, status } as ConnectorCrdAttributes;
          } catch {
            return { ...json, status: 'Error' } as ConnectorCrdAttributes;
          }
        }
      );

      const newItems = await Promise.all(newItemsPromised);
      setItems(newItems);
    }, [items, mutationCreate, oldItems]);

    const handleFileContentChange = useCallback((_: DropEvent, content: string) => {
      setFileContent(content);
      setItems(
        content
          .split('---')
          .filter((doc) => doc.trim() !== '')
          .map((doc) => parse(doc))
          .map(({ metadata, spec }: ConnectorParams) => ({
            name: metadata.name,
            routingKey: spec.routingKey,
            selector: spec.selector,
            host: spec.host,
            port: spec.port,
            tlsCredentials: spec.tlsCredentials,
            includeNotReady: spec.includeNotReady
          }))
      );
    }, []);

    const handleFileInputChange = useCallback((_: DropEvent, file: File) => {
      setFileName(file.name);
    }, []);

    const Columns: SKColumn<ConnectorCrdAttributes>[] = [
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
        ImportStatusCell: ({ value }: SKComponentProps<ConnectorCrdAttributes>) => (
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

    return (
      <Card isPlain>
        <CardTitle>
          <Title headingLevel="h1">{t(title)}</Title>
        </CardTitle>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <FileUpload
                id="access-token-file"
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
              <Button onClick={handleImport} icon={<ImportIcon />} isDisabled={!fileContent}>
                {t('Import')}
              </Button>
            </StackItem>

            <StackItem>
              <SkTable columns={Columns} customCells={customCells} rows={items} alwaysShowPagination={false} isPlain />
            </StackItem>
          </Stack>
        </CardBody>
        <CardFooter>
          <Button variant="link" onClick={onSubmit}>
            {t('Dismiss')}
          </Button>
        </CardFooter>
      </Card>
    );
  };
