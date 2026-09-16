import { formatDisplayDate } from "./date";

// Time-of-day helpers for pickup/drop-off. Everything here is local wall-clock
// time, matching lib/date.ts — the database stores naive `date + time` values
// built from the same parts, so the two never disagree about what "2:00 PM" is.

// Mirrors the `interval '3 hours'` padding in the bookings_no_overlap exclusion
// constraint (supabase/migrations/0005_booking_times.sql). Changing this alone
// only changes which slots the UI offers; the database still has the last word.
export const BUFFER_MINUTES = 180;

export const SLOT_MINUTES = 30;

export type BookingSpan = { start: Date; end: Date };

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function combineDateTime(dateOnly: string, time: string): Date {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatDisplayDateTime(dateOnly: string, time: string): string {
  return `${formatDisplayDate(dateOnly)} at ${formatDisplayTime(time)}`;
}

export function generateSlots(windowStart: string, windowEnd: string): string[] {
  const slots: string[] = [];
  const end = timeToMinutes(windowEnd);
  for (let m = timeToMinutes(windowStart); m <= end; m += SLOT_MINUTES) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

export function isWithinWindow(time: string, windowStart: string, windowEnd: string): boolean {
  const minutes = timeToMinutes(time);
  return minutes >= timeToMinutes(windowStart) && minutes <= timeToMinutes(windowEnd);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

// Mirrors the database exclusion constraint: every booking occupies its own
// span plus a trailing buffer, so two bookings collide unless at least
// BUFFER_MINUTES separates one's drop-off from the other's pickup.
export function conflictsWithExisting(start: Date, end: Date, spans: BookingSpan[]): boolean {
  return spans.some(
    (span) =>
      start < addMinutes(span.end, BUFFER_MINUTES) && span.start < addMinutes(end, BUFFER_MINUTES)
  );
}
