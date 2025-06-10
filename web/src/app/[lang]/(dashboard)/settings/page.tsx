"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cpu, Wifi, Clock, Camera } from "lucide-react";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import { Label } from "@/components/ui/label";
import { useDeviceConfigQuery } from "@adapter/device/device.hook.";
import CreateSettingsSubmit from "./dispatch/dispatch-settings-create";
import { $t } from "@/app/lang";
import {
  CreateDeviceConfigDto,
  CreateDeviceConfigSchema,
} from "@adapter/device/dto/create-device-config.dto";

const labelMap: Record<keyof CreateDeviceConfigDto, string> = {
  deviceId: $t`ID thiết bị`,
  host: $t`Địa chỉ máy chủ`,
  port: $t`Cổng kết nối`,
  wifiSsid: $t`Tên WiFi (SSID)`,
  wifiPassword: $t`Mật khẩu WiFi`,
  deepSleepIntervalUs: $t`Chu kỳ ngủ sâu (us)`,
  sensorInterval: $t`Chu kỳ cảm biến (giây)`,
  dataInterval: $t`Chu kỳ gửi dữ liệu (giây)`,
  imageInterval: $t`Chu kỳ gửi ảnh (giây)`,
  pumpCycleMs: $t`Chu kỳ bơm (ms)`,
  pumpOnMs: $t`Thời gian bật bơm (ms)`,
  pumpStartHour: $t`Giờ bắt đầu bơm`,
  pumpEndHour: $t`Giờ kết thúc bơm`,
  ledCycleMs: $t`Chu kỳ đèn LED (ms)`,
  ledOnMs: $t`Thời gian bật đèn LED (ms)`,
  ledStartHour: $t`Giờ bắt đầu đèn LED`,
  ledEndHour: $t`Giờ kết thúc đèn LED`,
  sensorEndpoint: $t`Endpoint cảm biến`,
  cameraEndpoint: $t`Endpoint camera`,
};

const groups: {
  icon: React.ReactNode;
  title: string;
  fields: (keyof CreateDeviceConfigDto)[];
}[] = [
  {
    icon: <Cpu className="w-5 h-5 text-blue-500" />,
    title: "Thông tin thiết bị",
    fields: ["deviceId", "host", "port"],
  },
  {
    icon: <Wifi className="w-5 h-5 text-green-500" />,
    title: "Kết nối WiFi",
    fields: ["wifiSsid", "wifiPassword"],
  },
  {
    icon: <Clock className="w-5 h-5 text-yellow-500" />,
    title: "Lịch trình hoạt động",
    fields: [
      "deepSleepIntervalUs",
      "sensorInterval",
      "dataInterval",
      "imageInterval",
      "pumpCycleMs",
      "pumpOnMs",
      "pumpStartHour",
      "pumpEndHour",
      "ledCycleMs",
      "ledOnMs",
      "ledStartHour",
      "ledEndHour",
    ],
  },
  {
    icon: <Camera className="w-5 h-5 text-purple-500" />,
    title: "Đầu cuối dữ liệu",
    fields: ["sensorEndpoint", "cameraEndpoint"],
  },
];

export default function SettingsPage() {
  const { data, isSuccess, isLoading } = useDeviceConfigQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  if (!isSuccess || !data) {
    return (
      <div className="text-center text-red-500">
        Không thể tải cấu hình thiết bị.
      </div>
    );
  }

  return (
    <div className="max-w-[860px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <FormWrapper<CreateDeviceConfigDto>
        schema={CreateDeviceConfigSchema}
        defaultValues={data}
      >
        {(form) => (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 ">
              {groups.map((group) => (
                <Card key={group.title} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {group.icon}
                      {group.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {group.fields.map((key) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-sm font-medium">
                            {labelMap[key]}
                          </Label>
                          <Input
                            id={key}
                            {...form.register(key, {
                              valueAsNumber: typeof data[key] === "number",
                            })}
                            defaultValue={data[key] ?? ""}
                            type={
                              typeof data[key] === "number" ? "number" : "text"
                            }
                          />
                          <div className="text-gray-600 text-sm">{key}</div>
                          {form.formState.errors[key] && (
                            <p className="text-red-500 mt-2 text-sm  leading-none">
                              {form.formState.errors[key].message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <CreateSettingsSubmit {...form} />
            </div>
          </>
        )}
      </FormWrapper>
    </div>
  );
}
