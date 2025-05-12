import ErrorBoundary from "@/share/ErrorBoundary";
import dynamic from "next/dynamic";
import { Suspense } from "react";
const UsersSummary = dynamic(() => import("./components/users-summary"));
const DataTableUsers = dynamic(() => import("./components/users-table"));

export default async function PageUsers() {
  return (
    <Suspense>
      <ErrorBoundary>
        <UsersSummary />
        <DataTableUsers />
      </ErrorBoundary>
    </Suspense>
  );
}
