import ScheduleAdd from "./components/schedule-add";
import ScheduleTable from "./components/schedule-table";
import { ScheduleUpdate } from "./components/schedule-update";
import ScheduleSyncData from "./dispatch/dispatch-schedule-sync-data";

export default function HydroponicsPage() {
  return (
    <div className="px-6 space-y-10">
      <div className="flex justify-end md:items-center gap-4 mb-2">
        <ScheduleAdd />
      </div>
      <ScheduleSyncData />
      <ScheduleTable />
      <ScheduleUpdate />
    </div>
  );
}
