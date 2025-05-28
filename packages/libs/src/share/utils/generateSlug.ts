export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // tách dấu khỏi chữ cái
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu (nếu muốn)
    .replace(/[^a-z0-9\s-đăâêôơư]+/gi, "") // chỉ giữ chữ, số, khoảng trắng, dấu gạch
    .replace(/\s+/g, "-"); // thay khoảng trắng bằng dấu gạch ngang
}
