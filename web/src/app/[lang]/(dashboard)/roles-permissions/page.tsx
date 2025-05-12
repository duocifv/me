import dynamic from "next/dynamic";
import RolesAndPermissionsSummary from "./components/roles-permissions-summary";
import { Suspense } from "react";
import ErrorBoundary from "@/share/ErrorBoundary";
const DataTableUsers = dynamic(() => import("../users/components/users-table"));

export default async function PageRolesAndPermissions() {
  return (
    <Suspense>
      <ErrorBoundary>
        <RolesAndPermissionsSummary />
        <DataTableUsers />
      </ErrorBoundary>
    </Suspense>
  );
}
