"use client";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeviceScheduleStore } from "@adapter/schedule/device.store";
import UpdateScheduleSubmit from "../dispatch/dispatch-schedule-update";
import {
  UpdateScheduleDto,
  UpdateScheduleSchema,
} from "@/module/schedule/dto/update-schedule.dto";
import { DEVICE_LABELS } from "./schedule-labels";

const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function ScheduleUpdate() {
  const item = useDeviceScheduleStore((s) => s.item);
  const updateItem = useDeviceScheduleStore((s) => s.updateItem);

  return (
    <Dialog open={!!item} onOpenChange={() => updateItem(null)}>
      <DialogContent className="max-w-md max-h-[70vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật lịch thiết bị</DialogTitle>
        </DialogHeader>

        {item && (
          <FormWrapper<UpdateScheduleDto>
            schema={UpdateScheduleSchema}
            defaultValues={{
              ...item,
              repeatOn: item.repeatOn?.map(Number),
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
                  {/* Thời gian */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block text-2xl font-black">
                        {DEVICE_LABELS[item.device] || item.device}
                      </Label>
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
                    <UpdateScheduleSubmit id={item.id} form={form} />
                  </DialogFooter>
                </div>
              );
            }}
          </FormWrapper>
        )}
      </DialogContent>
    </Dialog>
  );
}
