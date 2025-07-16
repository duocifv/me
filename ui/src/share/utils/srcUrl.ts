/**
 * Xây dựng URL hoàn chỉnh của hình ảnh dựa trên documentId.
 *
 * @param documentId - ID của tài liệu hình ảnh.
 * @returns URL hình ảnh hoàn chỉnh.
 */


export function srcUrl(documentId: string): string {
  const url = "/utll/"
  if (!documentId) return "";
  return `${url}${documentId}`;
}
