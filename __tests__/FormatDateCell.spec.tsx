import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import FormatDateCell from '../src/console/core/components/FormatDate';

describe('FormatOCPDateCell', () => {
  it('renders null when no value provided', () => {
    const { container } = render(<FormatDateCell />);
    expect(container.firstChild).toBeNull();
  });

  it('renders formatted date', () => {
    const date = new Date('2024-02-05T14:30:00Z');
    render(<FormatDateCell value={date} />);

    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });
});
