import { ISO8601Timestamp } from '@interfaces/CRD_Base';
import { BaseView } from '@interfaces/REST.interfaces';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import StatusCell from '../src/console/core/components/StatusCell';

describe('StatusCell', () => {
  const timestamp = '2024-02-01T12:00:00Z' as ISO8601Timestamp;

  it('renders in progress state when status is empty', () => {
    const data: BaseView = {
      name: 'test',
      creationTimestamp: timestamp,
      hasError: false,
      status: '',
      statusAlert: undefined
    };
    render(<StatusCell data={data} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const data: BaseView = {
      name: 'test',
      creationTimestamp: timestamp,
      status: 'Error',
      hasError: true,
      statusAlert: 'danger'
    };
    render(<StatusCell data={data} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders success state', () => {
    const data: BaseView = {
      name: 'test',
      creationTimestamp: timestamp,
      status: 'Ready',
      hasError: false,
      statusAlert: 'success'
    };
    render(<StatusCell data={data} />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders custom state', () => {
    const data: BaseView = {
      name: 'test',
      creationTimestamp: timestamp,
      status: 'Custom',
      hasError: false,
      statusAlert: 'custom'
    };
    render(<StatusCell data={data} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });
});
