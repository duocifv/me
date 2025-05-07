// hooks/use-back.ts
"use client"

import { useRouter } from "next/navigation"

export function useBack(fallback: string = "/") {
  const router = useRouter()

  return () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }
}
