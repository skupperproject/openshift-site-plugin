import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import DeploymentNetworkConsoleButton from '../src/console/pages/components/DeploymentNetworkConsoleButton';

const mockUseK8sWatchResource = vi.hoisted(() => vi.fn());
const mockUseMutationImpl = vi.hoisted(() => vi.fn());
const mockRESTApiCreateDeployment = vi.hoisted(() => vi.fn());
const mockRESTApiDeleteDeployment = vi.hoisted(() => vi.fn());
const mockNamespaceManagerGetNamespace = vi.hoisted(() => vi.fn());

vi.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: mockUseK8sWatchResource
}));

vi.mock('../src/console/API/REST.api', () => ({
  RESTApi: {
    createDeployment: mockRESTApiCreateDeployment,
    deleteDeployment: mockRESTApiDeleteDeployment
  }
}));

vi.mock('../src/console/config/db', () => ({
  NamespaceManager: {
    getNamespace: mockNamespaceManagerGetNamespace
  }
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: mockUseMutationImpl
}));

const defaultMutationMock = {
  mutate: vi.fn(),
  isLoading: false,
  isError: false,
  error: null
};

type ResourceOptions = { name?: string; selector?: { matchLabels?: Record<string, string> } };

const loadedResourceMock = (resourceName: string) => (options: ResourceOptions) => {
  if (options.name === resourceName) {
    return [{ spec: { host: 'example.com', port: { targetPort: '8080' } } }, false, undefined];
  }
  if (options.selector?.matchLabels?.['app.kubernetes.io/name'] === 'network-observer') {
    return [{ status: { phase: 'Running' } }, false, undefined];
  }

  return [undefined, false, undefined];
};

const BUTTON_LABELS = {
  deploy: 'Deploy the Network Console',
  open: 'Open the Network Console',
  delete: 'Delete the Network Console'
};

const setupMocks = (namespace = 'test-namespace') => {
  vi.clearAllMocks();
  mockNamespaceManagerGetNamespace.mockReturnValue(namespace);
};

describe('DeploymentNetworkConsoleButton', () => {
  beforeEach(() => setupMocks());

  it('renders the deploy button when not loaded', () => {
    mockUseK8sWatchResource.mockReturnValue([undefined, false, undefined]);
    mockUseMutationImpl.mockReturnValue(defaultMutationMock);

    render(<DeploymentNetworkConsoleButton />);
    expect(screen.getByText(BUTTON_LABELS.deploy)).toBeInTheDocument();
  });

  it('renders the open and delete buttons when loaded', () => {
    mockUseK8sWatchResource.mockImplementation(loadedResourceMock('network-observer'));
    mockUseMutationImpl.mockReturnValue(defaultMutationMock);

    render(<DeploymentNetworkConsoleButton />);
    expect(screen.getByText(BUTTON_LABELS.open)).toBeInTheDocument();
    expect(screen.getByText(BUTTON_LABELS.delete)).toBeInTheDocument();
  });

  it('calls the create mutation when the deploy button is clicked', () => {
    const mutateMock = vi.fn();
    mockUseK8sWatchResource.mockReturnValue([undefined, false, undefined]);
    mockUseMutationImpl.mockReturnValue({ ...defaultMutationMock, mutate: mutateMock });

    render(<DeploymentNetworkConsoleButton />);
    fireEvent.click(screen.getByText(BUTTON_LABELS.deploy));
    expect(mutateMock).toHaveBeenCalled();
  });

  it('calls the delete mutation when the delete button is clicked and calls onSuccess', () => {
    const mutateMock = vi.fn();
    let onSuccessCallback: (() => void) | undefined;

    mockUseK8sWatchResource.mockImplementation(loadedResourceMock('network-observer'));
    mockUseMutationImpl.mockImplementation(({ onSuccess }) => {
      onSuccessCallback = onSuccess;

      return { ...defaultMutationMock, mutate: mutateMock };
    });

    render(<DeploymentNetworkConsoleButton />);
    fireEvent.click(screen.getByText(BUTTON_LABELS.delete));
    expect(mutateMock).toHaveBeenCalled();

    onSuccessCallback?.();
  });

  it('updates URL when route data changes', () => {
    mockUseK8sWatchResource.mockImplementation(loadedResourceMock('network-observer'));
    mockUseMutationImpl.mockReturnValue(defaultMutationMock);

    render(<DeploymentNetworkConsoleButton />);
    expect(screen.getByText(BUTTON_LABELS.open)).toBeInTheDocument();
  });
});
