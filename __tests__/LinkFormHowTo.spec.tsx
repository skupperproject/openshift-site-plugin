import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { HowToPage } from '../src/console/pages/components/forms/LinkForm/HowToPage';

vi.mock('../src/console/assets/step1.png', () => ({ default: 'step1.png' }));
vi.mock('../src/console/assets/step2.png', () => ({ default: 'step2.png' }));
vi.mock('../src/console/assets/step3.png', () => ({ default: 'step3.png' }));
vi.mock('../src/console/assets/step4.png', () => ({ default: 'step4.png' }));

vi.mock('../src/console/core/components/InstructionBlock', () => ({
  default: ({
    title,
    description,
    link1,
    link1Text,
    link2,
    link2Text
  }: {
    title: string;
    description: string;
    link1?: string;
    link1Text?: string;
    link2?: string;
    link2Text?: string;
  }) => (
    <div data-testid="instruction-block">
      <h2>{title}</h2>
      <p>{description}</p>
      {link1 && <a href={link1}>{link1Text}</a>}
      {link2 && <a href={link2}>{link2Text}</a>}
    </div>
  )
}));

describe('HowToPage', () => {
  it('renders all instruction blocks', () => {
    render(<HowToPage />);
    const blocks = screen.getAllByTestId('instruction-block');
    expect(blocks).toHaveLength(4);
  });

  it('displays correct step titles', () => {
    render(<HowToPage />);

    expect(screen.getByText('Step 1 - Visit a remote site')).toBeInTheDocument();
    expect(screen.getByText('Step 2 - Generate a access token from the remote site')).toBeInTheDocument();
    expect(screen.getByText('Step 3 - Download the access token file')).toBeInTheDocument();
    expect(screen.getByText('Step 4 - Use the access token to create a link')).toBeInTheDocument();
  });

  it('displays step descriptions', () => {
    render(<HowToPage />);

    expect(screen.getByText('Open a new browser window or tab and visit the remote site.')).toBeInTheDocument();
    expect(screen.getByText('Generate the access token with the web console or the CLI.')).toBeInTheDocument();
    expect(
      screen.getByText('Download the access token file from the remote site after generating it.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Use the access token to create a link from the local site to the remote site.')
    ).toBeInTheDocument();
  });

  it('includes documentation links in step 2', () => {
    render(<HowToPage />);

    const cliLink = screen.getByText('More information CLI');
    const tokenLink = screen.getByText('More information on token creation');

    expect(cliLink).toHaveAttribute('href', 'https://skupper.io/docs/cli/index.html');
    expect(tokenLink).toHaveAttribute('href', 'https://skupper.io/docs/cli/tokens.html');
  });
});
