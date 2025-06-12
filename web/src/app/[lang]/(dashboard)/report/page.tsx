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
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useDeviceErrorQuery } from "@adapter/device/device.hook.";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

export default function DeviceErrorPage() {
  const { data = [], isSuccess, isLoading } = useDeviceErrorQuery();
  if (isLoading) {
    return <div>.... Đang tải</div>;
  }
  if (!isSuccess) {
    toast.error("Mất kết nối", {
      duration: 5000,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
    });
    return;
  }
  return (
    <div className="max-w-[1080px] w-full mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Device Error Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[540px] rounded-md border">
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Error Code</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{err.id}</TableCell>
                      <TableCell>{err.deviceId}</TableCell>
                      <TableCell>{err.errorCode}</TableCell>
                      <TableCell>{err.errorMessage}</TableCell>
                      <TableCell>
                        {format(new Date(err.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    </div>
  );
}
