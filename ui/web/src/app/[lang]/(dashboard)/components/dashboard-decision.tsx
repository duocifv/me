"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const data = {
  "⚡ Immediate Actions": {
    adjust_led: 74.28,
    adjust_light: 67.28,
    pump_duration: 9.57,
    turn_on_fan: false,
  },
  "🌱 Growth Stage Estimation": {
    confidence: 55.48,
    days_until_next: 14,
    estimated_days_to_harvest: 48,
    next_stage: "Phát triển thân lá",
    stage: "Ra lá mầm",
    timeline: [
      { current: false, label: "Nảy mầm", range: "0–7 ngày" },
      { current: true, label: "Ra lá mầm", range: "8–21 ngày" },
      { current: false, label: "Phát triển thân lá", range: "22–40 ngày" },
      { current: false, label: "Gần thu hoạch", range: "41–55 ngày" },
      { current: false, label: "Thu hoạch", range: "56–65 ngày" },
    ],
  },
  "📅 Auto Schedule": {
    led_intensity: 74.28,
    light_level: 67.28,
    watering_time: 9.57,
  },
  "📈 Health Evaluation": {
    health_score: 87.95,
  },
};

export default function DashboardDecision() {
  return (
    <div className="grid gap-6 p-6 mx-auto w-full">
      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Sức khỏe cây trồng</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={data["📈 Health Evaluation"].health_score}
            className="h-3"
          />
          <p className="mt-3 text-2xl font-bold text-green-600">
            {data["📈 Health Evaluation"].health_score.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Immediate Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Hành động ngay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            💡 Cường độ LED:{" "}
            <span className="font-medium text-yellow-600">
              {data["⚡ Immediate Actions"].adjust_led}%
            </span>
          </p>
          <p>
            🌞 Mức ánh sáng:{" "}
            <span className="font-medium text-yellow-500">
              {data["⚡ Immediate Actions"].adjust_light}%
            </span>
          </p>
          <p>
            💧 Thời gian bơm:{" "}
            <span className="font-medium text-blue-600">
              {data["⚡ Immediate Actions"].pump_duration} giây
            </span>
          </p>
          <div className="flex items-center space-x-2 pt-2">
            <Switch checked={data["⚡ Immediate Actions"].turn_on_fan} />
            <Label>Quạt</Label>
          </div>
        </CardContent>
      </Card>
      {/* Auto Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Lịch tưới & chiếu sáng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            💡 LED:{" "}
            <span className="font-medium text-yellow-600">
              {data["📅 Auto Schedule"].led_intensity}%
            </span>
          </p>
          <p>
            ☀️ Ánh sáng:{" "}
            <span className="font-medium text-yellow-500">
              {data["📅 Auto Schedule"].light_level}%
            </span>
          </p>
          <p>
            💧 Tưới:{" "}
            <span className="font-medium text-blue-600">
              {data["📅 Auto Schedule"].watering_time} giây
            </span>
          </p>
        </CardContent>
      </Card>
      {/* Growth Timeline */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>
            🌱 Giai đoạn:{" "}
            <span className="text-green-600 font-semibold">
              {data["🌱 Growth Stage Estimation"].stage}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
            {data["🌱 Growth Stage Estimation"].timeline.map((stage, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded border text-center text-muted-foreground",
                  stage.current
                    ? "bg-green-100 border-green-600 text-green-700 font-semibold"
                    : "bg-white border-gray-200"
                )}
              >
                <div>{stage.label}</div>
                <div className="text-xs">{stage.range}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            ⏭️ Tiếp theo:{" "}
            <span className="font-semibold text-green-600">
              {data["🌱 Growth Stage Estimation"].next_stage}
            </span>{" "}
            (sau {data["🌱 Growth Stage Estimation"].days_until_next} ngày)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
