"use client"

import dynamic from "next/dynamic";

// import ProductsDetail from "@/components/products-route/detail";
// import dynamic from "next/dynamic";

const ProductsDetail = dynamic(
  () => import("@/components/products-route/detail")
)

export default function Detail() {
  return <ProductsDetail />;
}
