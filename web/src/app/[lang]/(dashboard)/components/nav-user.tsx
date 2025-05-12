"use client";

import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@adapter/auth/auth.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logout from "../../(auth)/components/logout";

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = useAuthStore((s) => s.user);

  const userName = {
    name: "duocnv",
    email: user?.email || "",
    avatar: "/avatars/shadcn.jpg",
  };

  const handleLogout = () => {
    alert("Logging out...");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={userName.avatar} alt={userName.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {userName.email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userName.avatar} alt={userName.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userName.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md">
                    <UserCircleIcon className="mr-2 h-4 w-4" />
                    Account
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when
                      you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Tabs defaultValue="account" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                      </TabsList>
                      <TabsContent value="account">
                        <Card>
                          <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                              Make changes to your account here. Click save when
                              you&apos;re done.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="space-y-1">
                              <Label htmlFor="name">Name</Label>
                              <Input id="name" defaultValue="Pedro Duarte" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="username">Username</Label>
                              <Input id="username" defaultValue="@peduarte" />
                            </div>
                          </CardContent>
                          <CardFooter className="ml-auto">
                            <Button>Save changes</Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                      <TabsContent value="password">
                        <Card>
                          <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                              Change your password here. After saving,
                              you&apos;ll be logged out.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="space-y-1">
                              <Label htmlFor="current">Current password</Label>
                              <Input id="current" type="password" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="new">New password</Label>
                              <Input id="new" type="password" />
                            </div>
                          </CardContent>
                          <CardFooter className="ml-auto">
                            <Button>Save password</Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>

              <DropdownMenuItem>
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {/* ✅ Log out fixed */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="w-full cursor-pointer">
                  <div className="relative flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-md">
                    <BellIcon className="h-4 w-4" />
                    <span>Notifications</span>
                    <span className="absolute right-2 top-[14px] h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="absolute right-2 top-[14px] h-2 w-2 rounded-full bg-red-500"></span>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                  <DialogDescription>
                    Here are your recent notifications.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[400px] overflow-auto">
                  <Card className="bg-muted p-4">
                    <p className="text-sm">
                      ✅ Your profile was updated successfully.
                    </p>
                  </Card>
                  <Card className="bg-muted p-4">
                    <p className="text-sm">🔔 You have 3 unread messages.</p>
                  </Card>
                  <Card className="bg-muted p-4">
                    <p className="text-sm">
                      📢 New feature launched: Dark mode!
                    </p>
                  </Card>
                </div>
                <DialogFooter>
                  <Button variant="outline">Mark all as read</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* ✅ Log out fixed */}
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md">
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>
                    <Logout />
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
