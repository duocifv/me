// src/dto/booking.dto.ts
import { z } from 'zod';

// Zod schema cho Booking với key tiếng Việt + nullable
export const BookingSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^(?:\+84|0)\d{8,9}$/),
  email: z.string().email().nullable(),
  checkin: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  checkout: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  roomType: z.string().min(1).nullable(),
  note: z.string().nullable(),
  status: z.string().nullable(),
});

// Type đầy đủ
export type BookingDto = z.infer<typeof BookingSchema>;

// Type partial để lưu tạm (VD: trong AI flow khi khách chưa nhập đủ)
export type PartialBooking = Partial<BookingDto>;
