import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Khách đặt phòng",
  description: "Quản trị khách sạn",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex justify-between items-center px-4 lg:px-6">
          <div>
            <h2 className="text-2xl font-semibold">Khách đặt phòng</h2>
          </div>
        </div>
        <Suspense>{children}</Suspense>
      </div>
    </>
  );
}
