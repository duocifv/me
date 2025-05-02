import { SiteHeader } from "@/components/site-header";
import { DataTableUsers } from "@/components/data-table-users";
import { UsersSummary } from "@/components/UsersSummary";

import data from "../data.json";

export default async function PageUsers() {
  return (
    <>
      <SiteHeader value="Users" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <UsersSummary />
            <DataTableUsers data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
