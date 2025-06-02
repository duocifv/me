"use client";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";
import { $t } from "@/app/lang";

export function SectionCards() {
  const [snapshots] = useHydroponicsStore((s) => s.snapshots);

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{$t`độ ẩm`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots?.sensorData?.humidity ?? 0} %
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tăng trong tháng <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Dữ liệu 6 tháng gần đây</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{$t`nhiệt độ môi trường`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots?.sensorData?.ambient_temperature ?? 0} °C
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDownIcon className="size-3" />
              -20%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Giảm trong kỳ <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Cần chú ý theo dõi</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{$t`nhiệt độ nước`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots?.sensorData?.water_temperature ?? 0} °C
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tăng ổn định <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Tình trạng tốt</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{$t`pH dung dịch`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots?.solutionData?.ph ?? 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground">
          Mức pH chuẩn cho cây trồng
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{$t`Độ dẫn điện (EC)`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots?.solutionData?.ec ?? 0} mS/cm
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground">
          Đánh giá chất lượng dung dịch dinh dưỡng
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{$t`ORP (oxi hóa khử)`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots?.solutionData?.orp ?? 0} mV
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground">
          Tình trạng oxy hóa khử của dung dịch
        </CardFooter>
      </Card>
    </div>
  );
}
