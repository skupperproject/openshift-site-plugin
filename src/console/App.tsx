import { Suspense } from 'react';

import ErrorBoundaryContent from '@patternfly/react-component-groups/dist/dynamic/ErrorBoundary';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import AppContent from './AppContent';
import AppVersionValidator from './AppVersionValidator';
import { AppApiContext } from './context/AppApiContext';
import { AppContext } from './context/AppContext';

import '@patternfly/patternfly/patternfly.css';

import './App.css';

const App = function () {
  return (
    <AppApiContext>
      <QueryErrorResetBoundary>
        <ErrorBoundaryContent errorTitle="An Error occurred" headerTitle="">
          <Suspense
            fallback={
              <Bullseye>
                <Spinner size="xl" />
              </Bullseye>
            }
          >
            <AppVersionValidator>
              <AppContext>
                <AppContent />
              </AppContext>
            </AppVersionValidator>
          </Suspense>
        </ErrorBoundaryContent>
      </QueryErrorResetBoundary>
    </AppApiContext>
  );
};

export default App;
