"use client";
import { AppSidebar } from "@/app/[lang]/(dashboard)/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import LoginPage from "../(auth)/login/page";
import { useAuth } from "@adapter/auth/auth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loggedIn } = useAuth();
  if (loggedIn === null) return;
  if (loggedIn == false) return <LoginPage />;
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
