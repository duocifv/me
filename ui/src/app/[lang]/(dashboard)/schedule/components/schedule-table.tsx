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
import { Check, Pencil, X } from "lucide-react";
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
            <TableHead className="w-[120px]">Thiết bị</TableHead>
            <TableHead className="w-[150px]">Thời gian</TableHead>
            <TableHead className="text-center w-16">Máy bơm</TableHead>
            <TableHead className="text-center w-16">Quạt</TableHead>
            <TableHead className="text-center w-16">Đèn</TableHead>
            <TableHead>Lặp lại</TableHead>
            <TableHead className="text-center">Kích hoạt</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {schedules.map((s) => (
            <TableRow
              key={s.id}
              className="hover:bg-accent/10 transition-colors"
            >
              <TableCell className="font-medium">
                {s.deviceId ?? "---"}
              </TableCell>
              <TableCell className="font-medium">
                {s.startTime} – {s.endTime}
              </TableCell>

              <TableCell className="text-center">
                <DeviceIcon on={s.pumpOn} />
              </TableCell>

              <TableCell className="text-center">
                <DeviceIcon on={s.fanOn} />
              </TableCell>

              <TableCell className="text-center">
                <DeviceIcon on={s.ledOn} />
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
                {s.id && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-primary"
                      onClick={() => updateItem(s)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <ScheduleButtonDelete id={s.id} />
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DeviceIcon({ on }: { on: boolean }) {
  return (
    <div className="inline-flex">
      {on ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-red-500" />
      )}
    </div>
  );
}
