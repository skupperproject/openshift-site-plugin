import { render, screen, fireEvent } from '@testing-library/react';
import { vi, expect, describe, beforeEach, it } from 'vitest';

import { SiteView } from '../src/console/interfaces/REST.interfaces';
import Details from '../src/console/pages/tabs/Details/Details';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

vi.mock('../src/console/pages/tabs/Details/Header', () => ({
  default: ({ site, t }: { site: SiteView; t: (key: string) => string }) => (
    <div data-testid="mock-header">
      Header Component {site?.name} {t('Site settings')}
    </div>
  )
}));

describe('Details Component', () => {
  const mockOnGoTo = vi.fn();

  const mockSite = {
    name: 'test-site',
    linkAccess: 'public',
    serviceAccount: 'test-account',
    defaultIssuer: 'test-issuer',
    ha: true,
    isConfigured: true,
    platform: 'kubernetes',
    creationTimestamp: '2024-02-05T12:00:00Z',
    conditions: [
      {
        type: 'Ready',
        status: 'True',
        reason: 'Success',
        message: 'Site is ready',
        lastTransitionTime: '2024-02-05T12:00:00Z'
      }
    ],
    resourceVersion: '123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [mockSite]
    });
  });

  it('renders basic site details', () => {
    render(<Details onGoTo={mockOnGoTo} />);
    expect(screen.getByText(mockSite.name)).toBeInTheDocument();
    expect(screen.getByText(mockSite.linkAccess)).toBeInTheDocument();
    expect(screen.getByText(mockSite.platform)).toBeInTheDocument();
  });

  it('handles modal interactions', () => {
    render(<Details onGoTo={mockOnGoTo} />);

    const editButtons = screen.getByTestId('edit-link-access-button');
    fireEvent.click(editButtons);

    expect(screen.getByText('Edit site')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Edit site')).not.toBeInTheDocument();
  });

  it('renders conditions with different states', () => {
    const siteWithConditions = {
      ...mockSite,
      conditions: [
        {
          type: 'Error',
          status: 'False',
          reason: 'Error',
          message: 'Error message',
          lastTransitionTime: '2024-02-05T12:00:00Z'
        },
        {
          type: 'Pending',
          status: 'Unknown',
          reason: 'Pending',
          message: 'Pending message',
          lastTransitionTime: '2024-02-05T12:00:00Z'
        }
      ]
    };

    mockUseWatchedSkupperResource.mockReturnValue({
      data: [siteWithConditions]
    });

    render(<Details onGoTo={mockOnGoTo} />);
    expect(screen.getAllByText('Error')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Pending')[0]).toBeInTheDocument();
  });

  it('renders conditions table when conditions exist', () => {
    render(<Details onGoTo={mockOnGoTo} />);
    expect(screen.getByText('Conditions')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('handles site with no conditions', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: [
        {
          ...mockSite,
          conditions: undefined
        }
      ]
    });

    render(<Details onGoTo={mockOnGoTo} />);
    expect(screen.queryByText('Conditions')).not.toBeInTheDocument();
  });
});
