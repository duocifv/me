"use client";
import { API_URL } from "../../cms/constant";

export async function findAllRooms({ signal }: { signal?: AbortSignal } = {}) {
  const res = await fetch(API_URL + "?action=roomStatus&date=2025-08-26", {
    signal,
  });
  if (!res.ok)
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log("bookings", json);
  return Array.isArray(json?.data) ? json.data : [];
}
