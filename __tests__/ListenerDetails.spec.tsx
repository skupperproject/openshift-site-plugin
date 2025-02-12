import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ListenerDetails from '../src/console/pages/tabs/Listeners/ListenerDetails';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

const mockListener = {
  metadata: {
    name: 'test-listener',
    creationTimestamp: '2024-02-01T12:00:00Z'
  },
  spec: {
    routingKey: 'test-key',
    host: 'test-service',
    port: 8080,
    tlsCredentials: 'test-secret'
  },
  rawData: {
    metadata: {
      name: 'test-listener',
      creationTimestamp: '2024-02-01T12:00:00Z'
    },
    spec: {
      routingKey: 'test-key',
      host: 'test-service',
      port: 8080,
      tlsCredentials: 'test-secret'
    }
  }
};

vi.mock('../src/console/pages/components/forms/ListenerForm', () => ({
  default: ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div>
      <h2>Update listener</h2>
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

describe('ListenerDetails', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [mockListener]
    });
  });

  describe('Details tab', () => {
    it('renders listener details', () => {
      render(<ListenerDetails name="test-listener" />);

      const expectedFields = ['test-listener', 'test-key', 'test-service', '8080', 'test-secret'];

      expectedFields.forEach((field) => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
    });

    it('shows edit button and opens modal', () => {
      render(<ListenerDetails name="test-listener" />);
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      expect(screen.getByRole('heading', { name: 'Update listener' })).toBeInTheDocument();
    });

    it('handles modal close', () => {
      render(<ListenerDetails name="test-listener" />);
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('heading', { name: 'Update listener' })).not.toBeInTheDocument();
    });

    it('calls onUpdate when form is submitted', async () => {
      render(<ListenerDetails name="test-listener" onUpdate={mockOnUpdate} />);
      fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('YAML tab', () => {
    it('switches to YAML tab and shows content', () => {
      render(<ListenerDetails name="test-listener" />);
      fireEvent.click(screen.getByRole('tab', { name: 'YAML' }));
      expect(screen.getByText(/metadata:/)).toBeInTheDocument();
      expect(screen.getByText(/spec:/)).toBeInTheDocument();
    });
  });
});
