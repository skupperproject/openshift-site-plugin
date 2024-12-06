import { CSSProperties, FC } from 'react';

import {
  PageSection,
  Spinner,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon
} from '@patternfly/react-core';

const floatLoader: CSSProperties = {
  top: 0,
  position: 'absolute',
  right: 0,
  width: '100%',
  height: '100%',
  zIndex: 100
};

interface LoadingPageProps {
  message?: string;
  isFLoating?: boolean;
  color?: string;
}

const LoadingPage: FC<LoadingPageProps> = function ({ isFLoating = false, message = '' }) {
  return (
    <PageSection isFilled style={isFLoating ? floatLoader : undefined}>
      <EmptyState>
        <EmptyStateHeader icon={<EmptyStateIcon icon={Spinner} />} />
        <EmptyStateBody>{message}</EmptyStateBody>
      </EmptyState>
    </PageSection>
  );
};

export default LoadingPage;
