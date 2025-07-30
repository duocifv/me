"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import { Label } from "@/components/ui/label";
import { $t } from "@/app/lang";

// Khai báo type
type DeviceName = "pumpOn" | "fanOn" | "ledOn" | "sensor" | "camera";

type DeviceState = {
  [key in DeviceName]: boolean;
};

type DeviceConfigMap = {
  [deviceId: string]: DeviceState;
};

import {
  DeviceControlDto,
  DeviceControlSchema,
} from "@/module/device/dto/device-control.dto";
import { useDeviceScheduleQuery } from "@/module/schedule/device.hook";

const labelMap: Record<DeviceName, string> = {
  pumpOn: $t`Bơm`,
  fanOn: $t`Quạt`,
  ledOn: $t`Đèn LED`,
  sensor: $t`Cảm biến`,
  camera: $t`Camera`,
};

export default function SettingsPage() {
  const { data, isSuccess } = useDeviceScheduleQuery();
  if (!isSuccess || !data) return;
  const response: DeviceConfigMap = {
    "device-001": {
      pumpOn: true,
      fanOn: true,
      ledOn: false,
      sensor: true,
      camera: false,
    },
  };

  const deviceId = Object.keys(response)[0];
  const states = response[deviceId];

  const defaultValues: DeviceControlDto = {
    deviceId,
    ...states,
  };

  return (
    <div className="max-w-[800px] mx-auto w-full px-4 py-6">
      <FormWrapper<DeviceControlDto>
        schema={DeviceControlSchema}
        defaultValues={defaultValues}
      >
        {(form) => (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="w-5 h-5 text-blue-500" />
                Cấu hình thiết bị ({deviceId})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.keys(labelMap) as DeviceName[]).map((key) => {
                  const matchedDevice = data.find((s) => s.device === key);
                  const isEnabled = matchedDevice?.isEnabled ?? false;

                  return (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={key}>{labelMap[key]}</Label>
                      <Checkbox id={key} defaultChecked={isEnabled} />
                      <div className="text-sm text-muted-foreground">
                        Trạng thái lịch:{" "}
                        <strong>{form.watch(key) ? "Bật" : "Tắt"}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* <div className="mt-6 text-center">
                <CreateSettingsSubmit {...form} />
              </div> */}
            </CardContent>
          </Card>
        )}
      </FormWrapper>
    </div>
  );
}
