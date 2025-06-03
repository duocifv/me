import { SiteHeader } from "@/components/site-header";
import HydroponicsSyncData from "./(snapshots)/dispatch/dispatch-snapshots-sync-data";
import { SectionCards } from "./(snapshots)/components/section-cards";
import { ChartAreaInteractive } from "./(snapshots)/components/chart-area-interactive";
import SnapshotsList from "./(snapshots)/components/snapshot-list";
import DispatchSnapshotsDetail from "./(snapshots)/dispatch/dispatch-snapshots-detail";

export default function Page() {
  return (
    <div>
      <HydroponicsSyncData />
      <SiteHeader value="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <SnapshotsList />
            <DispatchSnapshotsDetail />
          </div>
        </div>
      </div>
    </div>
  );
}
