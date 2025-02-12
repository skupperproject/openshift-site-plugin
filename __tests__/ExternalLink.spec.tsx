import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import ExternalLink from '../src/console/core/components/ExternalLink';

describe('ExternalLink Component', () => {
  const mockProps = {
    href: 'https://example.com',
    text: 'Example Link'
  };

  it('renders the link with correct attributes and content', () => {
    const { getByText, getByRole } = render(<ExternalLink {...mockProps} />);

    const linkElement = getByRole('link');

    expect(linkElement).toHaveAttribute('href', mockProps.href);
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');

    const textElement = getByText(mockProps.text);
    expect(textElement).toBeTruthy();

    const iconElement = linkElement.querySelector('svg');
    expect(iconElement).toBeTruthy();
  });

  it('renders the external link icon correctly', () => {
    const { container } = render(<ExternalLink {...mockProps} />);

    const iconElement = container.querySelector('svg');
    expect(iconElement).toBeTruthy();
    expect(iconElement).toBeInstanceOf(SVGSVGElement);
  });
});
