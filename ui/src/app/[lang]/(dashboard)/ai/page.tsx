import { ScheduleGemini } from "../schedule/components/schedule-gemini";
import AITable from "./components/ai-table";
import AISyncData from "./dispatch/ai-sync-data";

export default function AIPage() {
  return (
    <div className="px-6 space-y-10">
      <ScheduleGemini />
      <AITable />
      <AISyncData />
    </div>
  );
}
