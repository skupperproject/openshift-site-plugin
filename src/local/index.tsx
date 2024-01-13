import { render } from 'react-dom';

import { loadMockServer } from './server';
import App from '../console/App';

import '@patternfly/patternfly/patternfly.css';

const rootElement = document.getElementById('app') as HTMLDivElement;

render(<App />, rootElement);
loadMockServer();
