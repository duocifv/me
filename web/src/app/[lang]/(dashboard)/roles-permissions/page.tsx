import dynamic from "next/dynamic";
import RolesAndPermissionsSummary from "./components/roles-permissions-summary";
import { Suspense } from "react";
import { UsersLoader } from "../users/components/users-loader";
const DataTableUsers = dynamic(() => import("../users/components/users-table"));

export default async function PageRolesAndPermissions() {
  return (
    <Suspense>
      <UsersLoader />
      <RolesAndPermissionsSummary />
      <DataTableUsers />
    </Suspense>
  );
}
