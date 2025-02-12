import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import GetStarted from '../src/console/pages/tabs/GetStarted';

vi.mock('../src/console/core/components/ExternalLink', () => ({
  default: vi.fn(({ href, text }) => <a href={href}>{text}</a>)
}));

vi.mock('../src/console/pages/components/DeploymentNetworkConsoleButton', () => ({
  default: vi.fn(() => <button>Deploy Network Console</button>)
}));

vi.mock('../src/console/pages/components/forms/GrantForm', () => ({
  default: vi.fn(({ onCancel }) => (
    <div data-testid="grant-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

vi.mock('../src/console/pages/components/forms/LinkForm', () => ({
  default: vi.fn(({ onCancel }) => (
    <div data-testid="link-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

vi.mock('../src/console/pages/components/forms/ListenerForm', () => ({
  default: vi.fn(({ onCancel }) => (
    <div data-testid="listener-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

vi.mock('../src/console/pages/components/forms/ConnectorForm', () => ({
  default: vi.fn(({ onCancel }) => (
    <div data-testid="connector-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

describe('GetStarted Component', () => {
  const siteId = 'test-site';

  it('renders main page sections', () => {
    render(<GetStarted siteId={siteId} />);

    expect(screen.getByText(/Service Interconnect is a layer 7 network/)).toBeInTheDocument();
    expect(screen.getByText('Learn more about the console')).toBeInTheDocument();
  });

  it('renders detail items with correct titles', () => {
    render(<GetStarted siteId={siteId} />);

    const detailTitles = [
      'Generating tokens',
      'Linking to remote sites',
      'Expose a service for accepting connections',
      'Binds local servers to listeners in remote sites'
    ];

    detailTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('opens modal for token generation', () => {
    render(<GetStarted siteId={siteId} />);

    const tokenButton = screen.getByText('Generate a token');
    fireEvent.click(tokenButton);

    const grantForm = screen.getByTestId('grant-form');
    expect(grantForm).toBeInTheDocument();
  });

  it('opens modal for link creation', () => {
    render(<GetStarted siteId={siteId} />);

    const linkButton = screen.getByText('Create a link');
    fireEvent.click(linkButton);

    const linkForm = screen.getByTestId('link-form');
    expect(linkForm).toBeInTheDocument();
  });

  it('opens modal for listener creation', () => {
    render(<GetStarted siteId={siteId} />);

    const listenerButton = screen.getByText('Create a listener');
    fireEvent.click(listenerButton);

    const listenerForm = screen.getByTestId('listener-form');
    expect(listenerForm).toBeInTheDocument();
  });

  it('opens modal for connector creation', () => {
    render(<GetStarted siteId={siteId} />);

    const connectorButton = screen.getByText('Create a connector');
    fireEvent.click(connectorButton);

    const connectorForm = screen.getByTestId('connector-form');
    expect(connectorForm).toBeInTheDocument();
  });

  it('renders deployment network console button', () => {
    render(<GetStarted siteId={siteId} />);

    const deployButton = screen.getByText('Deploy Network Console');
    expect(deployButton).toBeInTheDocument();
  });

  it('renders CLI information links', () => {
    render(<GetStarted siteId={siteId} />);

    const cliLinks = [
      'Creating a site using the CLI',
      'Linking sites',
      'Exposing services from a different namespace to the service network',
      'Exposing services on the service network from a local machine'
    ];

    cliLinks.forEach((linkText) => {
      expect(screen.getByText(linkText)).toBeInTheDocument();
    });
  });

  it('closes modal when cancel is clicked', () => {
    render(<GetStarted siteId={siteId} />);

    const tokenButton = screen.getByText('Generate a token');
    fireEvent.click(tokenButton);

    const grantForm = screen.getByTestId('grant-form');
    expect(grantForm).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('grant-form')).toBeNull();
  });
});
