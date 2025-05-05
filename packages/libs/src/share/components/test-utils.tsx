
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

const queryClient = new QueryClient();
interface QueryClientWrapperProps {
  children: ReactNode;
}

export const wrapper: React.FC<QueryClientWrapperProps> = ({
  children,
}) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
