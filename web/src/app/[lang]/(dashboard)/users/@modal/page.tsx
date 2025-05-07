import dynamic from "next/dynamic";
const UsersSummary = dynamic(
  () => import("../components/table-users/users-summary")
);
const DataTableUsers = dynamic(
  () => import("../components/table-users/users-table")
);

export default async function PageUsers() {
  return (
    <>
      <UsersSummary />
      <DataTableUsers />
    </>
  );
}
