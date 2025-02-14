import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { FormPage } from '../src/console/pages/components/forms/LinkForm/FormPage';

const mockDispatch = vi.hoisted(() => vi.fn());

vi.mock('../src/console/pages/components/forms/LinkForm/hooks/useLinkForm', () => ({
  useLinkForm: () => ({
    state: {
      name: '',
      fileName: '',
      cost: '',
      file: ''
    },
    dispatch: mockDispatch
  })
}));

describe('FormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<FormPage />);
    expect(screen.getByText('Token')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('handles file upload selection', async () => {
    render(<FormPage />);

    const file = new File(['content'], 'test.yaml', { type: 'text/yaml' });
    const fileUpload = screen.getByTestId('access-token-file');

    const fileInputChangeHandler = fileUpload.querySelector('input[type="file"]') as HTMLElement;
    if (fileInputChangeHandler) {
      await userEvent.upload(fileInputChangeHandler, file);
    }

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_FILE_NAME',
      payload: 'test'
    });
  });

  it('handles name input change', () => {
    render(<FormPage />);
    const nameInput = screen.getByTestId('simple-form-name-01');

    fireEvent.change(nameInput, { target: { value: 'test-name' } });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_NAME',
      payload: 'test-name'
    });
  });

  it('handles cost input change', () => {
    render(<FormPage />);
    const costInput = screen.getByTestId('form-cost');

    fireEvent.change(costInput, { target: { value: '100' } });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_COST',
      payload: '100'
    });
  });

  it('shows file upload placeholder text', () => {
    render(<FormPage />);
    expect(screen.getByPlaceholderText('Drag and drop a file or upload one')).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(<FormPage />);
    const nameInput = screen.getByTestId('simple-form-name-01');
    const costInput = screen.getByTestId('form-cost');

    expect(nameInput).toBeRequired();
    expect(costInput).toBeRequired();
  });
});
