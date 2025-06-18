import { SiteHeader } from "@/components/site-header";
import HydroponicsSyncData from "./snapshots/dispatch/dispatch-snapshots-sync-data";
import PlantTypeSyncData from "./plant-type/dispatch/dispatch-plant-type-sync-data";
import CropInstancesSyncData from "./hydroponics/dispatch/dispatch-crop-instances-sync-data";
import dynamic from "next/dynamic";
import AppLoading from "./components/app-loading";

const SectionCards = dynamic(
  () => import("./snapshots/components/section-cards"),
  {
    loading: () => <AppLoading />,
  }
);

const SnapsortCarousel = dynamic(
  () => import("./snapshots/components/snapshots-carousel"),
  {
    loading: () => <AppLoading />,
  }
);

const ChartAreaInteractive = dynamic(
  () => import("./snapshots/components/chart-area-interactive"),
  {
    loading: () => <AppLoading />,
  }
);

const CropInstanceList = dynamic(
  () => import("./plant-type/components/hydroponics-cropInstance-list"),
  {
    loading: () => <AppLoading />,
  }
);

const DashboardDecision = dynamic(
  () => import("./components/dashboard-decision"),
  {
    loading: () => <AppLoading />,
  }
);

export default function Page() {
  return (
    <div>
      <CropInstancesSyncData />
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
            <DashboardDecision />
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
