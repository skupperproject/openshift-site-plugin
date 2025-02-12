import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { FormPage } from '../src/console/pages/components/forms/GrantForm/FormPage';

describe('FormPage', () => {
  const mockProps = {
    onSetName: vi.fn(),
    onSetValidFor: vi.fn(),
    onSetValidForUnit: vi.fn(),
    onSetClaims: vi.fn(),
    onSetCode: vi.fn()
  };

  it('renders all form fields', () => {
    render(<FormPage {...mockProps} />);

    expect(screen.getByLabelText('filename input')).toBeInTheDocument();
    expect(screen.getByLabelText('redemption allowed input')).toBeInTheDocument();
    expect(screen.getByLabelText('code input')).toBeInTheDocument();
    expect(screen.getByLabelText('expiration window input')).toBeInTheDocument();
    expect(screen.getByLabelText('form valid for select')).toBeInTheDocument();
  });

  it('handles name input change', () => {
    render(<FormPage {...mockProps} />);

    const input = screen.getByLabelText('filename input');
    fireEvent.change(input, { target: { value: 'test-name' } });

    expect(mockProps.onSetName).toHaveBeenCalledWith('test-name');
  });

  it('handles claims input change', () => {
    render(<FormPage {...mockProps} />);

    const input = screen.getByLabelText('redemption allowed input');
    fireEvent.change(input, { target: { value: '2' } });

    expect(mockProps.onSetClaims).toHaveBeenCalledWith(2);
  });

  it('handles expiration window input change', () => {
    render(<FormPage {...mockProps} />);

    const input = screen.getByLabelText('expiration window input');
    fireEvent.change(input, { target: { value: '30' } });

    expect(mockProps.onSetValidFor).toHaveBeenCalledWith(30);
  });

  it('handles time unit change', () => {
    render(<FormPage {...mockProps} />);

    const select = screen.getByLabelText('form valid for select');
    fireEvent.change(select, { target: { value: 'h' } });

    expect(mockProps.onSetValidForUnit).toHaveBeenCalledWith('h');
  });

  it('handles code input change', () => {
    render(<FormPage {...mockProps} />);

    const input = screen.getByLabelText('code input');
    fireEvent.change(input, { target: { value: 'test-code' } });

    expect(mockProps.onSetCode).toHaveBeenCalledWith('test-code');
  });

  it('sets default values for empty numeric inputs', () => {
    render(<FormPage {...mockProps} />);

    const claimsInput = screen.getByLabelText('redemption allowed input');
    const expirationInput = screen.getByLabelText('expiration window input');

    fireEvent.change(claimsInput, { target: { value: '' } });
    fireEvent.change(expirationInput, { target: { value: '' } });

    expect(mockProps.onSetClaims).toHaveBeenCalledWith(undefined);
    expect(mockProps.onSetValidFor).toHaveBeenCalledWith(undefined);
  });

  it('handles invalid numeric inputs', () => {
    render(<FormPage {...mockProps} />);

    const claimsInput = screen.getByLabelText('redemption allowed input');
    fireEvent.change(claimsInput, { target: { value: '-1' } });

    expect(mockProps.onSetClaims).toHaveBeenCalledWith(1); // default value
  });
});
