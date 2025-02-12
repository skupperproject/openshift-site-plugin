import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { FormContext, FormProvider } from '../src/console/pages/components/forms/LinkForm/context/LinkFormProvider';

describe('LinkFormProvider', () => {
  const TestChild = function () {
    const context = React.useContext(FormContext);

    return (
      <div>
        <div data-testid="name">{context.state.name}</div>
        <div data-testid="cost">{context.state.cost}</div>
        <div data-testid="fileName">{context.state.fileName}</div>
        <div data-testid="file">{context.state.file}</div>
        <button onClick={() => context.dispatch({ type: 'SET_NAME', payload: 'test-name' })}>Set Name</button>
        <button onClick={() => context.dispatch({ type: 'SET_COST', payload: '2' })}>Set Cost</button>
        <button onClick={() => context.dispatch({ type: 'SET_FILE_NAME', payload: 'test.yaml' })}>Set File Name</button>
        <button onClick={() => context.dispatch({ type: 'SET_FILE_CONTENT', payload: 'content' })}>
          Set File Content
        </button>
        <button onClick={() => context.setIsLoading(true)}>Set Loading</button>
        <button onClick={() => context.setValidated('error')}>Set Validated</button>
      </div>
    );
  };

  it('provides initial state', () => {
    render(
      <FormProvider>
        <TestChild />
      </FormProvider>
    );

    expect(screen.getByTestId('name')).toHaveTextContent('');
    expect(screen.getByTestId('cost')).toHaveTextContent('1');
    expect(screen.getByTestId('fileName')).toHaveTextContent('');
    expect(screen.getByTestId('file')).toHaveTextContent('');
  });

  it('updates state through dispatch', () => {
    render(
      <FormProvider>
        <TestChild />
      </FormProvider>
    );

    screen.getByText('Set Name').click();
    expect(screen.getByTestId('name')).toHaveTextContent('test-name');

    screen.getByText('Set Cost').click();
    expect(screen.getByTestId('cost')).toHaveTextContent('2');

    screen.getByText('Set File Name').click();
    expect(screen.getByTestId('fileName')).toHaveTextContent('test.yaml');

    screen.getByText('Set File Content').click();
    expect(screen.getByTestId('file')).toHaveTextContent('content');
  });

  it('provides and updates loading state', () => {
    let contextValue: any;

    render(
      <FormProvider>
        <FormContext.Consumer>
          {(value) => {
            contextValue = value;

            return null;
          }}
        </FormContext.Consumer>
        <TestChild />
      </FormProvider>
    );

    expect(contextValue.isLoading).toBe(false);
    screen.getByText('Set Loading').click();
    expect(contextValue.isLoading).toBe(true);
  });

  it('provides and updates validation state', () => {
    let contextValue: any;

    render(
      <FormProvider>
        <FormContext.Consumer>
          {(value) => {
            contextValue = value;

            return null;
          }}
        </FormContext.Consumer>
        <TestChild />
      </FormProvider>
    );

    expect(contextValue.validated).toBeUndefined();
    screen.getByText('Set Validated').click();
    expect(contextValue.validated).toBe('error');
  });

  it('handles unknown action type', () => {
    let contextValue: any;

    render(
      <FormProvider>
        <FormContext.Consumer>
          {(value) => {
            contextValue = value;

            return null;
          }}
        </FormContext.Consumer>
        <TestChild />
      </FormProvider>
    );

    // @ts-ignore
    contextValue.dispatch({ type: 'UNKNOWN', payload: 'test' });

    expect(contextValue.state).toEqual({
      name: '',
      cost: '1',
      fileName: '',
      file: ''
    });
  });
});
