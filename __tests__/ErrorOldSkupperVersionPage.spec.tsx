import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import ErrorOldSkupperVersionPage from '../src/console/pages/ErrorOldSkupperVersionPage';

describe('ErrorOldSkupperVersionPage', () => {
  it('renders without errors', () => {
    render(<ErrorOldSkupperVersionPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(<ErrorOldSkupperVersionPage />);
    expect(screen.getByText('Site Plugin Incompatibility')).toBeInTheDocument();
  });

  it('displays the error message', () => {
    render(<ErrorOldSkupperVersionPage />);
    expect(screen.getByText(/It appears that you are using an older version/i)).toBeInTheDocument();
  });

  it('has the correct heading level', () => {
    render(<ErrorOldSkupperVersionPage />);
    const heading = screen.getByRole('heading', { level: 4 });
    expect(heading).toBeInTheDocument();
  });
});
