import { fromDateOnly, toDateOnly } from "./date";
import {
  BUFFER_MINUTES,
  combineDateTime,
  conflictsWithExisting,
  generateSlots,
  type BookingSpan,
} from "./hours";

export type AvailabilityBooking = {
  start_date: string;
  end_date: string;
  pickup_time: string;
  dropoff_time: string;
};

export function toSpans(bookings: AvailabilityBooking[]): BookingSpan[] {
  return bookings.map((booking) => ({
    start: combineDateTime(booking.start_date, booking.pickup_time),
    end: combineDateTime(booking.end_date, booking.dropoff_time),
  }));
}

// A pickup time is only offered if some drop-off could still follow it, so the
// probe is a zero-length rental: if even that collides, nothing starting here
// can work, because every real rental only reaches further into the conflict.
export function freePickupSlots(
  dateOnly: string,
  spans: BookingSpan[],
  windowStart: string,
  windowEnd: string,
  now: Date = new Date()
): string[] {
  return generateSlots(windowStart, windowEnd).filter((time) => {
    const at = combineDateTime(dateOnly, time);
    return at > now && !conflictsWithExisting(at, at, spans);
  });
}

export function freeDropoffSlots(
  dateOnly: string,
  pickupAt: Date,
  spans: BookingSpan[],
  windowStart: string,
  windowEnd: string
): string[] {
  return generateSlots(windowStart, windowEnd).filter((time) => {
    const at = combineDateTime(dateOnly, time);
    return at > pickupAt && !conflictsWithExisting(pickupAt, at, spans);
  });
}

// Days with no usable pickup time at all, so the calendar can strike them out.
// Only days a booking actually touches can qualify, which keeps this bounded.
export function fullyBookedDates(
  spans: BookingSpan[],
  windowStart: string,
  windowEnd: string,
  now: Date = new Date()
): Date[] {
  const candidates = new Set<string>();
  for (const span of spans) {
    const last = new Date(span.end.getFullYear(), span.end.getMonth(), span.end.getDate() + 1);
    for (
      let day = new Date(span.start.getFullYear(), span.start.getMonth(), span.start.getDate());
      day <= last;
      day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
    ) {
      candidates.add(toDateOnly(day));
    }
  }

  return [...candidates]
    .filter((dateOnly) => freePickupSlots(dateOnly, spans, windowStart, windowEnd, now).length === 0)
    .map(fromDateOnly);
}

// The last day that can still hold a valid drop-off for a pickup on this date,
// so the calendar can stop a customer selecting a range that reaches past the
// next booking. Null means nothing caps it.
export function lastSelectableDropoffDate(
  pickupDateOnly: string,
  spans: BookingSpan[],
  windowStart: string,
  windowEnd: string,
  now: Date = new Date()
): Date | null {
  const pickupSlots = freePickupSlots(pickupDateOnly, spans, windowStart, windowEnd, now);
  if (pickupSlots.length === 0) return null;

  // The earliest usable pickup is the one the next booking constrains hardest;
  // a later pickup can only clear bookings this one already sits behind.
  const earliestPickup = combineDateTime(pickupDateOnly, pickupSlots[0]);
  const nextStart = spans
    .map((span) => span.start)
    .filter((start) => start > earliestPickup)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (!nextStart) return null;

  const latestDropoff = new Date(nextStart.getTime() - BUFFER_MINUTES * 60_000);
  return new Date(latestDropoff.getFullYear(), latestDropoff.getMonth(), latestDropoff.getDate());
}
