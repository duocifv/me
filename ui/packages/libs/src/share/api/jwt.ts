import { jwtDecode } from "jwt-decode";

export function isTokenExpiringSoon(
  token: string,
  thresholdSeconds = 300
): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    const remaining = exp - now;

    // console.log(`Thời gian hiện tại: ${new Date(now * 1000).toISOString()}`);
    // console.log(`Token hết hạn lúc: ${new Date(exp * 1000).toISOString()}`);
    // // (Optional) Hiển thị dưới dạng hh:mm:ss
    // const hours = Math.floor(remaining / 3600);
    // const minutes = Math.floor((remaining % 3600) / 60);
    // const seconds = remaining % 60;
    // console.log(`Còn lại (hh:mm:ss): ${hours}h ${minutes}m ${seconds}s`);

    return remaining < thresholdSeconds;
  } catch (err) {
    return true; // lỗi khi decode thì coi như sắp hết hạn
  }
}
