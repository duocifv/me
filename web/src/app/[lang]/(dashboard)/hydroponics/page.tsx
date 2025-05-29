import HydroponicsList from "./components/hydroponics-table";
import HydroponicsSyncData from "./dispatch/dispatch-hydroponics-sync-data";

export default function HydroponicsPage() {
  return (
    <>
      <HydroponicsSyncData />
      <HydroponicsList />
    </>
  );
}
