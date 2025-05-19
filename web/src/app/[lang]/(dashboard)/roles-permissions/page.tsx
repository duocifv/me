import dynamic from "next/dynamic";
import RolesAndPermissionsSummary from "./components/roles-permissions-summary";
import { Suspense } from "react";
import AppLoading from "../components/app-loading";

const UsersLoader = dynamic(() => import("../users/components/users-loader"), {
  loading: () => <AppLoading />,
});

const DataTableUsers = dynamic(
  () => import("../users/components/users-table"),
  {
    loading: () => <AppLoading />,
  }
);

export default async function PageRolesAndPermissions() {
  return (
    <Suspense>
      <UsersLoader />
      <RolesAndPermissionsSummary />
      <DataTableUsers />
    </Suspense>
  );
}
