import dynamic from "next/dynamic";
import { Suspense } from "react";
import UsersSummary from "./components/users-summary";
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

export default async function PageUsers() {
  return (
    <Suspense>
      <UsersLoader />
      <UsersSummary />
      <DataTableUsers />
    </Suspense>
  );
}
