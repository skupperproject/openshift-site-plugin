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

  it('calls the create mutation when the deploy button is clicked', () => {
    const mutateMock = vi.fn();
    mockUseK8sWatchResource.mockReturnValue([undefined, false, undefined]);
    mockUseMutationImpl.mockReturnValue({ ...defaultMutationMock, mutate: mutateMock });

    render(<DeploymentNetworkConsoleButton />);
    fireEvent.click(screen.getByText(BUTTON_LABELS.deploy));
    expect(mutateMock).toHaveBeenCalled();
  });
});
