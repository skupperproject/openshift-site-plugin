import { RESTApi } from '@API/REST.api';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Listeners from '../src/console/pages/tabs/Listeners/Listeners';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

vi.mock('../src/console/API/REST.api');

const mockListeners = [
  {
    id: '1',
    name: 'test-listener',
    routingKey: 'test-key',
    serviceName: 'test-service',
    port: 8080,
    connected: true,
    status: 'Ready',
    statusMessage: 'OK'
  }
];

describe('Listeners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchedSkupperResource.mockReturnValue({
      data: mockListeners,
      loaded: true
    });
  });

  it('renders listeners table with data', () => {
    render(<Listeners />);

    ['test-listener', 'test-key', 'test-service'].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  describe('Modal operations', () => {
    it('opens create listener modal', () => {
      render(<Listeners />);

      fireEvent.click(screen.getByRole('button', { name: 'Create a listener' }));
      expect(screen.getByRole('heading', { name: 'Create a listener' })).toBeInTheDocument();
    });

    it('closes modal with cancel button', () => {
      render(<Listeners />);

      fireEvent.click(screen.getByRole('button', { name: 'Create a listener' }));
      const modalHeading = screen.getByRole('heading', { name: 'Create a listener' });

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(modalHeading).not.toBeInTheDocument();
    });
  });

  describe('Drawer operations', () => {
    it('opens listener details drawer', () => {
      render(<Listeners />);

      fireEvent.click(screen.getByText('test-listener'));
      expect(screen.getByTestId('drawer-panel')).toBeInTheDocument();
      expect(screen.getByTestId('listener-details-panel')).toBeInTheDocument();
    });
  });

  describe('State handling', () => {
    it('shows loading state when data is not loaded', () => {
      mockUseWatchedSkupperResource.mockReturnValue({ data: [], loaded: false });
      render(<Listeners />);

      expect(screen.getByTestId('sk-loading')).toBeInTheDocument();
    });

    it('handles alert close action', () => {
      render(<Listeners />);

      fireEvent.click(screen.getByTestId('listener-alert-close'));
      expect(sessionStorage.getItem('showListenerAlert')).toBe('hide');
    });
  });

  describe('API interactions', () => {
    it('deletes listener through API', async () => {
      vi.mocked(RESTApi.deleteListener).mockResolvedValue();
      render(<Listeners />);

      fireEvent.click(screen.getByText('Delete'));
      await waitFor(() => {
        expect(RESTApi.deleteListener).toHaveBeenCalledWith('test-listener');
      });
    });
  });
});
