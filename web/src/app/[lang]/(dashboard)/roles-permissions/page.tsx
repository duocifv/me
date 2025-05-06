import dynamic from "next/dynamic";
const RolesAndPermissionsSummary = dynamic(
  () => import("@/components/RolesAndPermissionsSummary")
);
const DataTableUsers = dynamic(
  () => import("@/components/table-users/data-table-users")
);

export default async function PageRolesAndPermissions() {
  return (
    <>
      <RolesAndPermissionsSummary />
      <DataTableUsers />
    </>
  );
}
