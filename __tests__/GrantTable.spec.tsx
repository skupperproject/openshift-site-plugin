import { ISO8601Timestamp, StatusAccessGrantType } from '@interfaces/CRD_Base';
import { AccessGrant } from '@interfaces/REST.interfaces';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AccessGrantCrdResponse } from '../src/console/interfaces/CRD_AccessGrant';
import AccessGrantTable from '../src/console/pages/tabs/Links/GrantsTable';

describe('AccessGrantTable', () => {
  const mockT = vi.fn((key: string) => key);
  const mockOnDownloadGrant = vi.fn();
  const mockOnDeleteGrant = vi.fn();

  const validDate = new Date();
  validDate.setDate(validDate.getDate() + 1);

  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - 1);

  const mockGrantRawData: AccessGrantCrdResponse = {
    apiVersion: 'skupper.io/v2alpha1',
    kind: 'AccessGrant',
    metadata: {
      uid: '123',
      name: 'grant-1',
      namespace: 'default',
      resourceVersion: '1',
      creationTimestamp: validDate.toISOString() as ISO8601Timestamp
    },
    spec: {
      redemptionsAllowed: 2,
      expirationWindow: '24h',
      code: 'test-code'
    },
    status: {
      url: 'test-url',
      code: 'test-code',
      ca: 'test-ca',
      redemptions: 1,
      expirationTime: validDate.toISOString() as ISO8601Timestamp,
      status: 'Ready' as StatusAccessGrantType,
      message: 'OK',
      conditions: []
    }
  };

  const mockGrants: AccessGrant[] = [
    {
      id: '123',
      name: 'grant-1',
      creationTimestamp: validDate.toISOString() as ISO8601Timestamp,
      status: 'Ready',
      statusMessage: 'OK',
      hasError: false,
      redemptionsAllowed: 2,
      redemptions: 1,
      expirationTime: validDate.toISOString(),
      rawData: mockGrantRawData
    },
    {
      id: '456',
      name: 'grant-2',
      creationTimestamp: expiredDate.toISOString() as ISO8601Timestamp,
      status: 'Error',
      statusMessage: 'Error',
      hasError: true,
      redemptionsAllowed: 1,
      redemptions: 10,
      expirationTime: expiredDate.toISOString(),
      rawData: {
        ...mockGrantRawData,
        metadata: { ...mockGrantRawData.metadata, name: 'grant-2', uid: '456' }
      }
    }
  ];

  it('renders table with grants data', () => {
    render(
      <AccessGrantTable
        grants={mockGrants}
        onDownloadGrant={mockOnDownloadGrant}
        onDeleteGrant={mockOnDeleteGrant}
        t={mockT}
      />
    );

    expect(screen.getByText('grant-1')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('handles download button states', () => {
    render(
      <AccessGrantTable
        grants={mockGrants}
        onDownloadGrant={mockOnDownloadGrant}
        onDeleteGrant={mockOnDeleteGrant}
        t={mockT}
      />
    );

    const downloadButtons = screen.getAllByRole('button', { name: 'Download' });

    // Valid grant
    fireEvent.click(downloadButtons[0]);
    expect(mockOnDownloadGrant).toHaveBeenCalledWith(mockGrants[0].rawData);

    // Invalid grant (expired/error)
    expect(downloadButtons[1]).toBeDisabled();
  });

  it('handles delete action', () => {
    render(
      <AccessGrantTable
        grants={mockGrants}
        onDownloadGrant={mockOnDownloadGrant}
        onDeleteGrant={mockOnDeleteGrant}
        t={mockT}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteGrant).toHaveBeenCalledWith('grant-1');
  });

  it('disables download when redemptions exceeded', () => {
    const grantWithMaxRedemptions = {
      ...mockGrants[0],
      redemptionsAllowed: 1,
      redemptions: 1
    };

    render(
      <AccessGrantTable
        grants={[grantWithMaxRedemptions]}
        onDownloadGrant={mockOnDownloadGrant}
        onDeleteGrant={mockOnDeleteGrant}
        t={mockT}
      />
    );

    const downloadButton = screen.getByRole('button', { name: 'Download' });
    expect(downloadButton).toBeDisabled();
  });

  it('shows expiration status', () => {
    render(
      <AccessGrantTable
        grants={mockGrants}
        onDownloadGrant={mockOnDownloadGrant}
        onDeleteGrant={mockOnDeleteGrant}
        t={mockT}
      />
    );

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });
});
