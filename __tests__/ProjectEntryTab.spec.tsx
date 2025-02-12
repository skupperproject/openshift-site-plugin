import { NamespaceManager } from '@config/db';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import ProjectEntryTab from '../src/openshift/ProjectEntryTab';

vi.mock('../src/console/config/db', () => ({
  NamespaceManager: {
    setNamespace: vi.fn()
  }
}));

vi.mock('../src/console/App', () => ({
  default: vi.fn(() => <div data-testid="mocked-app">Mocked App</div>)
}));

describe('ProjectEntryTab Component', () => {
  it('sets namespace when obj is provided', () => {
    const mockObj = {
      metadata: {
        name: 'test-namespace'
      }
    };

    render(<ProjectEntryTab obj={mockObj} />);

    expect(NamespaceManager.setNamespace).toHaveBeenCalledWith('test-namespace');
  });

  it('renders App component', () => {
    const mockObj = {
      metadata: {
        name: 'test-namespace'
      }
    };

    const { getByTestId } = render(<ProjectEntryTab obj={mockObj} />);

    const appComponent = getByTestId('mocked-app');
    expect(appComponent).toBeInTheDocument();
  });
});
