import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  UserCheck,
  UserLock,
  Settings,
  Code,
} from "lucide-react";
import { EditRoleDialog } from "./EditRoleDialog";

const roles = [
  {
    name: "Administrator",
    icon: Settings,
    color: "bg-indigo-100 text-indigo-600",
    userCount: 6,
    avatars: ["a1.png", "a2.png"],
  },
  {
    name: "Manager",
    icon: Users,
    color: "bg-yellow-100 text-yellow-600",
    userCount: 6,
    avatars: ["b1.png", "b2.png"],
  },
  {
    name: "Sales",
    icon: UserPlus,
    color: "bg-red-100 text-red-600",
    userCount: 6,
    avatars: ["c1.png", "c2.png"],
  },
  {
    name: "Support",
    icon: UserCheck,
    color: "bg-green-100 text-green-600",
    userCount: 6,
    avatars: ["d1.png", "d2.png"],
  },
  {
    name: "Developer",
    icon: Code,
    color: "bg-red-100 text-red-600",
    userCount: 6,
    avatars: ["e1.png", "e2.png"],
  },
  {
    name: "HR Department",
    icon: Settings,
    color: "bg-green-100 text-green-600",
    userCount: 6,
    avatars: ["f1.png", "f2.png"],
  },
  {
    name: "Restricted User",
    icon: UserLock,
    color: "bg-purple-100 text-purple-600",
    userCount: 6,
    avatars: ["g1.png", "g2.png"],
  },
  {
    name: "Customer",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    userCount: 6,
    avatars: ["h1.png", "h2.png"],
  },
];

export default function RolesAndPermissionsSummary() {
  return (
    <div className="space-y-6">
      {/* Header + add-role button */}
      <div className="flex justify-between items-center px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold">Roles and Permissions</h1>
          <p className="text-sm text-gray-500">
            Dashboard &gt; Role Management &amp; Permission
          </p>
        </div>
        <Button>+ Add New Role</Button>
      </div>

      {/* Carousel of role-cards */}
      <div className="relative px-4 lg:px-6">
        <Carousel>
          <CarouselContent className="flex -ml-4">
            {roles.map(({ name, icon: Icon, color, userCount, avatars }) => (
              <CarouselItem
                key={name}
                className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <Card className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex justify-between items-center">
                      <div className={`p-2 rounded ${color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        •••
                      </button>
                    </div>
                    <h2 className="text-lg font-medium">{name}</h2>
                    <div className="flex items-center space-x-2">
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
                    </div>
                    {/* EditRoleDialog replaces static button */}
                    <EditRoleDialog roleName={name} />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
