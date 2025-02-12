import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import InstructionBlock from '../src/console/core/components/InstructionBlock';

const MockExternalLink = vi.hoisted(() =>
  vi.fn(({ href, text }) => (
    <a href={href} data-testid="external-link">
      {text}
    </a>
  ))
);

vi.mock('../src/console/core/components/ExternalLink', () => ({
  default: MockExternalLink
}));

describe('InstructionBlock Component', () => {
  const baseProps = {
    img: '/test-image.png',
    title: 'Test Title',
    description: 'Test Description'
  };

  it('renders basic component with required props', () => {
    render(<InstructionBlock {...baseProps} />);

    const image = screen.getByAltText('Link tutorial');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.png');

    const title = screen.getByRole('heading', { level: 3, name: 'Test Title' });
    expect(title).toBeInTheDocument();

    const description = screen.getByText('Test Description');
    expect(description).toBeInTheDocument();
  });

  it('renders with two links', () => {
    MockExternalLink.mockClear();

    const propsWithTwoLinks = {
      ...baseProps,
      link1: 'https://example1.com',
      link1Text: 'First Link',
      link2: 'https://example2.com',
      link2Text: 'Second Link'
    };

    render(<InstructionBlock {...propsWithTwoLinks} />);

    expect(MockExternalLink).toHaveBeenCalledTimes(2);

    expect(MockExternalLink.mock.calls[0][0]).toEqual({
      href: 'https://example1.com',
      text: 'First Link'
    });

    expect(MockExternalLink.mock.calls[1][0]).toEqual({
      href: 'https://example2.com',
      text: 'Second Link'
    });

    const separator = screen.getByText('|');
    expect(separator).toBeInTheDocument();

    const links = screen.getAllByTestId('external-link');
    expect(links).toHaveLength(2);
  });

  it('renders with additional component', () => {
    const TestComponent = function () {
      return <div>Additional Component</div>;
    };

    const propsWithComponent = {
      ...baseProps,
      component: <TestComponent />
    };

    render(<InstructionBlock {...propsWithComponent} />);

    const additionalComponent = screen.getByText('Additional Component');
    expect(additionalComponent).toBeInTheDocument();
  });

  it('renders without links when not provided', () => {
    MockExternalLink.mockClear();

    render(<InstructionBlock {...baseProps} />);

    expect(MockExternalLink).not.toHaveBeenCalled();
    const links = screen.queryByTestId('external-link');
    expect(links).toBeNull();
  });
});
