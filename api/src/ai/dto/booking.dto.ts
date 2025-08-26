// src/dto/booking.dto.ts
import { z } from 'zod';

// zod schema giúp validate và transform Partial -> BookingDto safely
export const BookingSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  room: z.string().min(1),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().positive(),
  note: z.string().optional(),
});

export type BookingDto = z.infer<typeof BookingSchema>;

// a partial type for provisional storage
export type PartialBooking = Partial<BookingDto>;
