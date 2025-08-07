import { Button } from "@/components/ui/button";
import ScheduleAdd from "./components/schedule-add";
import ScheduleTable from "./components/schedule-table";
import { ScheduleUpdate } from "./components/schedule-update";
import ScheduleSyncData from "./dispatch/dispatch-schedule-sync-data";
import Link from "next/link";
import ScheduleSyncHealth from "./dispatch/dispatch-schedule-sync-health";

export default function HydroponicsPage() {
  return (
    <div className="px-6 space-y-10">
      <div className="flex justify-between md:items-end gap-4 mb-2">
        <div>
          <Button variant="outline">
            <Link href="/vi/ai">Lịch thông minh</Link>
          </Button>
          <ScheduleSyncHealth />
        </div>
        <ScheduleAdd />
      </div>
      <ScheduleSyncData />
      <ScheduleTable />
      <ScheduleUpdate />
    </div>
  );
}
