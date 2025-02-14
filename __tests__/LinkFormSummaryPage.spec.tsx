import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SummaryPage } from '../src/console/pages/components/forms/LinkForm/SummaryPage';

const mockLinkFormHook = vi.hoisted(() => vi.fn());
const mockWatchResourceHook = vi.hoisted(() => vi.fn());

vi.mock('../src/console/pages/components/forms/LinkForm/hooks/useLinkForm', () => ({
  useLinkForm: () => mockLinkFormHook()
}));

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: () => mockWatchResourceHook()
}));

describe('SummaryPage', () => {
  const mockSetIsLoading = vi.fn();
  const mockSetValidated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockLinkFormHook.mockReturnValue({
      state: {
        name: 'test-link',
        fileName: 'test-file'
      },
      setIsLoading: mockSetIsLoading,
      setValidated: mockSetValidated,
      validated: undefined
    });
  });

  it('shows loading state initially', () => {
    mockWatchResourceHook.mockReturnValue({
      data: null
    });

    render(<SummaryPage />);
    expect(screen.getByText('Creating link...Click Dismiss to leave the page')).toBeInTheDocument();
  });

  it('shows success state when link is configured', () => {
    mockWatchResourceHook.mockReturnValueOnce({ data: [] }).mockReturnValueOnce({
      data: [
        {
          rawData: {
            status: {
              status: 'Ready',
              conditions: [{ type: 'Configured', status: 'True' }]
            }
          }
        }
      ]
    });

    render(<SummaryPage />);
    expect(screen.getByText('Link created')).toBeInTheDocument();
    expect(screen.getByText('Click Done to close the window')).toBeInTheDocument();
  });

  it('shows error state when link creation fails', () => {
    const errorMessage = 'Link creation failed';

    mockWatchResourceHook
      .mockReturnValueOnce({
        data: [
          {
            rawData: {
              status: {
                status: 'Error',
                conditions: []
              }
            }
          }
        ]
      })
      .mockReturnValueOnce({ data: [] });

    mockLinkFormHook.mockReturnValue({
      state: {
        name: 'test-link',
        fileName: 'test-file'
      },
      setIsLoading: mockSetIsLoading,
      setValidated: mockSetValidated,
      validated: errorMessage
    });

    render(<SummaryPage />);
    expect(screen.getByText('It seems there was an error while creating the link')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles access token status', () => {
    mockWatchResourceHook.mockReturnValueOnce({ data: [] }).mockReturnValueOnce({
      data: [
        {
          rawData: {
            status: {
              status: 'Ready',
              conditions: [{ type: 'Configured', status: 'True' }]
            }
          }
        }
      ]
    });

    render(<SummaryPage />);
    expect(screen.getByText('Link created')).toBeInTheDocument();
  });

  it('updates loading state when status changes', () => {
    mockWatchResourceHook.mockReturnValueOnce({ data: [] }).mockReturnValueOnce({
      data: [
        {
          rawData: {
            status: {
              status: 'Ready',
              conditions: [{ type: 'Configured', status: 'True' }]
            }
          }
        }
      ]
    });

    render(<SummaryPage />);

    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    expect(mockSetValidated).toHaveBeenCalledWith(undefined);
  });
});
