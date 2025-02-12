import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import AlertStatus from '../src/console/pages/components/AlertStatus';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

describe('AlertStatus Component', () => {
  it('renders nothing when no site data is available', () => {
    mockUseWatchedSkupperResource.mockReturnValue({ data: [] });

    const { container } = render(<AlertStatus />);

    expect(container.firstChild).toBeNull();
  });

  it('renders configured but not ready warning alert', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          isConfigured: true,
          isReady: false
        }
      ]
    });

    render(<AlertStatus />);

    const warningAlert = screen.getByTestId('alert-status-warning');
    expect(warningAlert).toBeInTheDocument();
    expect(warningAlert).toHaveClass('pf-m-warning');
    expect(warningAlert).toHaveTextContent(
      'The site is Configured: you can create resources, but until the router is ready the effect is not usable'
    );
  });

  it('renders error status danger alert', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          status: 'Error'
        }
      ]
    });

    render(<AlertStatus />);

    const dangerAlert = screen.getByTestId('alert-status-danger');
    expect(dangerAlert).toBeInTheDocument();
    expect(dangerAlert).toHaveClass('pf-m-danger');
    expect(dangerAlert).toHaveTextContent(
      'There is one or more errors. Please check the conditions on the Details page for more information'
    );
  });

  it('does not render alert when site is configured and ready', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          isConfigured: true,
          isReady: true
        }
      ]
    });

    const { container } = render(<AlertStatus />);

    expect(container.firstChild).toBeNull();
  });

  it('does not render alert when site is not configured', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          isConfigured: false
        }
      ]
    });

    const { container } = render(<AlertStatus />);

    expect(container.firstChild).toBeNull();
  });
});
