import { RESTApi } from '@API/REST.api';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';

import ListenerForm from '../src/console/pages/components/forms/ListenerForm';

vi.mock('../src/console/API/REST.api');

describe('ListenerForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const renderForm = (props = {}) =>
    render(<ListenerForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} title="Create Listener" {...props} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with empty fields', () => {
    renderForm();
    expect(screen.getByLabelText('form name input')).toHaveValue('');
    expect(screen.getByLabelText('form port input')).toHaveValue('');
  });

  it('updates input values', () => {
    renderForm();

    const nameInput = screen.getByLabelText('form name input');
    const portInput = screen.getByLabelText('form port input');

    fireEvent.change(nameInput, { target: { value: 'test-listener' } });
    fireEvent.change(portInput, { target: { value: '8080' } });

    expect(nameInput).toHaveValue('test-listener');
    expect(portInput).toHaveValue('8080');
  });

  it('enables submit when required fields are filled', () => {
    renderForm();

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('form name input'), {
      target: { value: 'test' }
    });
    fireEvent.change(screen.getByLabelText('form port input'), {
      target: { value: '8080' }
    });

    expect(submitButton).toBeEnabled();
  });

  it('calls onSubmit when form is submitted', async () => {
    const mockCreateListener = vi.spyOn(RESTApi, 'createOrUpdateListener').mockResolvedValue('Created');

    renderForm();

    fireEvent.change(screen.getByLabelText('form name input'), {
      target: { value: 'test' }
    });
    fireEvent.change(screen.getByLabelText('form port input'), {
      target: { value: '8080' }
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockCreateListener).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { name: 'test' },
          spec: expect.objectContaining({
            port: 8080
          })
        }),
        undefined
      );
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    vi.spyOn(RESTApi, 'createOrUpdateListener').mockRejectedValue({
      descriptionMessage: 'Error message'
    });

    renderForm();

    fireEvent.change(screen.getByLabelText('form name input'), {
      target: { value: 'test' }
    });
    fireEvent.change(screen.getByLabelText('form port input'), {
      target: { value: '8080' }
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button clicked', () => {
    renderForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submits form on Enter key', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('form name input'), {
      target: { value: 'test' }
    });
    fireEvent.change(screen.getByLabelText('form port input'), {
      target: { value: '8080' }
    });

    fireEvent.keyDown(screen.getByLabelText('form name input'), {
      key: 'Enter'
    });

    expect(RESTApi.createOrUpdateListener).toHaveBeenCalled();
  });

  it('updates state on input changes', () => {
    renderForm();

    const routingKeyInput = screen.getByLabelText('form routing key input');
    const serviceNameInput = screen.getByLabelText('form service name input');
    const portInput = screen.getByLabelText('form port input');
    const nameInput = screen.getByLabelText('form name input');
    const tlsInput = screen.getByLabelText('form TLS secret input');

    fireEvent.change(routingKeyInput, { target: { value: 'test-key' } });
    fireEvent.change(serviceNameInput, { target: { value: 'test-service' } });
    fireEvent.change(portInput, { target: { value: '8080' } });
    fireEvent.change(nameInput, { target: { value: 'test-name' } });
    fireEvent.change(tlsInput, { target: { value: 'test-tls' } });

    expect(routingKeyInput).toHaveValue('test-key');
    expect(serviceNameInput).toHaveValue('test-service');
    expect(portInput).toHaveValue('8080');
    expect(nameInput).toHaveValue('test-name');
    expect(tlsInput).toHaveValue('test-tls');
  });
});
