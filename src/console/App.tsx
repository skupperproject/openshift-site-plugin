import ErrorBoundaryContent from '@patternfly/react-component-groups/dist/dynamic/ErrorBoundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import AppContent from './AppContent';
import AppVersionValidator from './AppVersionValidator';
import { AppApiContext } from './context/AppApiContext';

import '@patternfly/patternfly/patternfly.css';

import './App.css';

const App = function () {
  return (
    <AppApiContext>
      <QueryErrorResetBoundary>
        <ErrorBoundaryContent errorTitle="An Error occurred" headerTitle="">
          <AppVersionValidator>
            <AppContent />
          </AppVersionValidator>
        </ErrorBoundaryContent>
      </QueryErrorResetBoundary>
    </AppApiContext>
  );
};

export default App;
