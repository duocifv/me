import { SiteHeader } from "@/components/site-header";
import HydroponicsSyncData from "./snapshots/dispatch/dispatch-snapshots-sync-data";
import { SectionCards } from "./snapshots/components/section-cards";
import { ChartAreaInteractive } from "./snapshots/components/chart-area-interactive";
import { SnapsortCarousel } from "./snapshots/components/snapshots-carousel";
import CropInstanceList from "./components/hydroponics-cropInstance-list";
import PlantTypeSyncData from "./plant-type/dispatch/dispatch-plant-type-sync-data";

export default function Page() {
  return (
    <div>
      <HydroponicsSyncData />
      <PlantTypeSyncData />
      <SiteHeader value="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <div>
              <CropInstanceList />
            </div>
            <div>
              <SnapsortCarousel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
