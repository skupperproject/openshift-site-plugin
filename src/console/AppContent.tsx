import { KeyboardEvent, MouseEvent, ReactNode, Suspense, useState } from 'react';

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
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { createSiteInfo, deleteSiteInfo } from '@config/db';
import LoadingPage from '@core/components/Loading';
import Connectors from '@pages/Connectors';
import ErrorOldSkupperVersion from '@pages/ErrorOldSkupperVersion';
import ErrorSkupperInstallationFail from '@pages/ErrorSkupperInstallationFail';
import Listeners from '@pages/Listeners';
import YAML from '@pages/YAML';

import Details from './pages/Details';
import EmptySite from './pages/EmptySite';
import GetStarted from './pages/GetStarted';
import Links from './pages/Links';

const AppContent = function () {
  const { t } = useTranslation(I18nNamespace);

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const { data: skupperInitStatus, refetch: refetchSkupperStatus } = useQuery({
    queryKey: ['find-skupper-router-query'],
    queryFn: () => RESTApi.skupperStatus('skupper-router'),
    refetchInterval: (data) => (data !== undefined && data > -1 && data < 2 ? 5000 : 0)
  });

  const { data: sites } = useQuery({
    queryKey: ['find-configMap-query'],
    queryFn: () => RESTApi.getSites(),
    enabled: !!skupperInitStatus && skupperInitStatus > 1
  });

  const handleTabClick = (tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  if (skupperInitStatus === -3) {
    deleteSiteInfo();

    return <ErrorOldSkupperVersion />;
  }

  if (skupperInitStatus === 0 || skupperInitStatus === 1) {
    deleteSiteInfo();

    const message =
      skupperInitStatus === 0
        ? t('Site created, but a Skupper instance is not yet available. Please wait...')
        : t('Please wait while the Skupper is being installed. This may take a few seconds...');

    const colorLoader = skupperInitStatus === 0 ? '#8A8D90' : '#06C';

    return (
      <PageSection variant={PageSectionVariants.light}>
        <Bullseye>
          <LoadingPage message={message} color={colorLoader} />
        </Bullseye>
      </PageSection>
    );
  }

  if (skupperInitStatus === -2) {
    deleteSiteInfo();

    return (
      <PageSection variant={PageSectionVariants.light}>
        <Bullseye>
          <ErrorSkupperInstallationFail />
        </Bullseye>
      </PageSection>
    );
  }

  if (skupperInitStatus === -1 || !sites) {
    deleteSiteInfo();

    return (
      <PageSection variant={PageSectionVariants.light}>
        <EmptySite onClick={refetchSkupperStatus} />
      </PageSection>
    );
  }

  // we can have max 1 site
  const site = sites.items[0];
  createSiteInfo({ name: site.metadata.name, resourceVersion: site.metadata.resourceVersion });

  const components: ReactNode[] = [
    <GetStarted key={1} siteId={site.metadata.uid} />,
    <Details onGoTo={handleTabClick} onDeleteSite={refetchSkupperStatus} key={2} />,
    <YAML key={3} />,
    <Links siteId={site.metadata.uid} key={4} />,
    <Listeners key={5} />,
    <Connectors key={6} />
  ];

  return (
    <PageSection variant={PageSectionVariants.light} padding={{ default: 'noPadding' }}>
      <PageNavigation>
        <Tabs
          mountOnEnter
          unmountOnExit
          activeKey={activeTabKey}
          onSelect={(_: MouseEvent | KeyboardEvent | MouseEvent, tabIndex: string | number) => handleTabClick(tabIndex)}
        >
          <Tab eventKey={0} title={<TabTitleText>{t('GetStartedTab')}</TabTitleText>} />
          <Tab eventKey={1} title={<TabTitleText>{t('DetailsTab')}</TabTitleText>} />
          <Tab eventKey={2} title={<TabTitleText>{t('YamlTab')}</TabTitleText>} />
          <Tab eventKey={3} title={<TabTitleText>{t('LinksTab')}</TabTitleText>} />
          <Tab eventKey={4} title={<TabTitleText>{t('ListenersTab')}</TabTitleText>} />
          <Tab eventKey={5} title={<TabTitleText>{t('ConnectorsTab')}</TabTitleText>} />
        </Tabs>
      </PageNavigation>

      <Suspense
        fallback={
          <Bullseye>
            <Spinner size="xl" />
          </Bullseye>
        }
      >
        <PageSection style={{ height: '100%' }}>{components[activeTabKey as number]}</PageSection>
      </Suspense>
    </PageSection>
  );
};

export default AppContent;
