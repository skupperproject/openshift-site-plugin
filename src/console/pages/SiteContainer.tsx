import { FC, KeyboardEvent, MouseEvent, ReactNode, Suspense, useEffect, useState } from 'react';

import {
  Tabs,
  Tab,
  TabTitleText,
  PageSection,
  PageSectionVariants,
  PageNavigation,
  Bullseye,
  Spinner
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { I18nNamespace } from '@config/config';
import Connectors from '@pages/Connectors';
import Listeners from '@pages/Listeners';
import YAML from '@pages/YAML';

import Details from './Details';
import GetStarted from './GetStarted';
import Links from './Links';

const MenuTabsMapKey = {
  getStarted: 0,
  details: 1,
  yaml: 2,
  links: 3,
  listeners: 4,
  connectors: 5
};

const SiteContainer: FC<{ siteId: string; isSiteReady: boolean; onDataUpdated: () => void }> = function ({
  siteId,
  isSiteReady,
  onDataUpdated
}) {
  const { t } = useTranslation(I18nNamespace);

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const handleTabClick = (tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  useEffect(() => {
    if (!isSiteReady) {
      setActiveTabKey(1);
    }
  }, [isSiteReady]);

  const MenuTabs: ReactNode[] = [
    <GetStarted key={1} siteId={siteId || ''} />,
    <Details key={2} onGoTo={handleTabClick} onDataUpdated={onDataUpdated} />,
    <YAML key={3} />,
    <Links siteId={siteId || ''} key={4} />,
    <Listeners key={5} />,
    <Connectors key={6} />
  ];

  return (
    <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }} className="pf-v5-u-mx-md">
      <PageNavigation>
        <Tabs
          mountOnEnter
          unmountOnExit
          activeKey={activeTabKey}
          onSelect={(_: MouseEvent | KeyboardEvent | MouseEvent, tabIndex: string | number) => handleTabClick(tabIndex)}
        >
          <Tab
            eventKey={MenuTabsMapKey.getStarted}
            title={<TabTitleText>{t('GetStartedTab')}</TabTitleText>}
            isDisabled={!isSiteReady}
          />
          <Tab eventKey={MenuTabsMapKey.details} title={<TabTitleText>{t('DetailsTab')}</TabTitleText>} />
          <Tab eventKey={MenuTabsMapKey.yaml} title={<TabTitleText>{t('YamlTab')}</TabTitleText>} />
          <Tab
            eventKey={MenuTabsMapKey.links}
            title={<TabTitleText>{t('LinksTab')}</TabTitleText>}
            isDisabled={!isSiteReady}
          />
          <Tab
            eventKey={MenuTabsMapKey.listeners}
            title={<TabTitleText>{t('ListenersTab')}</TabTitleText>}
            isDisabled={!isSiteReady}
          />
          <Tab
            eventKey={MenuTabsMapKey.connectors}
            title={<TabTitleText>{t('ConnectorsTab')}</TabTitleText>}
            isDisabled={!isSiteReady}
          />
        </Tabs>
      </PageNavigation>

      <Suspense
        fallback={
          <Bullseye>
            <Spinner size="xl" />
          </Bullseye>
        }
      >
        {MenuTabs[activeTabKey as number]}
      </Suspense>
    </PageSection>
  );
};

export default SiteContainer;
