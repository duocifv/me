"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  ClipboardListIcon,
  DatabaseIcon,
  DiscAlbum,
  FileIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MailCheck,
  RollerCoaster,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import { $t } from "@/app/lang";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: $t`Bảng điều khiển`,
      url: "/vi/",
      icon: LayoutDashboardIcon,
    },
    {
      title: $t`Thư viện phương tiện`,
      url: "/vi/media/",
      icon: DiscAlbum,
    },
    {
      title: $t`Vai trò và quyền`,
      url: "/vi/roles-permissions/",
      icon: RollerCoaster,
    },
    {
      title: $t`Hộp thư`,
      url: "/vi/inbox",
      icon: MailCheck,
    },
    {
      title: $t`Người dùng`,
      url: "/vi/users",
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: $t`Cài đặt`,
      url: "/vi/settings",
      icon: SettingsIcon,
    },
    {
      title: $t`Trợ giúp`,
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: $t`Tìm kiếm`,
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: $t`Loại cây`,
      url: "/vi/plant-type/",
      icon: DatabaseIcon,
    },
    {
      name: $t`Báo cáo`,
      url: "/vi/report/",
      icon: ClipboardListIcon,
    },
    {
      name: $t`Ảnh chụp`,
      url: "/vi/snapshots/",
      icon: FileIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Duocnv</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
