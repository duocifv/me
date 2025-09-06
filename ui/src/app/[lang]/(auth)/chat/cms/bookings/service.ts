import { API_URL } from "../constant";

export async function findAllbookings({
  signal,
}: { signal?: AbortSignal } = {}) {
  const res = await fetch(API_URL + "?action=bookings", { signal });
  if (!res.ok)
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log("bookings", json);
  return Array.isArray(json?.data) ? json.data : [];
}
