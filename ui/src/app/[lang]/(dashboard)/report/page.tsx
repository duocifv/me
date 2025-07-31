"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeviceErrorQuery } from "@adapter/device/device.hook.";
import { toast } from "sonner";
import { format } from "date-fns";
import { XCircle } from "lucide-react";

export default function DeviceErrorPage() {
  const { data = [], isSuccess, isLoading } = useDeviceErrorQuery();

  if (isLoading) {
    return <div className="text-center py-8 text-sm">Đang tải...</div>;
  }

  if (!isSuccess) {
    toast.error("Mất kết nối", {
      duration: 5000,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
    });
    return null;
  }

  return (
    <div className="max-w-[1080px] w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <ScrollArea className="h-[500px] sm:h-[540px] rounded-md border">
        <div className="p-2 sm:p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Message</TableHead>
                <TableHead className="text-xs sm:text-sm">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((err, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-xs sm:text-sm">
                    {err.message}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {format(new Date(err.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    </div>
  );
}
