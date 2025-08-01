"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useDeviceConfigStore } from "@/module/device/device.store";
import { DEVICE_LABELS } from "./schedule-labels";
import { Card, CardContent } from "@/components/ui/card";

export function ScheduleGemini() {
  const gemini = useDeviceConfigStore((s) => s.gemini);

  if (!gemini) return null;

  return (
    <div className="space-y-4 p-4 min-w-full">
      <Card className="bg-orange-50">
        <CardContent className="text-md min-w-full leading-relaxed p-4">
          <div className="min-w-full  text-black max-w-prose leading-relaxed mb-4">
            {gemini.note}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-orange-200">
                Hiển thị lịch thiết bị
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl text-orange-600">
                  Lịch hoạt động khuyến nghị
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {gemini.schedule.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge
                        variant="default"
                        className="bg-orange-200 text-dark text-base font-semibold"
                      >
                        {DEVICE_LABELS[item.device] || item.device}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({item.deviceId})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {item.times.map((t, i) => (
                        <div
                          key={i}
                          className="rounded-md bg-orange-50 px-3 py-1 text-base text-dark font-medium"
                        >
                          {t.start} → {t.end}
                        </div>
                      ))}
                    </div>

                    {idx < gemini.schedule.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
