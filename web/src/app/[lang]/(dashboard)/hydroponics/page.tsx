import HydroponicsList from "./components/hydroponics-table";
import HydroponicsSyncData from "../(snapshots)/dispatch/dispatch-snapshots-sync-data";

export default function HydroponicsPage() {
  return (
    <>
      <HydroponicsSyncData />
      <HydroponicsList />
    </>
  );
}
