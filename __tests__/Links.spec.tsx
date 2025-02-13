import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AccessGrantCrdResponse } from '../src/console/interfaces/CRD_AccessGrant';
import { AccessTokenCrdResponse } from '../src/console/interfaces/CRD_AccessToken';
import { ISO8601Timestamp } from '../src/console/interfaces/CRD_Base';
import { LinkCrdResponse } from '../src/console/interfaces/CRD_Link';
import { AccessGrant, Link } from '../src/console/interfaces/REST.interfaces';
import { useLinks } from '../src/console/pages/tabs/Links/hooks/useLinks';
import Links from '../src/console/pages/tabs/Links/Links';

vi.mock('../src/console/pages/tabs/Links/GrantsTable', () => ({
  default: vi.fn().mockImplementation(() => <div data-testid="grants-table">Grants Table</div>)
}));

vi.mock('../src/console/pages/tabs/Links/LinksTable', () => ({
  LinksTable: vi.fn().mockImplementation(() => <div data-testid="links-table">Links Table</div>),
  RemoteLinksTable: vi.fn().mockImplementation(() => <div data-testid="remote-links-table">Remote Links Table</div>)
}));

vi.mock('../src/console/pages/components/forms/GrantForm', () => ({
  default: vi.fn(({ onSubmit, onCancel }) => (
    <div data-testid="grant-form">
      <button onClick={onSubmit}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

vi.mock('../src/console/pages/components/forms/LinkForm', () => ({
  default: vi.fn(({ onSubmit, onCancel }) => (
    <div data-testid="link-form">
      <button onClick={onSubmit}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

vi.mock('../src/console/pages/tabs/Links/hooks/useLinks', () => ({
  useLinks: vi.fn()
}));

describe('Links', () => {
  const timestamp = new Date().toISOString() as ISO8601Timestamp;

  const mockLinkRawData: LinkCrdResponse = {
    apiVersion: 'skupper.io/v2alpha1',
    kind: 'Link',
    metadata: {
      uid: '1',
      name: 'link-1',
      namespace: 'default',
      resourceVersion: '1',
      creationTimestamp: timestamp
    },
    spec: {
      cost: 1,
      endpoints: []
    },
    status: {
      status: 'Ready',
      message: 'OK',
      conditions: []
    }
  };

  const mockTokenRawData: AccessTokenCrdResponse = {
    apiVersion: 'skupper.io/v2alpha1',
    kind: 'AccessToken',
    metadata: {
      uid: '2',
      name: 'token-1',
      namespace: 'default',
      resourceVersion: '1',
      creationTimestamp: timestamp
    },
    spec: {
      linkCost: 1,
      url: 'test-url',
      code: 'test-code',
      ca: 'test-ca'
    }
  };

  const mockGrantRawData: AccessGrantCrdResponse = {
    apiVersion: 'skupper.io/v2alpha1',
    kind: 'AccessGrant',
    metadata: {
      uid: '3',
      name: 'grant-1',
      namespace: 'default',
      resourceVersion: '1',
      creationTimestamp: timestamp
    },
    spec: {
      redemptionsAllowed: 1,
      expirationWindow: '24h',
      code: 'test-code'
    },
    status: {
      status: 'Ready',
      message: 'OK',
      conditions: [],
      redemptions: 0,
      url: 'test-url',
      code: 'test-code',
      ca: 'test-ca',
      expirationTime: timestamp
    }
  };

  const mockData = {
    links: [
      {
        id: '1',
        name: 'link-1',
        creationTimestamp: timestamp,
        status: 'Ready',
        statusMessage: 'OK',
        hasError: false,
        connectedTo: 'site-1',
        cost: 1,
        rawData: mockLinkRawData
      }
    ] as Link[],
    accessTokens: [
      {
        id: '2',
        name: 'token-1',
        creationTimestamp: timestamp,
        status: 'Ready',
        statusMessage: 'OK',
        hasError: false,
        connectedTo: 'site-2',
        cost: 1,
        rawData: mockTokenRawData
      }
    ] as Link[],
    remoteLinks: [
      {
        connectedTo: 'remote-1'
      }
    ],
    accessGrants: [
      {
        id: '3',
        name: 'grant-1',
        creationTimestamp: timestamp,
        status: 'Ready',
        statusMessage: 'OK',
        hasError: false,
        redemptionsAllowed: 1,
        redemptions: 0,
        expirationTime: timestamp,
        rawData: mockGrantRawData
      }
    ] as AccessGrant[]
  };

  const mockActions = {
    handleDeleteLink: vi.fn(),
    handleDownloadGrant: vi.fn(),
    handleDeleteGrant: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLinks).mockReturnValue({
      data: mockData,
      loading: false,
      actions: mockActions
    });
  });

  it('shows loading state', () => {
    vi.mocked(useLinks).mockReturnValue({
      data: {
        accessGrants: null,
        accessTokens: null,
        links: null,
        remoteLinks: []
      },
      loading: true,
      actions: mockActions
    });

    render(<Links siteId="test-site" />);
    expect(screen.getByTestId('sk-loading')).toBeInTheDocument();
  });

  it('renders all components when data is loaded', () => {
    render(<Links siteId="test-site" />);

    expect(screen.getByTestId('links-table')).toBeInTheDocument();
    expect(screen.getByTestId('remote-links-table')).toBeInTheDocument();
    expect(screen.getByTestId('grants-table')).toBeInTheDocument();
  });

  it('handles alert visibility', () => {
    render(<Links siteId="test-site" />);

    const closeButton = screen.getByTestId('links-close-alert-button');
    fireEvent.click(closeButton);

    expect(sessionStorage.getItem('showALinkAlert')).toBe('hide');
  });

  it('manages link form modal', () => {
    render(<Links siteId="test-site" />);

    fireEvent.click(screen.getByText('Create link'));
    expect(screen.getByTestId('link-form')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('link-form')).not.toBeInTheDocument();
  });

  it('manages grant form modal', () => {
    render(<Links siteId="test-site" />);

    fireEvent.click(screen.getByText('Create token'));
    expect(screen.getByTestId('grant-form')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('grant-form')).not.toBeInTheDocument();
  });

  it('shows remote links section conditionally', () => {
    vi.mocked(useLinks).mockReturnValue({
      data: { ...mockData, remoteLinks: [] },
      loading: false,
      actions: mockActions
    });

    const { rerender } = render(<Links siteId="test-site" />);
    expect(screen.queryByText('Links from remote sites')).not.toBeInTheDocument();

    vi.mocked(useLinks).mockReturnValue({
      data: mockData,
      loading: false,
      actions: mockActions
    });

    rerender(<Links siteId="test-site" />);
    expect(screen.getByText('Links from remote sites')).toBeInTheDocument();
  });
});
