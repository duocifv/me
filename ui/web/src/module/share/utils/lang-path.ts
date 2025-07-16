export const langPath = (pathname: string, newLocale: string) => {
  const segments = pathname.split("/").filter(Boolean); // Tách URL thành mảng

  // Kiểm tra nếu URL đã có locale hợp lệ
  if (["en", "ko", "zh"].includes(segments[0])) {
    segments[0] = newLocale; // Thay đổi locale hiện tại
  } else {
    segments.unshift(newLocale); // Nếu không có locale, thêm vào đầu
  }

  // Nếu là tiếng Anh thì bỏ locale để dùng URL mặc định
  if (newLocale === "en") {
    segments.shift(); // Xóa phần tử đầu tiên (locale)
  }

  return "/" + segments.join("/");
};
