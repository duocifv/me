"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

// Cấu hình cho biểu đồ, đã bao gồm cả humidity
const chartConfig = {
  water_temperature: {
    label: "Nhiệt độ nước (°C)",
    color: "#0E7490", // màu xanh biển
  },
  ambient_temperature: {
    label: "Nhiệt độ môi trường (°C)",
    color: "#A21CAF", // màu tím
  },
  humidity: {
    label: "Độ ẩm (%)",
    color: "#F59E0B", // màu vàng cam
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  // Lấy mảng snapshots từ store
  const snapshots = useHydroponicsStore((s) => s.snapshots);

  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<"day" | "week" | "month">(
    "month"
  );

  // Nếu trên mobile, mặc định về “7 ngày”
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("week");
    }
  }, [isMobile]);

  // Chuyển mảng snapshots thành mảng dữ liệu cho Recharts
  const allData = React.useMemo(() => {
    return snapshots
      .filter((snap) => snap.sensorData !== null)
      .map((snap) => ({
        date: snap.timestamp,
        water_temperature: snap.sensorData!.water_temperature,
        ambient_temperature: snap.sensorData!.ambient_temperature,
        humidity: snap.sensorData!.humidity,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [snapshots]);

  // Lọc theo khoảng “ngày”, “tuần” hoặc “tháng”
  const filteredData = React.useMemo(() => {
    if (allData.length === 0) return [];

    const now = new Date();
    let daysToSubtract = 30;
    if (timeRange === "day") daysToSubtract = 1;
    else if (timeRange === "week") daysToSubtract = 7;
    else if (timeRange === "month") daysToSubtract = 30;

    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - daysToSubtract);

    return allData.filter((item) => {
      const d = new Date(item.date);
      return d >= cutoff;
    });
  }, [allData, timeRange]);

  // Nhãn hiển thị trong CardDescription
  const rangeLabel = {
    day: "24 giờ qua",
    week: "7 ngày qua",
    month: "30 ngày qua",
  } as const;

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Biểu đồ nhiệt độ & độ ẩm</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Dữ liệu {rangeLabel[timeRange]}
          </span>
          <span className="@[540px]/card:hidden">{rangeLabel[timeRange]}</span>
        </CardDescription>

        <div className="absolute right-4 top-4">
          {/* ToggleGroup (desktop) */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) =>
              v && setTimeRange(v as "day" | "week" | "month")
            }
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="day" className="h-8 px-2.5">
              24 giờ
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="h-8 px-2.5">
              7 ngày
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="h-8 px-2.5">
              30 ngày
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Select (mobile) */}
          <Select
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as "day" | "week" | "month")}
          >
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Chọn khoảng thời gian"
            >
              <SelectValue placeholder="30 ngày" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="day" className="rounded-lg">
                24 giờ
              </SelectItem>
              <SelectItem value="week" className="rounded-lg">
                7 ngày
              </SelectItem>
              <SelectItem value="month" className="rounded-lg">
                30 ngày
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {/* Gradient cho Nhiệt độ nước */}
              <linearGradient id="fillWater" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.water_temperature.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.water_temperature.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              {/* Gradient cho Nhiệt độ môi trường */}
              <linearGradient id="fillAmbient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.ambient_temperature.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.ambient_temperature.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              {/* Gradient cho Độ ẩm */}
              <linearGradient id="fillHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.humidity.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.humidity.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value) => {
                const d = new Date(value);
                // Nếu chỉ hiển thị trong 24h, có thể format giờ:phút, ngược lại chỉ ngày/tháng
                if (timeRange === "day") {
                  return d.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
                return d.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const d = new Date(value);
                    return d.toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            {/* Vẽ các miền (Area) */}
            <Area
              dataKey="water_temperature"
              type="monotone"
              fill="url(#fillWater)"
              stroke={chartConfig.water_temperature.color}
              name={chartConfig.water_temperature.label}
              stackId="1"
            />
            <Area
              dataKey="ambient_temperature"
              type="monotone"
              fill="url(#fillAmbient)"
              stroke={chartConfig.ambient_temperature.color}
              name={chartConfig.ambient_temperature.label}
              stackId="1"
            />
            <Area
              dataKey="humidity"
              type="monotone"
              fill="url(#fillHumidity)"
              stroke={chartConfig.humidity.color}
              name={chartConfig.humidity.label}
              stackId="1"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
