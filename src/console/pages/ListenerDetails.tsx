import { FC, KeyboardEvent, MouseEvent, useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Modal,
  ModalVariant,
  Tab,
  TabTitleText,
  Tabs,
  Timestamp,
  Title
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';

import ListenerForm from './components/ListenerForm';

interface ListenerDetailsProps {
  name: string;
  onUpdate?: () => void;
}

const ListenerDetails: FC<ListenerDetailsProps> = function ({ name, onUpdate }) {
  const { t } = useTranslation(I18nNamespace);

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [isOpen, setIsOpen] = useState<boolean | undefined>();

  const { data: listener, refetch } = useQuery({
    queryKey: ['find-listener-query', name],
    queryFn: () => RESTApi.findListener(name),
    enabled: false
  });

  const handleTabClick = (_: MouseEvent | KeyboardEvent, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleModalClose = () => {
    setIsOpen(undefined);
  };

  const handleModalSubmit = () => {
    handleModalClose();
    refetch();
    onUpdate?.();
  };

  useEffect(() => {
    refetch();
  }, [refetch, name]);

  return (
    <>
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
        <Tab eventKey={0} title={<TabTitleText>{t('Details')}</TabTitleText>}>
          <Card isPlain>
            <CardHeader>
              <Flex grow={{ default: 'grow' }}>
                <FlexItem>
                  <CardTitle>
                    <Title headingLevel="h1">{t('Settings')}</Title>
                  </CardTitle>
                </FlexItem>
                <FlexItem align={{ default: 'alignRight' }}>
                  <Button variant="secondary" onClick={() => setIsOpen(true)}>
                    {t('Edit')}
                  </Button>
                </FlexItem>
              </Flex>
            </CardHeader>
            <CardBody>
              <DescriptionList>
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
                  <DescriptionListDescription>{name}</DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Routing key')}</DescriptionListTerm>
                  <DescriptionListDescription>{listener?.spec.routingKey}</DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Service name')}</DescriptionListTerm>
                  <DescriptionListDescription>{listener?.spec.host}</DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Port')}</DescriptionListTerm>
                  <DescriptionListDescription>{listener?.spec.port}</DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
                  <DescriptionListDescription>{listener?.spec.type}</DescriptionListDescription>
                </DescriptionListGroup>

                {listener?.spec.tlsCredentials && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('TLS secret')}</DescriptionListTerm>
                    <DescriptionListDescription>{listener?.spec.tlsCredentials}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </CardBody>
          </Card>

          <Card isPlain>
            <CardHeader>
              <CardTitle>
                <Title headingLevel="h1">{t('Properties')}</Title>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <DescriptionList>
                {listener?.metadata.creationTimestamp && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Timestamp date={new Date(listener.metadata.creationTimestamp)} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </CardBody>
          </Card>
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('YAML')}</TabTitleText>}>
          <Card>
            <CodeBlock>
              <CodeBlockCode id="code-content">{stringify(listener)}</CodeBlockCode>
            </CodeBlock>
          </Card>
        </Tab>
      </Tabs>
      <Modal
        title={t('Update listener')}
        isOpen={!!isOpen}
        variant={ModalVariant.medium}
        aria-label="Form edit listener"
      >
        {listener && (
          <ListenerForm
            onSubmit={handleModalSubmit}
            onCancel={handleModalClose}
            listenerName={listener?.metadata.name}
            attributes={{
              ...listener.spec,
              ...listener.metadata
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default ListenerDetails;
