import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';

import DeleteSiteButton from '../src/console/pages/components/DeleteSiteButton';

const mockDeleteSite = vi.hoisted(() => vi.fn());

vi.mock('../src/console/API/REST.api', () => ({
  RESTApi: {
    deleteSite: mockDeleteSite
  }
}));

describe('DeleteSiteButton', () => {
  const siteId = 'test-site';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete button', () => {
    render(<DeleteSiteButton id={siteId} />);
    expect(screen.getByText('Delete site')).toBeInTheDocument();
  });

  it('opens modal when delete button is clicked', () => {
    render(<DeleteSiteButton id={siteId} />);

    fireEvent.click(screen.getByText('Delete site'));
    expect(screen.getByText('Permanently remove the site')).toBeInTheDocument();
  });

  it('closes modal when Cancel is clicked', () => {
    render(<DeleteSiteButton id={siteId} />);

    // Open modal
    fireEvent.click(screen.getByText('Delete site'));

    // Find and click Cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Permanently remove the site')).not.toBeInTheDocument();
  });

  it('calls delete API with removeAllResources true by default', () => {
    render(<DeleteSiteButton id={siteId} />);

    // Open modal and confirm
    fireEvent.click(screen.getByText('Delete site'));
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(mockDeleteSite).toHaveBeenCalledWith(siteId, true);
  });

  it('toggles removeAllResources checkbox', async () => {
    render(<DeleteSiteButton id={siteId} />);

    fireEvent.click(screen.getByText('Delete site'));

    const checkbox = screen.getByLabelText('Remove all resources associated with this site');
    expect(checkbox).toBeChecked();

    fireEvent.click(screen.getByText('Remove all resources associated with this site'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);
    expect(mockDeleteSite).toHaveBeenCalledWith(siteId, false);
  });

  it('initializes checkbox as checked', () => {
    render(<DeleteSiteButton id={siteId} />);

    fireEvent.click(screen.getByText('Delete site'));

    const checkbox = screen.getByLabelText('Remove all resources associated with this site');
    expect(checkbox).toHaveProperty('checked', true);
  });

  it('keeps modal open after failed deletion', async () => {
    mockDeleteSite.mockRejectedValueOnce(new Error('Delete failed'));

    render(<DeleteSiteButton id={siteId} />);

    fireEvent.click(screen.getByText('Delete site'));
    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(screen.getByText('Permanently remove the site')).toBeInTheDocument();
  });
});
