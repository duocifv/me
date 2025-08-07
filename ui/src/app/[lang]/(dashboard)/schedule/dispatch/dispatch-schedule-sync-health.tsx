"use client";
import { useHealthQuery } from "@/module/schedule/device.hook";
import { CircleDot, CircleX } from "lucide-react";

export default function ScheduleSyncHealth() {
  const { isSuccess, data, error } = useHealthQuery();

  if (!isSuccess) {
    return (
      <div className="text-red-600 flex items-center gap-2 text-sm">
        <CircleX className="w-4 h-4" />
        Lỗi: {error?.message || "Không thể tải trạng thái thiết bị"}
      </div>
    );
  }

  return (
    <div
      className={`flex mt-4 items-center gap-2 text-sm font-medium ${
        data.on ? "text-green-600" : "text-red-600"
      }`}
    >
      Tình trạng thiết bị:
      {data.on ? (
        <CircleDot className="w-4 h-4" />
      ) : (
        <CircleX className="w-4 h-4" />
      )}
      {data.on ? "đang hoạt động" : "không hoạt động"}
    </div>
  );
}
