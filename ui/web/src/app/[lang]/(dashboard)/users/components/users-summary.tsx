"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, UserCheck, UserLock } from "lucide-react";
import { useUsersStore } from "@adapter/users/users.store";

export default function UsersSummary() {
  const { stats } = useUsersStore((s) => s.data);
  const metrics = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      changeType: "increase",
      subtitle: "Tổng người dùng",
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "New Users",
      value: stats.newUsers,
      changeType: "increase",
      subtitle: "Người dùng mới",
      icon: UserPlus,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      changeType: "decrease",
      subtitle: "Đang hoạt động",
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Conversion Rate",
      value: stats.conversionRate + "%",
      changeType: "increase",
      subtitle: "Tỷ lệ chuyển đổi",
      icon: UserLock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];
  return (
    <div className="relative px-4">
      <Carousel>
        <CarouselContent className="flex -ml-4">
          {metrics.map(
            ({
              title,
              value,
              changeType,
              subtitle,
              icon: Icon,
              iconBg,
              iconColor,
            }) => (
              <CarouselItem
                key={title}
                className="pl-4 md:pl-6 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Card className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150">
                  <CardContent className="flex justify-between items-start p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {title}
                      </p>
                      <div className="mt-1 flex items-baseline space-x-2">
                        <span
                          className={`text-2xl font-semibold ${
                            changeType === "increase"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
                    </div>
                    <div className={`p-2 rounded-md ${iconBg}`}>
                      <Icon className={`${iconColor} h-5 w-5`} />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            )
          )}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow">
          ‹
        </CarouselPrevious>
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow">
          ›
        </CarouselNext>
      </Carousel>
    </div>
  );
}
