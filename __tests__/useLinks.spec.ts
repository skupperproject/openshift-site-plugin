import { createElement } from 'react';

import { RESTApi } from '@API/REST.api';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AccessGrantCrdResponse } from '../src/console/interfaces/CRD_AccessGrant';
import { useLinks } from '../src/console/pages/tabs/Links/hooks/useLinks';

const mockUseWatchedSkupperResource = vi.hoisted(() => vi.fn());
const mockCreateObjectURL = vi.hoisted(() => vi.fn());

vi.mock('../src/console/hooks/useSkupperWatchResource', () => ({
  useWatchedSkupperResource: mockUseWatchedSkupperResource
}));

vi.mock('../src/console/API/REST.api');

function renderHookTest<TResult>(callback: () => TResult) {
  const values: { current: TResult } = { current: null! };

  const TestComponent = function () {
    values.current = callback();

    return null;
  };

  return {
    rerender: () => {
      act(() => {
        render(createElement(TestComponent));
      });
    },
    result: () => values.current
  };
}

describe('useLinks', () => {
  const mockData = {
    accessGrants: [
      {
        metadata: { name: 'test-grant' },
        status: { status: 'Ready', url: 'u', code: 'c', ca: 'ca', message: 'OK' }
      }
    ],
    accessTokens: [
      {
        name: 'test-token',
        status: { message: 'OK' }
      }
    ],
    links: [
      {
        name: 'test-link'
      }
    ],
    sites: [
      {
        remoteLinks: ['remote-site']
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatchedSkupperResource
      .mockReturnValueOnce({ data: mockData.accessGrants, loaded: true })
      .mockReturnValueOnce({ data: mockData.accessTokens, loaded: true })
      .mockReturnValueOnce({ data: mockData.links, loaded: true })
      .mockReturnValueOnce({ data: mockData.sites, loaded: true });

    global.URL.createObjectURL = mockCreateObjectURL;
    mockCreateObjectURL.mockReturnValue('mock-url');
  });

  it('returns data and loading state', () => {
    const { rerender, result } = renderHookTest(() => useLinks());
    rerender();

    expect(result().loading).toBe(false);
    expect(result().data.accessGrants).toEqual(mockData.accessGrants);
    expect(result().data.accessTokens).toEqual(mockData.accessTokens);
    expect(result().data.links).toEqual(mockData.links);
    expect(result().data.remoteLinks).toEqual([{ connectedTo: 'remote-site' }]);
  });

  it('handles delete link', async () => {
    vi.mocked(RESTApi.deleteLink).mockResolvedValue();
    vi.mocked(RESTApi.deleteAccessToken).mockResolvedValue();

    const { rerender, result } = renderHookTest(() => useLinks());
    rerender();

    await act(async () => {
      result().actions.handleDeleteLink('test-token');
    });

    expect(RESTApi.deleteAccessToken).toHaveBeenCalledWith('test-token');
    expect(RESTApi.deleteLink).toHaveBeenCalledWith('test-token');
  });

  it('handles download grant', () => {
    const mockLink = document.createElement('a');
    const mockClick = vi.fn();
    Object.defineProperty(mockLink, 'click', { value: mockClick });

    const mockCreateElement = vi.spyOn(document, 'createElement');
    const mockAppendChild = vi.spyOn(document.body, 'appendChild');
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild');

    mockCreateElement.mockReturnValue(mockLink);
    mockAppendChild.mockImplementation(() => mockLink);
    mockRemoveChild.mockImplementation(() => mockLink);

    const { rerender, result } = renderHookTest(() => useLinks());
    rerender();

    act(() => result().actions.handleDownloadGrant(mockData.accessGrants[0] as AccessGrantCrdResponse));

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('handles delete link with partial name match', async () => {
    mockUseWatchedSkupperResource
      .mockReturnValueOnce({ data: mockData.accessGrants, loaded: true })
      .mockReturnValueOnce({
        data: [{ name: 'partial-token' }],
        loaded: true
      })
      .mockReturnValueOnce({ data: mockData.links, loaded: true })
      .mockReturnValueOnce({ data: mockData.sites, loaded: true });

    vi.mocked(RESTApi.deleteLink).mockResolvedValue();
    vi.mocked(RESTApi.deleteAccessToken).mockResolvedValue();

    const { rerender, result } = renderHookTest(() => useLinks());
    rerender();

    await act(async () => {
      result().actions.handleDeleteLink('test-link-with-partial-token');
    });

    expect(RESTApi.deleteLink).toHaveBeenCalledWith('test-link-with-partial-token');
  });
});
