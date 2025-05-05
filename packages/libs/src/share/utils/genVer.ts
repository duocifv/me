// Global cache để tránh tính toán lại
const cacheStore = new Map();

/**
 * Tạo cacheVersion từ createdAt, cache giá trị để tối ưu
 * @param {string} createdAt - Timestamp ISO string
 * @returns {string} cacheVersion (Base36, theo giờ)
 */

function genVer(createdAt: string) {
  if (!createdAt) return "0"; // Tránh lỗi nếu `createdAt` không hợp lệ

  if (!cacheStore.has(createdAt)) {
    const cacheVersion = (
      Math.floor(new Date(createdAt).getTime() / 3600000) % 100000
    ).toString(36);
    cacheStore.set(createdAt, cacheVersion);
  }

  return cacheStore.get(createdAt);
}

export { genVer };
