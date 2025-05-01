"use client"
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export default function Layout({
  children,
  detail,
}: {
  children: ReactNode;
  detail: ReactNode;
}) {
  const search = useSearchParams();
  const role = search.get("id");
  return (
    <>
     
      {!role ? children : detail}
    </>
  );
}
