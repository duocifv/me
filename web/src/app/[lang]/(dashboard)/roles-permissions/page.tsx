import dynamic from "next/dynamic";
const DataTableUsers = dynamic(
  () => import("../users/components/users-table")
);

export default async function PageRolesAndPermissions() {
  return (
    <>
      <DataTableUsers />
    </>
  );
}
