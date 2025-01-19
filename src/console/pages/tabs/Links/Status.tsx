import { FC } from 'react';

import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Button,
  Title,
  Card,
  CardHeader,
  CardBody
} from '@patternfly/react-core';
import { TFunction } from 'react-i18next';

import { SiteView } from '../../../interfaces/REST.interfaces';

type StatusProps = {
  site?: SiteView;
  t: TFunction;
  onGoTo: (page: number) => void;
};

const Status: FC<StatusProps> = function ({ site, t, onGoTo }) {
  return (
    <Card isPlain>
      <CardHeader>
        <Title headingLevel="h1">{t('Status')}</Title>
      </CardHeader>

      <CardBody>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Sites in the network')}</DescriptionListTerm>
            <DescriptionListDescription>
              {t('sitesInNetwork', { count: site?.sitesInNetwork })}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>{t('Linked sites')}</DescriptionListTerm>
            <DescriptionListDescription>
              <Button variant="link" isInline onClick={() => onGoTo(3)} isDisabled={!site?.linkCount}>
                {t('remoteSiteWithCount', { count: site?.linkCount })}
              </Button>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default Status;
