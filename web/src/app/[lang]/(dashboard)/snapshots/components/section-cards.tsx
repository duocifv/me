"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { $t } from "@/app/lang";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

export function SectionCards() {
  const snapshots = useHydroponicsStore((s) => s.snapshots);

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6 ">
      <Card className="@container/card border-0 text-[#293d84]">
        <CardHeader className="relative">
          <CardDescription>{$t`độ ẩm`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots.items[0]?.humidity ?? 0} %
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs bg-[#7ac651] text-white"
            >
              <TrendingUpIcon className="size-3" />
              {$t`+12.5%`}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {$t`Tăng trong tháng`} <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {$t`Dữ liệu 6 tháng gần đây`}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card bg-[#fdfbcf] border-0 text-[#293d84]">
        <CardHeader className="relative">
          <CardDescription>{$t`nhiệt độ môi trường`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots.items[0]?.ambientTemp ?? 0} °C
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge
              variant="outline"
              className="flex gap-1 rounded-lg text-xs bg-[#e43eb5] text-white"
            >
              <TrendingDownIcon className="size-3" />
              {$t`-20%`}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {$t`Giảm trong kỳ`} <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{$t`Cần chú ý theo dõi`}</div>
        </CardFooter>
      </Card>

      <Card className="@container/card bg-[#fdfbcf] border-0 text-[#293d84]">
        <CardHeader className="relative">
          <CardDescription>{$t`nhiệt độ nước`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots.items[0]?.waterTemp ?? 0} °C
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {$t`+12.5%`}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {$t`Tăng ổn định`} <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">{$t`Tình trạng tốt`}</div>
        </CardFooter>
      </Card>

      <Card className="@container/card bg-[#fdfbcf] border-0 text-[#293d84]">
        <CardHeader className="relative">
          <CardDescription>{$t`pH dung dịch`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots.items[0]?.ph ?? 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground">
          {$t`Mức pH chuẩn cho cây trồng`}
        </CardFooter>
      </Card>

      <Card className="@container/card bg-[#fdfbcf] border-0 text-[#293d84]">
        <CardHeader className="relative">
          <CardDescription>{$t`Độ dẫn điện (EC)`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots.items[0]?.ec ?? 0} mS/cm
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground">
          {$t`Đánh giá chất lượng dung dịch dinh dưỡng`}
        </CardFooter>
      </Card>

      <Card className="@container/card bg-[#fdfbcf] border-0 text-[#293d84]">
        <CardHeader className="relative">
          <CardDescription>{$t`ORP (oxi hóa khử)`}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {snapshots.items[0]?.orp ?? 0} mV
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-muted-foreground">
          {$t`Tình trạng oxy hóa khử của dung dịch`}
        </CardFooter>
      </Card>
    </div>
  );
}
