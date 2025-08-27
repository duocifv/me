// src/dto/booking.dto.ts
import { z } from 'zod';

// Zod schema cho Booking với key tiếng Việt + nullable
export const BookingSchema = z.object({
  'Ngày đặt': z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(), // ISO date string
  'Họ và tên': z.string().min(1),
  'Số điện thoại': z.string().regex(/^(?:\+84|0)\d{8,9}$/),
  Email: z.string().email().nullable(),
  'Check-in': z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  'Check-out': z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  'Loại phòng': z.string().min(1).nullable(),
  'Ghi chú khách': z.string().nullable(),
  'Tình trạng': z.string().nullable(),
});

// Type đầy đủ
export type BookingDto = z.infer<typeof BookingSchema>;

// Type partial để lưu tạm (VD: trong AI flow khi khách chưa nhập đủ)
export type PartialBooking = Partial<BookingDto>;
