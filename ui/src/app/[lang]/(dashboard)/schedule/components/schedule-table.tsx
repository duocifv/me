"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Power } from "lucide-react";
import { useDeviceScheduleStore } from "@adapter/schedule/device.store";
import { ScheduleButtonDelete } from "./schedule-delete";
import { DEVICE_LABELS } from "./schedule-labels";
import {
  isDeviceRunning,
  isTimeSlotRunning,
} from "@/share/utils/device-running";

const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ScheduleTable() {
  const schedules = useDeviceScheduleStore((s) => s.data);
  const updateItem = useDeviceScheduleStore((s) => s.updateItem);

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow className="bg-gray-100">
            <TableHead>Thiết bị & Thời gian</TableHead>
            <TableHead>Lặp lại</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {schedules.map((s) => {
            const isRunning = isDeviceRunning(s.times);

            return (
              <TableRow
                key={s.id}
                className="hover:bg-accent/10 transition-colors"
              >
                {/* Thiết bị & Thời gian */}
                <TableCell>
                  <div className="border rounded p-2 bg-gray-50">
                    <div className="font-medium uppercase mb-1">
                      {DEVICE_LABELS[s.device] || s.device}
                      {isRunning ? (
                        <Power className="w-3 h-3 text-green-500 inline-block ml-2" />
                      ) : (
                        <Power className="w-3 h-3 text-gray-400 inline-block ml-2" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                      {s.times.map((t, i) => {
                        const isActive = isTimeSlotRunning(t);
                        return (
                          <span
                            key={i}
                            className={`px-2 py-1 border rounded shadow-sm ${
                              isActive ? "bg-amber-400" : "bg-white"
                            }`}
                          >
                            {t.start} – {t.end}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </TableCell>

                {/* Lặp lại */}
                <TableCell>
                  {s.repeatOn.length > 0 ? (
                    s.repeatOn.map((d) => (
                      <Badge key={d} variant="outline" className="mr-1 text-xs">
                        {weekdays[Number(d)]}
                      </Badge>
                    ))
                  ) : (
                    <span className="italic text-muted-foreground text-xs">
                      Không lặp
                    </span>
                  )}
                </TableCell>

                {/* Trạng thái */}
                <TableCell className="text-center">
                  <Switch checked={s.isEnabled} disabled />
                </TableCell>

                {/* Thao tác */}
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-primary"
                    onClick={() => updateItem(s)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <ScheduleButtonDelete id={s.id} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
