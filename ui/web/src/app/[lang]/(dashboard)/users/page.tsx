import dynamic from "next/dynamic";
import { Suspense } from "react";
import UsersSummary from "./components/users-summary";
import AppLoading from "../components/app-loading";

const UsersSyncData = dynamic(
  () => import("./dispatch/dispatch-users-sync-data"),
  {
    loading: () => <AppLoading />,
  }
);
const DataTableUsers = dynamic(
  () => import("../users/components/users-table"),
  {
    loading: () => <AppLoading />,
  }
);

export default async function PageUsers() {
  return (
    <Suspense>
      <UsersSyncData />
      <UsersSummary />
      <DataTableUsers />
    </Suspense>
  );
}
