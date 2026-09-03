import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");

export const bookingRequestSchema = z.object({
  trailerId: z.string().uuid(),
  startDate: dateOnly,
  endDate: dateOnly,
  customerName: z.string().trim().min(1, "Name is required").max(200),
  customerPhone: z.string().trim().min(7, "Phone number is required").max(30),
  contractAgreed: z.literal(true),
  contractSignedName: z.string().trim().min(1, "Signature is required").max(200),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export const manualBookingSchema = z.object({
  trailerId: z.string().uuid(),
  startDate: dateOnly,
  endDate: dateOnly,
  customerName: z.string().trim().min(1).max(200),
  customerPhone: z.string().trim().max(30).default(""),
  notes: z.string().trim().max(2000).default(""),
  isBlock: z.boolean().default(false),
});

export const loginSchema = z.object({
  password: z.string().min(1),
});

export const createTrailerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(2000).default(""),
  day_rate: z.number().positive("Day rate must be greater than 0"),
  week_rate: z.number().positive("Week rate must be greater than 0").nullable().optional(),
});

export const updateTrailerSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  day_rate: z.number().positive().optional(),
  week_rate: z.number().positive().nullable().optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  photo_url: z.string().url().nullable().optional(),
});
