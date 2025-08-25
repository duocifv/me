import { QueryClient } from '@tanstack/react-query'

// Centralized React Query client configuration (suitable for a small CMS fetching posts)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long query data is considered "fresh". During this time React Query won't refetch automatically.
      // Keep short so editors see recent changes but avoid excessive refetches.
      staleTime: 60 * 1000, // 60s

      // How long unused/inactive query data remains in cache before being garbage collected.
      cacheTime: 5 * 60 * 1000, // 5 minutes

      // Retry failed queries this many times (useful for transient network errors)
      retry: 1,

      // Exponential backoff for retries (ms)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30_000),

      // Do not refetch on every window focus by default (reduces noisy requests).
      // You can still force refetch after a mutation via invalidateQueries.
      refetchOnWindowFocus: true,

      // When reconnecting to the network, try to refetch (useful after offline)
      refetchOnReconnect: true,

      // Don't poll by default. If you need live updates, set refetchInterval per-query.
      refetchInterval: false,
      refetchIntervalInBackground: false,

      // Show errors in-place (instead of throwing to an error boundary) — adjust if you prefer error boundaries.
      useErrorBoundary: false,
    },

    mutations: {
      // For mutations, don't retry by default (you can enable per-mutation)
      retry: 0,

      // Global onError could be used for logging or toast notifications.
      // onError: (error, variables, context) => { console.error('Mutation error', error) },
      // You can also implement global onMutate/onSettled to help optimistic updates.
    },
  },
})
