import { ISO8601Timestamp, StatusLinkType } from '@interfaces/CRD_Base';
import { Link } from '@interfaces/REST.interfaces';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AccessTokenCrdResponse } from '../src/console/interfaces/CRD_AccessToken';
import { LinkCrdResponse } from '../src/console/interfaces/CRD_Link';
import { LinksTable, RemoteLinksTable } from '../src/console/pages/tabs/Links/LinksTable';

describe('LinksTable', () => {
  const mockT = vi.fn((key: string) => key);
  const mockOnDeleteLink = vi.fn();

  const mockLinkRawData: LinkCrdResponse = {
    apiVersion: 'skupper.io/v2alpha1',
    kind: 'Link',
    metadata: {
      uid: '1',
      name: 'link-1',
      namespace: 'default',
      resourceVersion: '1',
      creationTimestamp: new Date().toISOString() as ISO8601Timestamp
    },
    spec: {
      cost: 1,
      endpoints: []
    },
    status: {
      remoteSiteId: 'site-1-id',
      remoteSiteName: 'site-1',
      conditions: [],
      status: 'Ready' as StatusLinkType,
      message: 'OK'
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
      creationTimestamp: new Date().toISOString() as ISO8601Timestamp
    },
    spec: {
      linkCost: 2,
      url: 'test-url',
      code: 'test-code',
      ca: 'test-ca'
    },
    status: {
      status: 'Error' as StatusLinkType,
      message: 'Connection failed',
      conditions: []
    }
  };

  const mockLinks: Link[] = [
    {
      id: '1',
      name: 'link-1',
      creationTimestamp: new Date().toISOString() as ISO8601Timestamp,
      status: 'Ready',
      statusMessage: 'OK',
      hasError: false,
      connectedTo: 'site-1',
      cost: 1,
      rawData: mockLinkRawData
    },
    {
      id: '2',
      name: 'token-1',
      creationTimestamp: new Date().toISOString() as ISO8601Timestamp,
      status: 'Error',
      statusMessage: 'Connection failed',
      hasError: true,
      connectedTo: 'site-2',
      cost: 2,
      rawData: mockTokenRawData
    }
  ];

  it('renders links table with data', () => {
    render(<LinksTable links={mockLinks} onDeleteLink={mockOnDeleteLink} t={mockT} />);

    expect(screen.getByText('link-1')).toBeInTheDocument();
    expect(screen.getByText('site-1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('handles delete action', () => {
    render(<LinksTable links={mockLinks} onDeleteLink={mockOnDeleteLink} t={mockT} />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDeleteLink).toHaveBeenCalledWith('link-1');
  });

  it('shows error status for token', () => {
    render(<LinksTable links={[mockLinks[1]]} onDeleteLink={mockOnDeleteLink} t={mockT} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });
});

describe('RemoteLinksTable', () => {
  const mockT = vi.fn((key: string) => key);

  const mockRemoteLinks = [{ connectedTo: 'remote-site-1' }, { connectedTo: 'remote-site-2' }];

  it('renders remote links table', () => {
    render(<RemoteLinksTable links={mockRemoteLinks} t={mockT} />);

    expect(screen.getByText('remote-site-1')).toBeInTheDocument();
    expect(screen.getByText('remote-site-2')).toBeInTheDocument();
  });

  it('handles null connectedTo value', () => {
    const linksWithNull = [{ connectedTo: null }, { connectedTo: 'remote-site' }];

    render(<RemoteLinksTable links={linksWithNull} t={mockT} />);

    expect(screen.getByText('remote-site')).toBeInTheDocument();
  });
});
