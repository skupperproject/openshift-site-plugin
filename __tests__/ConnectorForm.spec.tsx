import { RESTApi } from '@API/REST.api';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';

import ConnectorForm from '../src/console/pages/components/forms/ConnectorForm';

vi.mock('../src/console/API/REST.api');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (str: string) => str })
}));

describe('ConnectorForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const renderForm = (props = {}) =>
    render(<ConnectorForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} title="Create Connector" {...props} />);

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

    type InputKey = 'name' | 'port' | 'routingKey' | 'selector' | 'host' | 'tls';

    const inputs: Record<InputKey, HTMLElement> = {
      name: screen.getByLabelText('form name input'),
      port: screen.getByLabelText('form port input'),
      routingKey: screen.getByLabelText('form routing key input'),
      selector: screen.getByLabelText('form selector input'),
      host: screen.getByLabelText('form host input'),
      tls: screen.getByLabelText('form TLS secret input')
    };

    const values: Record<InputKey, string> = {
      name: 'test-connector',
      port: '8080',
      routingKey: 'test-key',
      selector: 'app=test',
      host: 'test-host',
      tls: 'test-tls'
    };

    (Object.keys(values) as InputKey[]).forEach((key) => {
      fireEvent.change(inputs[key], { target: { value: values[key] } });
      expect(inputs[key]).toHaveValue(values[key]);
    });
  });

  it('enables submit when required fields are filled', () => {
    renderForm();
    const submitButton = screen.getByText('Submit');

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('form name input'), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText('form port input'), { target: { value: '8080' } });

    expect(submitButton).toBeEnabled();
  });

  it('calls onSubmit when form is submitted', async () => {
    const mockCreateConnector = vi.spyOn(RESTApi, 'createOrUpdateConnector').mockResolvedValue('Created');
    renderForm();

    fireEvent.change(screen.getByLabelText('form name input'), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText('form port input'), { target: { value: '8080' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockCreateConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { name: 'test' },
          spec: expect.objectContaining({
            port: 8080,
            includeNotReadyPods: false
          })
        }),
        undefined
      );
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    vi.spyOn(RESTApi, 'createOrUpdateConnector').mockRejectedValue({
      descriptionMessage: 'Error message'
    });

    renderForm();
    fireEvent.change(screen.getByLabelText('form name input'), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText('form port input'), { target: { value: '8080' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('toggles includeNotReadyPods checkbox', () => {
    renderForm();
    const checkbox = screen.getByLabelText('form include not ready checkbox');

    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('calls onCancel when cancel button clicked', () => {
    renderForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submits form on Enter key', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('form name input'), { target: { value: 'test' } });
    fireEvent.change(screen.getByLabelText('form port input'), { target: { value: '8080' } });
    fireEvent.keyDown(screen.getByLabelText('form name input'), { key: 'Enter' });

    expect(RESTApi.createOrUpdateConnector).toHaveBeenCalled();
  });
});
