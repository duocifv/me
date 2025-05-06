import dynamic from "next/dynamic";
const UsersSummary = dynamic(() => import("@/components/UsersSummary"));
const DataTableUsers = dynamic(
  () => import("@/components/table-users/data-table-users")
);

export default async function PageUsers() {
  return (
    <>
      <UsersSummary />
      <DataTableUsers />
    </>
  );
}
