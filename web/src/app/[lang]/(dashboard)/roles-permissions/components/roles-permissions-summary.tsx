"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserPlus, Settings, LucideProps } from "lucide-react";
import { useRolesQuery } from "@adapter/roles/roles.hook";
import { ForwardRefExoticComponent } from "react";
import dynamic from "next/dynamic";
import AppLoading from "../../components/app-loading";

const EditRoleSheet = dynamic(() => import("./edit-role-sheet"), {
  loading: () => <AppLoading />,
});

type Role = {
  name: "ADMIN" | "CUSTOMER" | "MANAGER" | "GUEST";
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
  color: string;
  userCount: number;
};

const roles: Role[] = [
  {
    name: "ADMIN",
    icon: Settings,
    color: "bg-indigo-100 text-indigo-600",
    userCount: 6,
  },
  {
    name: "CUSTOMER",
    icon: UserPlus,
    color: "bg-red-100 text-red-600",
    userCount: 6,
  },
  {
    name: "MANAGER",
    icon: Settings,
    color: "bg-green-100 text-green-600",
    userCount: 6,
  },
  {
    name: "GUEST",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    userCount: 6,
  },
];

export default function RolesAndPermissionsSummary() {
  const { data = [], isSuccess } = useRolesQuery();
  return (
    isSuccess && (
      <div className="space-y-6">

        <div className="relative px-4 lg:px-6">
          <Carousel>
            <CarouselContent className="flex -ml-4">
              {data.map((role) => {
                const {
                  name = role.name,
                  icon: Icon = UserPlus,
                  color = "bg-gray-100 text-gray-600",
                } = roles.find((r) => r.name === role.name) ?? {};

                return (
                  <CarouselItem
                    key={role.id}
                    className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                  >
                    <Card className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex justify-between items-center">
                          <div className={`p-2 rounded ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <EditRoleSheet {...role} />
                        </div>
                        <h2 className="text-lg font-medium">{name}</h2>
                        {/* <div className="flex items-center space-x-2">
                        {avatars.slice(0, 4).map((a) => (
                          <img
                            key={a}
                            src={`/avatars/${a}`}
                            className="h-6 w-6 rounded-full ring-2 ring-white"
                          />
                        ))}
                        <span className="text-sm text-gray-500">
                          Total {userCount} users
                        </span>
                      </div> */}
                        {/* EditRoleDialog replaces static button */}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    )
  );
}
