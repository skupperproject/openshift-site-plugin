import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ISO8601Timestamp, ReasonStatus } from '../src/console/interfaces/CRD_Base';
import { SiteView } from '../src/console/interfaces/REST.interfaces';
import Header from '../src/console/pages/tabs/Details/Header';

const createMockSite = (overrides: Partial<SiteView> = {}): SiteView => ({
  name: 'test-site',
  creationTimestamp: new Date().toISOString() as ISO8601Timestamp,
  hasError: false,
  status: 'Ready',
  identity: 'test-identity',
  linkAccess: 'test-link-access',
  serviceAccount: 'test-service-account',
  defaultIssuer: 'test-issuer',
  ha: false,
  platform: 'test-platform',
  linkCount: 0,
  remoteLinks: [],
  isConfigured: true,
  isReady: true,
  hasSecondaryErrors: false,
  resourceVersion: 'v1',
  sitesInNetwork: 0,
  statusMessage: '',
  rawData: {} as unknown as SiteView['rawData'],
  ...overrides
});

vi.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  YellowExclamationTriangleIcon: vi.fn(() => <span>Yellow Warning</span>)
}));

vi.mock('../src/console/pages/components/DeleteSiteButton', () => ({
  default: vi.fn(({ id }) => <button>Delete {id}</button>)
}));

vi.mock('../src/console/pages/components/forms/ImportForm', () => ({
  ImportForm: vi.fn(({ onSubmit }) => (
    <form data-testid="import-form" onSubmit={onSubmit}>
      <button type="submit">Submit</button>
      Import Form
    </form>
  ))
}));

describe('Header Component', () => {
  const mockTranslate = (key: string) => key;

  it('renders site settings title', () => {
    render(<Header site={undefined} t={mockTranslate} />);

    const titleElement = screen.getByRole('heading', { level: 1, name: 'Site settings' });
    expect(titleElement).toBeInTheDocument();
  });

  it('renders in progress label when no site status', () => {
    render(<Header site={createMockSite({ status: undefined })} t={mockTranslate} />);

    const inProgressLabel = screen.getByText('In progress');
    expect(inProgressLabel).toBeInTheDocument();
  });

  it('renders site status label when site has status', () => {
    const site = {
      status: 'Ready' as ReasonStatus,
      hasError: false,
      isConfigured: true,
      isReady: true
    };

    render(<Header site={createMockSite(site)} t={mockTranslate} />);

    const statusLabel = screen.getByText('Ready');
    expect(statusLabel).toBeInTheDocument();
  });

  it('renders error icon when site has error', () => {
    const site = {
      status: 'Error' as ReasonStatus,
      hasError: true
    };

    render(<Header site={createMockSite(site)} t={mockTranslate} />);

    const errorIcon = screen.getByTestId('header-error');
    expect(errorIcon).toBeInTheDocument();
  });

  it('renders success icon when site is configured and ready', () => {
    const site = {
      status: 'Ready' as ReasonStatus,
      hasError: false,
      isConfigured: true,
      isReady: true
    };

    render(<Header site={createMockSite(site)} t={mockTranslate} />);

    const successIcon = screen.getByTestId('header-success');
    expect(successIcon).toBeInTheDocument();
  });

  it('renders warning icon for secondary errors', () => {
    const site = {
      status: 'Pending' as ReasonStatus,
      hasError: false,
      hasSecondaryErrors: true
    };

    render(<Header site={createMockSite(site)} t={mockTranslate} />);

    const warningIcon = screen.getByText('Yellow Warning');
    expect(warningIcon).toBeInTheDocument();
  });

  it('renders import and delete buttons when site has name', () => {
    const site = {
      name: 'Test Site',
      status: 'Configured' as ReasonStatus,
      hasError: false,
      isConfigured: true,
      isReady: true
    };

    render(<Header site={createMockSite(site)} t={mockTranslate} />);

    const importButton = screen.getByText('Import');
    const deleteButton = screen.getByText('Delete Test Site');

    expect(importButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('closes import modal when submit is clicked', async () => {
    const site = createMockSite({ name: 'Test Site' });
    render(<Header site={site} t={mockTranslate} />);

    const importButton = screen.getByText('Import');
    fireEvent.click(importButton);

    const importForm = screen.getByTestId('import-form');
    expect(importForm).toBeInTheDocument();

    fireEvent.submit(importForm);

    expect(screen.queryByTestId('import-form')).toBeNull();
  });
});
