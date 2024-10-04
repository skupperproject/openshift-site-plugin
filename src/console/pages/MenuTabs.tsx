// TabNavigation.tsx
import { FC, KeyboardEvent, MouseEvent } from 'react';

import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace, REFETCH_QUERY_INTERVAL } from '@config/config';

const MenuTabsMapKey = {
  getStarted: 0,
  details: 1,
  yaml: 2,
  links: 3,
  listeners: 4,
  connectors: 5
};

interface TabNavigationProps {
  activeTabKey: string | number;
  setActiveTabKey: (tabIndex: string | number) => void;
}

export const TabNavigation: FC<TabNavigationProps> = function ({ activeTabKey, setActiveTabKey }) {
  const { t } = useTranslation(I18nNamespace);

  const { data: site } = useQuery({
    queryKey: ['find-site-query'],
    queryFn: () => RESTApi.findSiteView(),
    refetchInterval: (data) => (data?.isReady ? 0 : REFETCH_QUERY_INTERVAL / 2)
  });

  const isSiteActive = site?.isConfigured;

  return (
    <Tabs
      mountOnEnter
      unmountOnExit
      activeKey={activeTabKey}
      onSelect={(_: MouseEvent | KeyboardEvent | MouseEvent, tabIndex: string | number) => setActiveTabKey(tabIndex)}
    >
      <Tab
        eventKey={MenuTabsMapKey.getStarted}
        title={<TabTitleText>{t('GetStartedTab')}</TabTitleText>}
        isDisabled={!isSiteActive}
      />
      <Tab eventKey={MenuTabsMapKey.details} title={<TabTitleText>{t('DetailsTab')}</TabTitleText>} />
      <Tab eventKey={MenuTabsMapKey.yaml} title={<TabTitleText>{t('YamlTab')}</TabTitleText>} />
      <Tab
        eventKey={MenuTabsMapKey.links}
        title={<TabTitleText>{t('LinksTab')}</TabTitleText>}
        isDisabled={!isSiteActive}
      />
      <Tab
        eventKey={MenuTabsMapKey.listeners}
        title={<TabTitleText>{t('ListenersTab')}</TabTitleText>}
        isDisabled={!isSiteActive}
      />
      <Tab
        eventKey={MenuTabsMapKey.connectors}
        title={<TabTitleText>{t('ConnectorsTab')}</TabTitleText>}
        isDisabled={!isSiteActive}
      />
    </Tabs>
  );
};
