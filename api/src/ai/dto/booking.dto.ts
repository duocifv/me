// src/dto/booking.dto.ts
import { z } from 'zod';

/**
 * Schema cho bookingIntent (AI sẽ trả về hoặc backend fallback sẽ tính)
 */
export const BookingIntentSchema = z.object({
  score: z.number().int().min(0).max(100),
  category: z.enum(['Thấp', 'Trung bình', 'Cao', 'Rất cao']),
  reasons: z.array(z.string()),
  recommendedAction: z.string(), // e.g. 'call_within_30min' | 'send_email_offer' | ...
});

/**
 * Validate tên:
 * - ít nhất 2 từ
 * - tổng length 5..50
 * - không chứa số hoặc ký tự đặc biệt (chỉ chữ unicode, khoảng trắng, dấu - và ')
 */
const NameSchema = z
  .string()
  .min(5)
  .max(50)
  .refine(
    (s) => {
      const trimmed = s.trim();
      const words = trimmed.split(/\s+/);
      if (words.length < 2) return false;
      // cho phép ký tự chữ Unicode, khoảng trắng, dấu - và '
      // cấm chữ số và hầu hết ký tự special
      // \p{L} = unicode letters
      return /^[-'\p{L}\s]+$/u.test(trimmed);
    },
    {
      message:
        'Họ tên phải có ít nhất 2 từ, chỉ gồm chữ (không chứa số hoặc ký tự đặc biệt).',
    },
  );

/**
 * Phone: kỳ vọng backend đã chuẩn hoá thành +84xxxxxxxx (E.164-like)
 * - +84 + 9..11 chữ số (ví dụ +84912345678)
 */
const PhoneSchema = z
  .string()
  .regex(
    /^\+84\d{9,11}$/,
    'Số điện thoại phải ở dạng +84xxxxxxxx (9-11 chữ số sau +84)',
  );

/**
 * ISO date YYYY-MM-DD (simple)
 */
const IsoDateNullable = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải ở định dạng YYYY-MM-DD')
  .nullable()
  .optional();

/**
 * Main Booking schema (key tiếng Việt/tiếng Anh tùy bạn dùng, ở đây giữ tên field đã dùng trong flow)
 */
export const BookingSchema = z.object({
  name: NameSchema,
  phone: PhoneSchema,
  email: z.string().email().nullable().optional(),
  checkin: IsoDateNullable,
  checkout: IsoDateNullable,
  roomType: z.string().min(1).nullable().optional(),
  nights: z.number().int().positive().nullable().optional(),
  guests: z.number().int().positive().nullable().optional(),
  note: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  bookingIntent: BookingIntentSchema.nullable().optional(),
});

/** Type đầy đủ */
export type BookingDto = z.infer<typeof BookingSchema>;

/** Type partial để lưu tạm (VD: trong AI flow khi khách chưa nhập đủ) */
export type PartialBooking = Partial<BookingDto>;
