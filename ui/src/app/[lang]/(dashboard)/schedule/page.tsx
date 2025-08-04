import ScheduleAdd from "./components/schedule-add";
import { ScheduleGemini } from "./components/schedule-gemini";
import ScheduleTable from "./components/schedule-table";
import { ScheduleUpdate } from "./components/schedule-update";
import ScheduleSyncData from "./dispatch/dispatch-schedule-sync-data";

export default function HydroponicsPage() {
  return (
    <div className="px-6 space-y-10">
      <div className="flex flex-col justify-between md:items-end gap-4 mb-2">
        <ScheduleGemini />
        <ScheduleAdd />
      </div>
      <ScheduleSyncData />
      <ScheduleTable />
      <ScheduleUpdate />
    </div>
  );
}
