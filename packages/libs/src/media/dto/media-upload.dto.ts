import { z } from "zod";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif"];

export const FileUploadSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_TYPES.includes(file.type), {
    message:
      "Định dạng tệp không được hỗ trợ. Vui lòng tải lên định dạng JPEG, PNG hoặc GIF.",
  })
  .refine((file) => file.size <= MAX_SIZE_BYTES, {
    message: `Kích thước tệp vượt quá ${MAX_SIZE_BYTES / (1024 * 1024)}MB.`,
  });

export type FileType = z.infer<typeof FileUploadSchema>;
