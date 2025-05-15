import dynamic from "next/dynamic";
import { Suspense } from "react";
import { UsersLoader } from "./components/users-loader";
const UsersSummary = dynamic(() => import("./components/users-summary"));
const DataTableUsers = dynamic(() => import("./components/users-table"));

export default async function PageUsers() {
  return (
    <Suspense>
      <UsersLoader />;
      <UsersSummary />
      <DataTableUsers />
    </Suspense>
  );
}
