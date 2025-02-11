import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ConnectorDetails from '../src/console/pages/tabs/Connectors/ConnectorDetails';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

const mockConnector = {
  metadata: {
    name: 'test-connector',
    creationTimestamp: '2024-02-01T12:00:00Z'
  },
  spec: {
    routingKey: 'test-key',
    selector: 'app=test',
    host: 'test-host',
    port: 8080,
    tlsCredentials: 'test-secret',
    includeNotReadyPods: true
  },
  rawData: {
    metadata: {
      name: 'test-connector',
      creationTimestamp: '2024-02-01T12:00:00Z'
    },
    spec: {
      routingKey: 'test-key',
      selector: 'app=test',
      host: 'test-host',
      port: 8080,
      tlsCredentials: 'test-secret',
      includeNotReadyPods: true
    }
  }
};

vi.mock('../src/console/pages/components/forms/ConnectorForm', () => ({
  default: ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div>
      <h2>Update connector</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <button type="submit">Submit</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  )
}));

describe('ConnectorDetails', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [mockConnector]
    });
  });

  describe('Details tab', () => {
    it('renders connector details', () => {
      render(<ConnectorDetails name="test-connector" />);

      const expectedFields = ['test-connector', 'test-key', 'app=test', 'test-host', '8080', 'test-secret', 'true'];

      expectedFields.forEach((field) => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
    });

    it('shows edit button and opens modal', () => {
      render(<ConnectorDetails name="test-connector" />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByRole('heading', { name: 'Update connector' })).toBeInTheDocument();
    });

    it('handles modal close', () => {
      render(<ConnectorDetails name="test-connector" />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('heading', { name: 'Update connector' })).not.toBeInTheDocument();
    });

    it('calls onUpdate when form is submitted', async () => {
      render(<ConnectorDetails name="test-connector" onUpdate={mockOnUpdate} />);

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('YAML tab', () => {
    it('switches to YAML tab and shows content', () => {
      render(<ConnectorDetails name="test-connector" />);

      fireEvent.click(screen.getByRole('tab', { name: 'YAML' }));
      expect(screen.getByText(/metadata:/)).toBeInTheDocument();
      expect(screen.getByText(/spec:/)).toBeInTheDocument();
    });
  });
});
