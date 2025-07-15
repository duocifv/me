import ScheduleAdd from "./components/schedule-add";
import ScheduleTable from "./components/schedule-table";
import { ScheduleUpdate } from "./components/schedule-update";
import ScheduleSyncData from "./dispatch/dispatch-schedule-sync-data";

export default function HydroponicsPage() {
  return (
    <div className="px-6 py-8 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          📋 Danh sách lịch thiết bị
        </h1>
        <ScheduleAdd />
      </div>
      <ScheduleSyncData />
      <ScheduleTable />
      <ScheduleUpdate />
    </div>
  );
}
