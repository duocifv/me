"use client";
import { AppSidebar } from "@/app/[lang]/(dashboard)/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import LoginPage from "../(auth)/login/page";
import { AuthGuard } from "@adapter/auth/auth.guard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard fallback={<LoginPage />}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
