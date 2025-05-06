import DataTableUsers from "@/components/table-users/data-table-users";
import { UsersSummary } from "@/components/UsersSummary";

export default async function PageUsers() {
  return (
    <>
      <UsersSummary />
      <DataTableUsers />
    </>
  );
}
