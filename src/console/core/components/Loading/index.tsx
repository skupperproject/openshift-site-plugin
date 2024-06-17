import { CSSProperties, FC } from 'react';

import { Bullseye, Card, CardBody, CardHeader, PageSection, TextContent, Title } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';

import './Loading.css';

const PleaseWait: FC<{ message: string; color?: string }> = function ({ message, color }) {
  return (
    <Card isPlain>
      <CardHeader className="cog-wrapper">
        <CogIcon className="cog cog-main spinning-clockwise" style={{ color }} />
        <CogIcon className="cog cog-secondary cog-upper spinning-clockwise--reverse" style={{ color }} />
        <CogIcon className="cog cog-secondary cog-lower spinning-clockwise--reverse" style={{ color }} />
      </CardHeader>
      <CardBody>
        <TextContent>
          <Title headingLevel="h3" style={{ color }}>
            {message}
          </Title>
        </TextContent>
      </CardBody>
    </Card>
  );
};

const floatLoader: CSSProperties = {
  top: 0,
  position: 'absolute',
  right: 0,
  width: '100%',
  height: '100%',
  zIndex: 100
};

interface LoadingPageProps {
  message: string;
  isFLoating?: boolean;
  color?: string;
}

const LoadingPage: FC<LoadingPageProps> = function ({ isFLoating = false, message, color }) {
  return (
    <PageSection isFilled style={isFLoating ? floatLoader : undefined}>
      <Bullseye className="sk-loading-page">
        <PleaseWait message={message} color={color} />
      </Bullseye>
    </PageSection>
  );
};

export default LoadingPage;
