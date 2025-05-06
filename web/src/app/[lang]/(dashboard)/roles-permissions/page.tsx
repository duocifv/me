import { SiteHeader } from "@/components/site-header";
import { RolesAndPermissionsSummary } from "@/components/RolesAndPermissionsSummary";
import DataTableUsers from "@/components/table-users/data-table-users";

export default async function PageRolesAndPermissions() {
  return (
    <>
      <SiteHeader value="Roles and Permissions" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <RolesAndPermissionsSummary />
            <DataTableUsers />
          </div>
        </div>
      </div>
    </>
  );
}
