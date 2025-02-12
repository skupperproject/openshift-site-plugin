import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import App from '../src/console/App';

vi.mock('../src/console/AppContent', () => ({
  default: () => <div data-testid="app-content">App Content</div>
}));

vi.mock('../src/console/AppVersionValidator', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="version-validator">{children}</div>
}));

describe('App', () => {
  it('renders app structure correctly', () => {
    render(<App />);

    expect(screen.getByTestId('query-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('version-validator')).toBeInTheDocument();
    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });

  it('maintains correct component hierarchy', () => {
    render(<App />);

    const queryBoundary = screen.getByTestId('query-boundary');
    const versionValidator = screen.getByTestId('version-validator');
    const appContent = screen.getByTestId('app-content');

    expect(queryBoundary).toContainElement(versionValidator);
    expect(versionValidator).toContainElement(appContent);
  });
});
