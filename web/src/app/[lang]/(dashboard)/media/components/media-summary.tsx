"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Image as ImageIcon } from "lucide-react";
import { useMediaStore } from "@adapter/media/media.store";
import { bytes } from "@adapter/share/utils/bytes";
import { $t } from "@/app/lang";

interface StatItem {
  label: string;
  content: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  progress?: number;
}

export function MediaSummary() {
  const { stats } = useMediaStore((s) => s.data);

  const storageStats: StatItem[] = [
    {
      label: $t`Tổng số tệp`,
      content: `${stats.totalFile} ${$t`hình`}`,
      icon: ImageIcon,
    },
  ];

  if (stats.usedStorageBytes >= 0) {
    const percent = Math.round(
      (stats.usedStorageBytes / stats.maxStorageBytes) * 100
    );

    storageStats.push({
      label: $t`Dung lượng đã sử dụng`,
      content: `${bytes(stats.usedStorageBytes)} / ${bytes(
        stats.maxStorageBytes
      )}`,
      icon: HardDrive,
      progress: percent,
    });
  }

  return (
    <div className="relative px-4 gap-4 flex">
      {storageStats.map(({ label, content, icon: Icon, progress }) => (
        <Card
          key={label}
          className="pl-2 md:pl-2 w-1/2 md:w-1/4 border rounded-lg shadow-sm"
        >
          <CardHeader className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium text-gray-700">
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-2">{content}</p>
            {typeof progress === "number" && (
              <Progress value={progress} className="h-2 rounded-full" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
