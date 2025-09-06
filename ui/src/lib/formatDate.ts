export function formatDate(iso: string | undefined) {
  if (!iso) return "-";
  try {
    const date = new Date(iso);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
