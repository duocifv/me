import SnapshotsList from "./components/snapshot-list";
import DispatchSnapshotsDetail from "./dispatch/dispatch-snapshots-detail";
import HydroponicsSyncData from "./dispatch/dispatch-snapshots-sync-data";

export default function SnapshotsPage() {
  return (
    <>
      <HydroponicsSyncData />
      <SnapshotsList />
      <DispatchSnapshotsDetail />
    </>
  );
}
