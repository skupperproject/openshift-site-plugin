import { Suspense } from 'react';

import ErrorBoundaryContent from '@patternfly/react-component-groups/dist/dynamic/ErrorBoundary';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import AppContent from 'console/AppContent';

import { Wrapper } from './Wrapper';

import '@patternfly/patternfly/patternfly.css';

import './App.css';

const App = function () {
  return (
    <Wrapper>
      <QueryErrorResetBoundary>
        <ErrorBoundaryContent errorTitle="An Error occurred" headerTitle="">
          <Suspense
            fallback={
              <Bullseye>
                <Spinner size="xl" />
              </Bullseye>
            }
          >
            <AppContent />
          </Suspense>
        </ErrorBoundaryContent>
      </QueryErrorResetBoundary>
    </Wrapper>
  );
};

export default App;
