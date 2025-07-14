"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Cpu, Clock, Camera } from "lucide-react";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import { Label } from "@/components/ui/label";
import CreateSettingsSubmit from "./dispatch/dispatch-settings-create";
import { $t } from "@/app/lang";
import { Checkbox } from "@/components/ui/checkbox";
import { useDeviceConfigQuery } from "@adapter/device/device.hook.";
import {
  CreateDeviceConfigDto,
  CreateDeviceConfigSchema,
} from "@adapter/device/dto/create-device-config.dto";

// Mapping nhãn theo API flat fields
const labelMap: Record<keyof CreateDeviceConfigDto, string> = {
  deviceId: $t`ID thiết bị`,
  version: $t`Phiên bản`,
  host: $t`Địa chỉ máy chủ`,
  port: $t`Cổng kết nối`,
  sensorEndpoint: $t`Endpoint cảm biến`,
  cameraEndpoint: $t`Endpoint camera`,
  dataInterval: $t`Chu kỳ gửi dữ liệu (ms)`,
  imageInterval: $t`Chu kỳ gửi ảnh (ms)`,
  pumpOn: $t`Bật máy bơm`,
  ledOn: $t`Bật đèn LED`,
  fanOn: $t`Bật quạt`,
  createdAt: $t`Tạo lúc`,
  updatedAt: $t`Cập nhật lúc`,
};

// Nhóm trường cho giao diện
const groups: {
  icon: React.ReactNode;
  title: string;
  fields: (keyof CreateDeviceConfigDto)[];
}[] = [
  {
    icon: <Cpu className="w-5 h-5 text-blue-500" />,
    title: "Thông tin cơ bản",
    fields: ["deviceId", "version", "createdAt", "updatedAt"],
  },
  {
    icon: <Cpu className="w-5 h-5 text-blue-500" />,
    title: "Server",
    fields: ["host", "port"],
  },
  {
    icon: <Camera className="w-5 h-5 text-purple-500" />,
    title: "Endpoints",
    fields: ["sensorEndpoint", "cameraEndpoint"],
  },
  {
    icon: <Clock className="w-5 h-5 text-yellow-500" />,
    title: "Intervals",
    fields: ["dataInterval", "imageInterval"],
  },
  {
    icon: <Cpu className="w-5 h-5 text-rose-500" />,
    title: "Devices",
    fields: ["pumpOn", "ledOn", "fanOn"],
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
    <div className="max-w-[1080px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <FormWrapper<CreateDeviceConfigDto>
        schema={CreateDeviceConfigSchema}
        defaultValues={data}
      >
        {(form) => (
          <>
            <div className="grid grid-cols-1 gap-8">
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
                      {group.fields.map((key) => {
                        const value = data[key];
                        const isBoolean = typeof value === "boolean";

                        return (
                          <div key={key} className="space-y-1">
                            <Label
                              htmlFor={key}
                              className="text-sm font-medium"
                            >
                              {labelMap[key]}
                            </Label>

                            {isBoolean ? (
                              <Checkbox
                                id={key}
                                checked={!!form.watch(key)}
                                onCheckedChange={(val) =>
                                  form.setValue(key, val === true)
                                }
                              />
                            ) : (
                              <Input
                                id={key}
                                type={
                                  typeof value === "number" ? "number" : "text"
                                }
                                defaultValue={value?.toString() ?? ""}
                                {...form.register(key, {
                                  valueAsNumber: typeof value === "number",
                                })}
                              />
                            )}

                            {form.formState.errors[key] && (
                              <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors[key]?.message}
                              </p>
                            )}
                          </div>
                        );
                      })}
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
