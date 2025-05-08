import dynamic from "next/dynamic";
const UsersSummary = dynamic(() => import("./components/users-summary"));
const DataTableUsers = dynamic(() => import("./components/users-table"));

export default async function PageUsers() {
  return (
    <>
      <UsersSummary />
      <DataTableUsers />
    </>
  );
}
