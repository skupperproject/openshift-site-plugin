import { FC, ReactNode, Suspense, useState } from 'react';

import { PageSection, PageSectionVariants, PageNavigation, Bullseye, Spinner } from '@patternfly/react-core';

import Connectors from '@pages/Connectors';
import Listeners from '@pages/Listeners';
import YAML from '@pages/YAML';

import AlertStatus from './AlertStatus';
import Details from './Details';
import GetStarted from './GetStarted';
import Links from './Links';
import { TabNavigation } from './MenuTabs';

const SiteContainer: FC<{ siteId: string }> = function ({ siteId }) {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const handleTabClick = (tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const MenuTabs: ReactNode[] = [
    <GetStarted key={1} siteId={siteId || ''} />,
    <Details key={2} onGoTo={handleTabClick} />,
    <YAML key={3} />,
    <Links siteId={siteId || ''} key={4} />,
    <Listeners key={5} />,
    <Connectors key={6} />
  ];

  return (
    <>
      <AlertStatus />
      <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }} className="pf-v5-u-mx-md">
        <PageNavigation>
          <TabNavigation activeTabKey={activeTabKey} setActiveTabKey={setActiveTabKey} />
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
    </>
  );
};

export default SiteContainer;
