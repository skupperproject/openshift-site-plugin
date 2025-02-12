import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import GrantForm from '../src/console/pages/components/forms/GrantForm';

const mockCreateGrant = vi.hoisted(() => vi.fn(() => Promise.resolve({})));

vi.mock('../src/console/API/REST.api', () => ({
  RESTApi: {
    createGrant: mockCreateGrant
  }
}));

vi.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useResolvedExtensions: vi.fn(() => [[], true]),
  useK8sWatchResource: vi.fn()
}));

vi.mock('../src/console/pages/components/forms/GrantForm/DownloadGrant', () => ({
  DownloadGrant: () => <div>Mocked DownloadGrant</div>
}));

describe('GrantForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders wizard with initial step', () => {
    render(<GrantForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    mockCreateGrant.mockResolvedValue({});

    render(<GrantForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('filename input'), {
      target: { value: 'test-grant' }
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockCreateGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { name: 'test-grant' },
          spec: expect.objectContaining({
            expirationWindow: '15m',
            redemptionsAllowed: 1
          })
        })
      );
    });
  });

  it('handles form submission error', async () => {
    mockCreateGrant.mockRejectedValue({
      descriptionMessage: 'Error message'
    });

    render(<GrantForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('filename input'), {
      target: { value: 'test-grant' }
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('handles cancel button click', () => {
    render(<GrantForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles done button click on final step', async () => {
    mockCreateGrant.mockResolvedValue({});

    render(<GrantForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('filename input'), {
      target: { value: 'test-grant' }
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockCreateGrant).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Done'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles Enter key press', () => {
    render(<GrantForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText('filename input'), {
      target: { value: 'test-grant' }
    });

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(mockCreateGrant).toHaveBeenCalled();
  });
});
