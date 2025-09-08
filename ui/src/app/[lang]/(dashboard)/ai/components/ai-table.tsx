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
import { DEVICE_LABELS } from "../../schedule/components/schedule-labels";
import { useAIStore } from "@/module/ai/ai.store";

export default function AITable() {
  const data = useAIStore((s) => s.data);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return {
          variant: "secondary" as const,
          className: "bg-green-500 text-white",
        };
      case "pending":
        return { variant: "outline" as const, className: "" };
      case "rejected":
        return { variant: "destructive" as const, className: "" };
      case "running":
        return {
          variant: "secondary" as const,
          className: "bg-blue-500 text-white",
        };
      default:
        return { variant: "default" as const, className: "" };
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow className="bg-gray-100">
            <TableHead>Thiết bị & Thời gian</TableHead>
            <TableHead>Điều kiện môi trường</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thưởng</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((record) => {
            const statusBadge = getStatusBadge(record.status);

            return (
              <TableRow
                key={record.id}
                className="hover:bg-accent/10 transition-colors"
              >
                {/* Thiết bị & Thời gian */}
                <TableCell>
                  <div className="space-y-2">
                    {record.schedule.map((s, idx) => (
                      <div key={idx} className="border rounded p-2 bg-gray-50">
                        <div className="font-medium uppercase">
                          {DEVICE_LABELS[s.device] || s.device}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-700">
                          {s.times.map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-white border rounded shadow-sm"
                            >
                              {t.start} – {t.end}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCell>

                {/* Điều kiện môi trường */}
                <TableCell className="text-xs text-muted-foreground">
                  <div>Nước: {record.inputEnv.waterTemperature}°C</div>
                  <div>Không khí: {record.inputEnv.ambientTemperature}°C</div>
                  <div>Độ ẩm: {record.inputEnv.humidity}%</div>
                </TableCell>

                {/* Trạng thái */}
                <TableCell>
                  <Badge
                    variant={statusBadge.variant}
                    className={statusBadge.className}
                  >
                    {record.status}
                  </Badge>
                </TableCell>

                {/* Thưởng */}
                <TableCell className="text-center">
                  {record.reward !== null ? `${record.reward} điểm` : "-"}
                </TableCell>

                {/* Đánh giá */}
                <TableCell className="text-xs text-muted-foreground">
                  {record.feedback || "Chưa có"}
                </TableCell>

                {/* Thao tác */}
                <TableCell className="text-right">
                  <Switch checked={record.status === "running"} disabled />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
