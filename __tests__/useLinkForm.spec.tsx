import { FC } from 'react';

import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { FormContext } from '../src/console/pages/components/forms/LinkForm/context/LinkFormProvider';
import { useLinkForm } from '../src/console/pages/components/forms/LinkForm/hooks/useLinkForm';

describe('useLinkForm Hook', () => {
  const TestComponent: FC<{
    onResult?: (hookResult: unknown) => void;
    onError?: (error: Error) => void;
  }> = function ({ onResult, onError }) {
    try {
      const hookResult = useLinkForm();
      onResult?.(hookResult);
    } catch (error) {
      onError?.(error as Error);
    }

    return null;
  };

  it('returns the context value from FormContext', () => {
    const mockContextValue = {
      state: {
        name: 'test-link',
        cost: '1',
        fileName: 'test-link.',
        file: 'test-link'
      },
      dispatch: vi.fn(),
      isLoading: false,
      setIsLoading: vi.fn(),
      validated: undefined,
      setValidated: vi.fn()
    };

    let capturedResult: unknown;

    render(
      <FormContext.Provider value={mockContextValue}>
        <TestComponent
          onResult={(result) => {
            capturedResult = result;
          }}
        />
      </FormContext.Provider>
    );

    expect(capturedResult).toEqual(mockContextValue);
  });
});
