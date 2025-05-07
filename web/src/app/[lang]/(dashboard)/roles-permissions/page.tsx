import dynamic from "next/dynamic";
const DataTableUsers = dynamic(
  () => import("../users/components/table-users/users-table")
);

export default async function PageRolesAndPermissions() {
  return (
    <>
      <DataTableUsers />
    </>
  );
}
