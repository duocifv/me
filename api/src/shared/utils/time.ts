// utils/time.ts
import { DateTime } from 'luxon';

export const timeNow = () => DateTime.now().setZone('Asia/Ho_Chi_Minh');

export const nowVNMillis = (): number => {
  return timeNow().toMillis(); // timestamp (ms)
};

export const timeNowISO = (): string => {
  return DateTime.now().setZone('Asia/Ho_Chi_Minh').toISO() || '';
};

export const nowVNShort = (): string => {
  return timeNow().toFormat('yyyy-MM-dd HH:mm:ss'); // ví dụ: "2025-07-30 13:01:45"
};
