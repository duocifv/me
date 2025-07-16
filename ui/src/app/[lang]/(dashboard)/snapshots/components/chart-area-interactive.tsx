"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { $t } from "@/app/lang";
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
  waterTemp: {
    label: $t`Nhiệt độ nước (°C)`,
    color: "#0E7490", // màu xanh biển
  },
  ambientTemp: {
    label: $t`Nhiệt độ môi trường (°C)`,
    color: "#A21CAF", // màu tím
  },
  humidity: {
    label: $t`Độ ẩm (%)`,
    color: "#F59E0B", // màu vàng cam
  },
} satisfies ChartConfig;

export default function ChartAreaInteractive() {
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
    return snapshots.items
      .map((snap) => ({
        date: snap!.timestamp,
        waterTemp: snap!.waterTemp,
        ambientTemp: snap!.ambientTemp,
        humidity: snap!.humidity,
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
    day: $t`24 giờ qua`,
    week: $t`7 ngày qua`,
    month: $t`30 ngày qua`,
  } as const;

  return (
    <Card className="@container/card border-0">
      <CardHeader className="relative">
        <CardTitle>{$t`Biểu đồ nhiệt độ & độ ẩm`}</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            {$t`Dữ liệu `}
            {rangeLabel[timeRange]}
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
              {$t`24 giờ`}
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="h-8 px-2.5">
              {$t`7 ngày`}
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="h-8 px-2.5">
              {$t`30 ngày`}
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Select (mobile) */}
          <Select
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as "day" | "week" | "month")}
          >
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label={$t`Chọn khoảng thời gian`}
            >
              <SelectValue placeholder={$t`30 ngày`} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="day" className="rounded-lg">
                {$t`24 giờ`}
              </SelectItem>
              <SelectItem value="week" className="rounded-lg">
                {$t`7 ngày`}
              </SelectItem>
              <SelectItem value="month" className="rounded-lg">
                {$t`30 ngày`}
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
              <linearGradient id="fillWater" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.waterTemp.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.waterTemp.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              {/* Gradient cho Nhiệt độ môi trường */}
              <linearGradient id="fillAmbient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.ambientTemp.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.waterTemp.color}
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
              dataKey="waterTemp"
              type="monotone"
              fill="url(#fillWater)"
              stroke={chartConfig.waterTemp.color}
              name={chartConfig.waterTemp.label}
              stackId="1"
            />
            <Area
              dataKey="ambientTemp"
              type="monotone"
              fill="url(#fillAmbient)"
              stroke={chartConfig.ambientTemp.color}
              name={chartConfig.ambientTemp.label}
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
