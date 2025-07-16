"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import {
  DeviceScheduleDto,
  DeviceScheduleSchema,
} from "@adapter/schedule/dto/device-schedule.dto";
import CreateScheduleSubmit from "../dispatch/dispatch-schedule-create";

const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ScheduleAdd() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-md">
          + Thêm lịch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm lịch thiết bị</DialogTitle>
        </DialogHeader>

        <FormWrapper<DeviceScheduleDto>
          schema={DeviceScheduleSchema}
          defaultValues={{
            pumpOn: false,
            fanOn: false,
            ledOn: false,
            startTime: "00:00",
            endTime: "00:00",
            repeatOn: [],
            isEnabled: true,
          }}
        >
          {(form) => {
            const repeatOn = form.watch("repeatOn") ?? [];

            const toggleDay = (day: number) => {
              const next = repeatOn.includes(day)
                ? repeatOn.filter((d) => d !== day)
                : [...repeatOn, day];
              form.setValue("repeatOn", next);
            };

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block text-sm font-medium">
                      Tên thiết bị
                    </Label>
                    <Input
                      type="text"
                      {...form.register("deviceId")}
                      defaultValue="device-001"
                    />
                  </div>
                </div>
                {/* Bơm / Quạt / Đèn */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Label className="flex items-center gap-2 text-sm">
                    <Switch {...form.register("pumpOn")} />
                    Bơm
                  </Label>
                  <Label className="flex items-center gap-2 text-sm">
                    <Switch {...form.register("fanOn")} />
                    Quạt
                  </Label>
                  <Label className="flex items-center gap-2 text-sm">
                    <Switch {...form.register("ledOn")} />
                    Đèn
                  </Label>
                </div>

                {/* Giờ bắt đầu / kết thúc */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block text-sm">Giờ bắt đầu</Label>
                    <Input type="time" {...form.register("startTime")} />
                    {form.formState.errors.startTime && (
                      <p className="text-red-500 mt-1 text-xs">
                        {form.formState.errors.startTime.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-1 block text-sm">Giờ kết thúc</Label>
                    <Input type="time" {...form.register("endTime")} />
                    {form.formState.errors.endTime && (
                      <p className="text-red-500 mt-1 text-xs">
                        {form.formState.errors.endTime.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lặp lại vào */}
                <div>
                  <Label className="block mb-2 text-sm">Lặp lại vào</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={
                          repeatOn.includes(index) ? "default" : "outline"
                        }
                        onClick={() => toggleDay(index)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                  {form.formState.errors.repeatOn && (
                    <p className="text-red-500 mt-2 text-sm">
                      {form.formState.errors.repeatOn.message}
                    </p>
                  )}
                </div>

                {/* Kích hoạt lịch */}
                <div className="flex items-center gap-2">
                  <Switch {...form.register("isEnabled")} />
                  <Label className="text-sm text-muted-foreground">
                    Kích hoạt lịch
                  </Label>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Huỷ</Button>
                  </DialogClose>
                  <CreateScheduleSubmit {...form} />
                </DialogFooter>
              </div>
            );
          }}
        </FormWrapper>
      </DialogContent>
    </Dialog>
  );
}
