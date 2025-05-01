/**
 * Lấy biến môi trường từ process.env.
 * @param key - Tên biến môi trường (nếu dùng ở phía client, nên có tiền tố NEXT_PUBLIC_)
 * @param def - Giá trị mặc định nếu không tìm thấy (mặc định là chuỗi rỗng)
 * @returns Giá trị của biến môi trường
 */
export const getEnv = (key: string, def: string = ""): string => {
  return process.env[key] ?? def;
};
