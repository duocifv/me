import dynamic from "next/dynamic";
import SnapshotsList from "./components/snapshot-list";
import HydroponicsSyncData from "./dispatch/dispatch-snapshots-sync-data";
import AppLoading from "../components/app-loading";

const DispatchSnapshotsDetail = dynamic(
  () => import("./dispatch/dispatch-snapshots-detail"),
  {
    loading: () => <AppLoading />,
  }
);

export default function SnapshotsPage() {
  return (
    <>
      <HydroponicsSyncData />
      <SnapshotsList />
      <DispatchSnapshotsDetail />
    </>
  );
}
