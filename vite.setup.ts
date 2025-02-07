import '@testing-library/jest-dom';
import { ReactNode } from 'react';

import { vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClient: class {},
  QueryClientProvider: ({ children }: { children: ReactNode }) => children,
  useMutation: <TData, TError, TVariables>({
    mutationFn,
    onSuccess,
    onError
  }: {
    mutationFn: (data: TVariables) => Promise<TData>;
    onSuccess?: () => void;
    onError?: (error: TError) => void;
  }) => ({
    mutate: async (data: TVariables) => {
      try {
        await mutationFn(data);
        onSuccess?.();
      } catch (error) {
        onError?.(error as TError);
      }
    },
    isLoading: false
  }),
  useQueryClient: () => ({
    invalidateQueries: vi.fn()
  }),
  useQuery: () => ({
    data: undefined,
    isLoading: false
  })
}));
