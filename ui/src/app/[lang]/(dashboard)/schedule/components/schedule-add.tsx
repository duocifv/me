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
import CreateScheduleSubmit from "../dispatch/dispatch-schedule-create";
import {
  ScheduleItemDto,
  ScheduleItemSchema,
} from "@/module/schedule/dto/device-schedule.dto";

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

        <FormWrapper<ScheduleItemDto>
          schema={ScheduleItemSchema}
          defaultValues={{
            device: "sensors",
            times: [
              {
                start: "08:00",
                end: "09:00",
              },
            ],
            repeatOn: [6],
            isEnabled: true,
          }}
        >
          {(form) => {
            const repeatOnRaw = form.watch("repeatOn") ?? [];
            const repeatOn = repeatOnRaw.map((d) => Number(d)) as number[];
            const toggleDay = (day: number) => {
              const next = repeatOn.includes(day)
                ? repeatOn.filter((d) => d !== day)
                : [...repeatOn, day];
              form.setValue("repeatOn", next);
            };

            const times = form.watch("times") ?? [];

            const addTime = () => {
              form.setValue("times", [...times, { start: "", end: "" }]);
            };

            const removeTime = (index: number) => {
              const updated = [...times];
              updated.splice(index, 1);
              form.setValue("times", updated);
            };

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block text-sm font-medium">
                      Tên thiết bị
                    </Label>
                    <select
                      {...form.register("device")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn thiết bị --</option>
                      <option value="pump">Máy bơm</option>
                      <option value="fanCool">Quạt tản nhiệt</option>
                      <option value="fanVent">Quạt thông gió</option>
                      <option value="led">Đèn LED</option>
                      <option value="sensors">Cảm biến</option>
                      <option value="camera">Camera</option>
                    </select>
                    {form.formState.errors && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.device?.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  {times.map((time, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="mb-1 block text-sm font-medium">
                          Giờ bắt đầu
                        </Label>
                        <Input
                          type="time"
                          {...form.register(`times.${i}.start`)}
                          placeholder="Start"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block text-sm font-medium">
                          Giờ kết thúc
                        </Label>
                        <Input
                          type="time"
                          {...form.register(`times.${i}.end`)}
                        />
                      </div>
                      <button onClick={() => removeTime(i)}>X</button>
                    </div>
                  ))}
                  <button type="button" onClick={addTime}>
                    + Add Time
                  </button>
                </div>

                {/* Ngày lặp lại */}
                <div>
                  <Label className="block mb-2 text-sm font-medium">
                    Lặp lại vào
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map((day, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={
                          repeatOn.includes(index) ? "default" : "outline"
                        }
                        onClick={() => toggleDay(index)}
                        className="rounded-full px-3"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                  {form.formState.errors.repeatOn && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.repeatOn.message}
                    </p>
                  )}
                </div>

                {/* Kích hoạt */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.watch("isEnabled")}
                    onCheckedChange={(v) => form.setValue("isEnabled", v)}
                  />
                  <Label className="text-sm text-muted-foreground">
                    Kích hoạt lịch
                  </Label>
                </div>

                {/* Footer */}
                <DialogFooter className="pt-4 flex justify-end gap-2">
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
