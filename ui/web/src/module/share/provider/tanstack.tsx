"use client";

import { ReactNode, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 phút
      gcTime: 1000 * 60 * 10, // 10 phút
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

// ✅ Component riêng cho fallback
function QueryErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  useEffect(() => {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("Đã xảy ra lỗi không xác định");
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="mb-4 text-red-600">
        Đã xảy ra lỗi:{" "}
        {error instanceof Error ? error.message : "Không xác định"}
      </p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={resetErrorBoundary}
      >
        Thử lại
      </button>
    </div>
  );
}

export default function Tanstack({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <QueryErrorFallback
                error={error}
                resetErrorBoundary={resetErrorBoundary}
              />
            )}
          >
            {children}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
