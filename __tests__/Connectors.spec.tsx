import { RESTApi } from '@API/REST.api';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Connectors from '../src/console/pages/tabs/Connectors/Connectors';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

vi.mock('../src/console/API/REST.api');

const mockConnectors = [
  {
    id: '1',
    name: 'test-connector',
    routingKey: 'test-key',
    selector: 'app=test',
    host: 'test-host',
    port: 8080,
    connected: true,
    status: 'Ready',
    statusMessage: 'OK'
  }
];

describe('Connectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchedSkupperResource.mockReturnValue({
      data: mockConnectors,
      loaded: true
    });
  });

  describe('Table rendering', () => {
    it('renders connectors table with data', () => {
      render(<Connectors />);

      ['test-connector', 'test-key', 'test-host', '8080'].forEach((text) => {
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });

    it('shows loading state when data is not loaded', () => {
      mockUseWatchedSkupperResource.mockReturnValue({ data: [], loaded: false });
      render(<Connectors />);

      expect(screen.getByTestId('sk-loading')).toBeInTheDocument();
    });
  });

  describe('Modal operations', () => {
    it('opens create connector modal', () => {
      render(<Connectors />);

      fireEvent.click(screen.getByRole('button', { name: 'Create a connector' }));
      expect(screen.getByRole('heading', { name: 'Create a Connector' })).toBeInTheDocument();
    });

    it('closes modal with cancel button', () => {
      render(<Connectors />);

      fireEvent.click(screen.getByRole('button', { name: 'Create a connector' }));
      const modalHeading = screen.getByRole('heading', { name: 'Create a Connector' });

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(modalHeading).not.toBeInTheDocument();
    });
  });

  describe('Drawer operations', () => {
    it('opens connector details drawer', () => {
      render(<Connectors />);

      fireEvent.click(screen.getByText('test-connector'));
      expect(screen.getByRole('button', { name: 'Close drawer panel' })).toBeInTheDocument();
    });

    it('closes connector details drawer', () => {
      render(<Connectors />);

      fireEvent.click(screen.getByText('test-connector'));
      fireEvent.click(screen.getByRole('button', { name: 'Close drawer panel' }));
      expect(screen.queryByRole('button', { name: 'Close drawer panel' })).not.toBeInTheDocument();
    });
  });

  describe('API interactions', () => {
    it('deletes connector through API', async () => {
      vi.mocked(RESTApi.deleteConnector).mockResolvedValue();
      render(<Connectors />);

      fireEvent.click(screen.getByText('Delete'));
      await waitFor(() => {
        expect(RESTApi.deleteConnector).toHaveBeenCalledWith('test-connector');
      });
    });
  });
});
