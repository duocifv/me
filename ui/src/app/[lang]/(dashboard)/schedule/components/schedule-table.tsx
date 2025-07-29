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
import { Pencil } from "lucide-react";
import { useDeviceScheduleStore } from "@adapter/schedule/device.store";
import { ScheduleButtonDelete } from "./schedule-delete";

const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ScheduleTable() {
  const schedules = useDeviceScheduleStore((s) => s.data);
  const updateItem = useDeviceScheduleStore((s) => s.updateItem);

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow className="bg-gray-100">
            <TableHead>Thiết bị</TableHead>
            <TableHead>Thời gian hoạt động</TableHead>
            <TableHead>Lặp lại</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {schedules.map((s) => (
            <TableRow
              key={s.id}
              className="hover:bg-accent/10 transition-colors"
            >
              <TableCell className="font-medium uppercase">
                {s.device}
              </TableCell>

              <TableCell className="text-sm">
                {s.times.map((t, i) => (
                  <div key={i}>
                    {t.start} – {t.end}
                  </div>
                ))}
              </TableCell>

              <TableCell>
                {s.repeatOn.length > 0 ? (
                  s.repeatOn.map((d) => (
                    <Badge key={d} variant="outline" className="mr-1 text-xs">
                      {weekdays[d]}
                    </Badge>
                  ))
                ) : (
                  <span className="italic text-muted-foreground text-xs">
                    Không lặp
                  </span>
                )}
              </TableCell>

              <TableCell className="text-center">
                <Switch checked={s.isEnabled} disabled />
              </TableCell>

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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
