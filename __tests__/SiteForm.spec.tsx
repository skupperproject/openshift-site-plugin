import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RESTApi } from '../src/console/API/REST.api';
import { NamespaceManager } from '../src/console/config/db';
import SiteForm from '../src/console/pages/components/forms/SiteForm';

const mockCreateOrUpdateSite = vi.hoisted(() => vi.fn());
const mockPreventDefault = vi.fn();

vi.mock('../src/console/API/REST.api', () => ({
  RESTApi: {
    createOrUpdateSite: mockCreateOrUpdateSite
  }
}));

describe('SiteForm', () => {
  const defaultProps = {
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with default values', () => {
    render(<SiteForm {...defaultProps} />);

    expect(screen.getByLabelText('form name input')).toBeInTheDocument();
    expect(screen.getByText('Enable link access')).toBeInTheDocument();
    expect(screen.getByLabelText('form link access select')).toBeInTheDocument();
  });

  it('handles name input change', async () => {
    render(<SiteForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('form name input');
    await userEvent.type(nameInput, 'test-site');

    expect(nameInput).toHaveValue('test-site');
  });

  it('submits form with correct data', async () => {
    mockCreateOrUpdateSite.mockResolvedValue({});

    render(<SiteForm {...defaultProps} />);

    // Fill form
    await userEvent.type(screen.getByLabelText('form name input'), 'test-site');
    await userEvent.click(screen.getByText('Submit'));

    expect(RESTApi.createOrUpdateSite).toHaveBeenCalled();
    const callArg = mockCreateOrUpdateSite.mock.calls[0][0];
    expect(callArg.metadata.name).toBe('test-site');
  });

  it('handles link access toggle', async () => {
    render(<SiteForm {...defaultProps} />);

    const checkbox = screen.getByText('Enable link access');
    const select = screen.getByLabelText('form link access select');

    expect(select).toBeEnabled();

    await userEvent.click(checkbox);
    expect(select).toBeDisabled();

    await userEvent.click(checkbox);
    expect(select).toBeEnabled();
  });

  it('disables submit button when name is empty', () => {
    render(<SiteForm {...defaultProps} />);

    const nameInput = screen.getByLabelText('form name input');
    const submitButton = screen.getByText('Submit');

    fireEvent.change(nameInput, { target: { value: '' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(nameInput, { target: { value: 'test' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows error message when API call fails', async () => {
    const errorMessage = 'API Error';
    mockCreateOrUpdateSite.mockRejectedValue({
      descriptionMessage: errorMessage
    });

    render(<SiteForm {...defaultProps} />);

    await userEvent.type(screen.getByLabelText('form name input'), 'test-site');
    await userEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<SiteForm {...defaultProps} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('shows advanced options when expanded', async () => {
    render(
      <SiteForm
        {...defaultProps}
        show={{
          serviceAccount: true,
          ha: true,
          name: true
        }}
      />
    );

    await userEvent.click(screen.getByText('Show more'));

    expect(screen.getByLabelText('form service account input')).toBeInTheDocument();
    expect(screen.getByLabelText('form ha checkbox')).toBeInTheDocument();
  });

  it('updates form with initial values', () => {
    const initialProps = {
      ...defaultProps,
      siteName: 'initial-site',
      linkAccess: 'loadbalancer',
      serviceAccount: 'test-account',
      ha: true
    };

    render(<SiteForm {...initialProps} />);

    expect(screen.getByLabelText('form name input')).toHaveValue('initial-site');
    expect(screen.getByLabelText('form name input')).toBeDisabled();
    expect(screen.getByLabelText('form link access select')).toHaveValue('loadbalancer');
  });

  it('shows loading screen after successful submission for new site', async () => {
    mockCreateOrUpdateSite.mockResolvedValue({});
    render(<SiteForm onCancel={vi.fn()} />);

    const nameInput = screen.getByTestId('name-input');
    await userEvent.type(nameInput, 'test-site');
    await userEvent.click(screen.getByTestId('submit-button'));

    // Should transition to loading screen
    await waitFor(() => {
      expect(screen.getByTestId('loading-card')).toBeInTheDocument();
    });
  });

  it('submits form when Enter key is pressed', async () => {
    mockCreateOrUpdateSite.mockResolvedValue({});
    render(<SiteForm onCancel={vi.fn()} />);

    const nameInput = screen.getByTestId('name-input');
    await userEvent.type(nameInput, 'test-site');
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(mockCreateOrUpdateSite).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { name: 'test-site' }
      }),
      undefined
    );
  });

  it('does not submit on Enter when name is empty', async () => {
    mockCreateOrUpdateSite.mockResolvedValue({});
    render(<SiteForm onCancel={vi.fn()} />);

    const nameInput = screen.getByTestId('name-input');
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(mockCreateOrUpdateSite).not.toHaveBeenCalled();
  });

  it('renders form with default show props', () => {
    render(<SiteForm onCancel={vi.fn()} />);

    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('link-access-group')).toBeInTheDocument();
    expect(screen.getByTestId('expandable-section')).toBeInTheDocument();
  });

  it('handles all secondary options together', async () => {
    render(
      <SiteForm
        onCancel={vi.fn()}
        show={{
          serviceAccount: true,
          defaultIssuer: true,
          ha: true
        }}
      />
    );

    // Expand secondary options
    await userEvent.click(screen.getByText('Show more'));

    // Fill all secondary options
    await userEvent.type(screen.getByTestId('service-account-input'), 'test-account');
    await userEvent.type(screen.getByTestId('default-issuer-input'), 'test-issuer');
    await userEvent.click(screen.getByTestId('ha-checkbox'));

    // Fill required name and submit
    await userEvent.type(screen.getByTestId('name-input'), 'test-site');
    await userEvent.click(screen.getByTestId('submit-button'));

    expect(mockCreateOrUpdateSite).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { name: 'test-site' },
        spec: {
          serviceAccount: 'test-account',
          defaultIssuer: 'test-issuer',
          linkAccess: 'route',
          ha: true
        }
      }),
      undefined
    );
  });

  it('handles default values for optional fields', () => {
    render(<SiteForm onCancel={vi.fn()} />);

    expect(screen.getByTestId('link-access-select')).toHaveValue('route');

    const nameInput = screen.getByTestId('name-input');
    expect(nameInput).toHaveValue(NamespaceManager.getNamespace());
  });

  it('closes form when siteName is provided and submission is successful', async () => {
    const onCancel = vi.fn();
    mockCreateOrUpdateSite.mockResolvedValue({});

    render(
      <SiteForm
        onCancel={onCancel}
        siteName="existing-site"
        show={{
          serviceAccount: true,
          ha: true
        }}
      />
    );

    await userEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it('does not prevent default on Enter key press when name is empty', async () => {
    render(<SiteForm onCancel={vi.fn()} />);

    const nameInput = screen.getByTestId('name-input');

    fireEvent.keyDown(nameInput, {
      key: 'Enter',
      preventDefault: mockPreventDefault
    });

    expect(mockPreventDefault).not.toHaveBeenCalled();
    expect(mockCreateOrUpdateSite).not.toHaveBeenCalled();
  });

  it('renders secondary options when serviceAccount is true and ha is false', () => {
    render(
      <SiteForm
        onCancel={vi.fn()}
        show={{
          serviceAccount: true,
          ha: false
        }}
      />
    );

    // Should show service account directly (not in expandable section)
    expect(screen.queryByTestId('expandable-section')).not.toBeInTheDocument();
    expect(screen.getByTestId('service-account-input')).toBeInTheDocument();
    expect(screen.queryByTestId('ha-checkbox')).not.toBeInTheDocument();
  });

  it('renders secondary options when serviceAccount is false and ha is true', () => {
    render(
      <SiteForm
        onCancel={vi.fn()}
        show={{
          serviceAccount: false,
          ha: true
        }}
      />
    );

    // Should show ha checkbox directly (not in expandable section)
    expect(screen.queryByTestId('expandable-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('service-account-input')).not.toBeInTheDocument();
    expect(screen.getByTestId('ha-checkbox')).toBeInTheDocument();
  });

  it('renders defaultIssuer in correct section based on serviceAccount and ha', () => {
    // Case 1: With expandable section
    const { rerender } = render(
      <SiteForm
        onCancel={vi.fn()}
        show={{
          serviceAccount: true,
          ha: true,
          defaultIssuer: true
        }}
      />
    );

    fireEvent.click(screen.getByText('Show more'));
    expect(screen.getByTestId('default-issuer-input')).toBeInTheDocument();

    // Case 2: Without expandable section
    rerender(
      <SiteForm
        onCancel={vi.fn()}
        show={{
          serviceAccount: false,
          ha: false,
          defaultIssuer: true
        }}
      />
    );

    expect(screen.queryByTestId('expandable-section')).not.toBeInTheDocument();
    expect(screen.getByTestId('default-issuer-input')).toBeInTheDocument();
  });

  it('handles all secondary options being false', () => {
    render(
      <SiteForm
        onCancel={vi.fn()}
        show={{
          serviceAccount: false,
          ha: false,
          defaultIssuer: false
        }}
      />
    );

    expect(screen.queryByTestId('expandable-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('service-account-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ha-checkbox')).not.toBeInTheDocument();
    expect(screen.queryByTestId('default-issuer-input')).not.toBeInTheDocument();
  });

  describe('SiteForm - Link Access Tests', () => {
    it('changes link access value when selecting a different option', async () => {
      render(<SiteForm onCancel={vi.fn()} />);

      // The select should be initially set to 'route'
      const select = screen.getByTestId('link-access-select');
      expect(select).toHaveValue('route');

      // Change to 'loadbalancer'
      await userEvent.selectOptions(select, 'loadbalancer');
      expect(select).toHaveValue('loadbalancer');

      // Change to 'default'
      await userEvent.selectOptions(select, 'default');
      expect(select).toHaveValue('default');

      // Verify the changes are reflected in form submission
      await userEvent.type(screen.getByTestId('name-input'), 'test-site');
      await userEvent.click(screen.getByTestId('submit-button'));

      expect(mockCreateOrUpdateSite).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: expect.objectContaining({
            linkAccess: 'default'
          })
        }),
        undefined
      );
    });

    it('initializes with correct link access value and allows changes', async () => {
      render(<SiteForm onCancel={vi.fn()} linkAccess="loadbalancer" />);

      // Should initialize with provided value
      const select = screen.getByTestId('link-access-select');
      expect(select).toHaveValue('loadbalancer');

      // Should allow changing to different value
      await userEvent.selectOptions(select, 'default');
      expect(select).toHaveValue('default');
    });

    it('excludes linkAccess from submission when toggle is disabled', async () => {
      render(<SiteForm onCancel={vi.fn()} />);

      // Disable link access
      await userEvent.click(screen.getByTestId('link-access-checkbox'));

      // Submit form
      await userEvent.type(screen.getByTestId('name-input'), 'test-site');
      await userEvent.click(screen.getByTestId('submit-button'));

      expect(mockCreateOrUpdateSite).toHaveBeenCalledWith(
        expect.objectContaining({
          spec: expect.not.objectContaining({
            linkAccess: expect.anything()
          })
        }),
        undefined
      );
    });
  });
});
