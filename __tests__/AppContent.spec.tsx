import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import AppContent from '../src/console/AppContent';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

vi.mock('../src/console/core/components/Loading', () => ({
  default: function Loading() {
    return React.createElement('div', { 'data-testid': 'loading' });
  }
}));

vi.mock('../src/console/pages/SitePage', () => ({
  default: function SitePage({ siteId }: { siteId: string }) {
    return React.createElement('div', { 'data-testid': 'site-page', id: siteId });
  }
}));

vi.mock('../src/console/pages/CreateSitePage', () => ({
  default: function CreateSitePage() {
    return React.createElement('div', { 'data-testid': 'create-site' });
  }
}));

describe('AppContent', () => {
  it('shows loading when not loaded', () => {
    mockUseWatchedSkupperResource.mockReturnValue({ loaded: false });
    render(<AppContent />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows SitePage when site is configured', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [{ isConfigured: true, identity: 'test-id' }],
      loaded: true
    });
    render(<AppContent />);
    expect(screen.getByTestId('site-page')).toBeInTheDocument();
  });

  it('shows SitePage when site has error', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [{ hasError: true, identity: 'test-id' }],
      loaded: true
    });
    render(<AppContent />);
    expect(screen.getByTestId('site-page')).toBeInTheDocument();
  });

  it('shows CreateSitePage when site is not configured', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [{ isConfigured: false, isReady: false, hasError: false }],
      loaded: true
    });
    render(<AppContent />);
    expect(screen.getByTestId('create-site')).toBeInTheDocument();
  });
});
