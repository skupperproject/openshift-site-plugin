import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AppVersionValidator from '../src/console/AppVersionValidator';

vi.mock('../src/console/pages/ErrorOldSkupperVersionPage', () => ({
  default: function ErrorPage() {
    return React.createElement('div', { 'data-testid': 'error-page' });
  }
}));

describe('AppVersionValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when version is current', () => {
    render(
      <AppVersionValidator>
        <div data-testid="child">Test Content</div>
      </AppVersionValidator>
    );

    expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
