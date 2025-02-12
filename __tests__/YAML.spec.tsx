import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { stringify } from 'yaml';

import YAML from '../src/console/pages/tabs/YAML';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());

vi.mock('@hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

vi.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  CodeEditor: vi.fn(({ value, options }) => (
    <div data-testid="code-editor" data-value={value} data-readonly={options.readOnly}>
      {value}
    </div>
  ))
}));

describe('YAML Component', () => {
  it('renders the card with yaml content', () => {
    const mockSiteData = {
      rawData: {
        name: 'test-site',
        status: 'Active'
      }
    };

    mockUseWatchedSkupperResource.mockReturnValue({
      data: [mockSiteData]
    });

    render(<YAML />);

    const card = screen.getByTestId('yaml');
    expect(card).toBeInTheDocument();

    const codeEditor = screen.getByTestId('code-editor');
    expect(codeEditor).toBeInTheDocument();
    expect(codeEditor).toHaveAttribute('data-value', stringify(mockSiteData.rawData));
    expect(codeEditor).toHaveAttribute('data-readonly', 'true');
  });

  it('handles empty sites array', () => {
    mockUseWatchedSkupperResource.mockReturnValue({
      data: null
    });

    render(<YAML />);

    const card = screen.getByTestId('yaml');
    expect(card).toBeInTheDocument();

    const codeEditor = screen.getByTestId('code-editor');
    expect(codeEditor).toHaveAttribute('data-value', '');
  });
});
