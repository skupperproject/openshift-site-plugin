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

import ConnectorForm from './components/ConnectorForm';

interface ConnectorDetailsProps {
  name: string;
  onRefetch?: () => void;
}

const ConnectorDetails: FC<ConnectorDetailsProps> = function ({ name, onRefetch }) {
  const { t } = useTranslation(I18nNamespace);

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [isOpen, setIsOpen] = useState<boolean | undefined>();

  const { data: connector, refetch } = useQuery({
    queryKey: ['find-connector-query', name],
    queryFn: () => RESTApi.findConnector(name),
    enabled: false
  });

  const handleTabClick = (_: MouseEvent | KeyboardEvent, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleModalClose = () => {
    setIsOpen(undefined);
  };

  const handleRefresh = () => {
    setTimeout(() => {
      refetch();
    }, 500);

    handleModalClose();
    onRefetch?.();
  };

  useEffect(() => {
    refetch();
  }, [refetch, name]);

  return (
    <>
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
        <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
          <Card isPlain>
            <CardHeader>
              <Flex grow={{ default: 'grow' }}>
                <FlexItem>
                  <CardTitle>
                    <Title headingLevel="h1">Settings</Title>
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
                  <DescriptionListDescription>{connector?.spec.routingKey}</DescriptionListDescription>
                </DescriptionListGroup>

                {connector?.spec.selector && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Selector')}</DescriptionListTerm>
                    <DescriptionListDescription>{connector?.spec.selector}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}

                {connector?.spec.host && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('Host')}</DescriptionListTerm>
                    <DescriptionListDescription>{connector?.spec.host}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}

                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Port')}</DescriptionListTerm>
                  <DescriptionListDescription>{connector?.spec.port}</DescriptionListDescription>
                </DescriptionListGroup>
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
                {connector?.metadata.creationTimestamp && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>created</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Timestamp date={new Date(connector.metadata.creationTimestamp)} />
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
              <CodeBlockCode id="code-content">{stringify(connector)}</CodeBlockCode>
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
        <ConnectorForm
          onSubmit={handleRefresh}
          onCancel={handleModalClose}
          connectorName={connector?.metadata.name}
          attributes={{
            ...connector?.spec,
            ...connector?.metadata
          }}
        />
      </Modal>
    </>
  );
};

export default ConnectorDetails;
