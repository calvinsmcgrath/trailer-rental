// Date-only day strings (YYYY-MM-DD). start_date and end_date are both inclusive —
// end_date is the last calendar day the customer has the trailer, so a same-day
// pickup/return (start === end) is a real, valid 1-day booking.
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function priceFor(
  dayRate: number,
  weekRate: number | null | undefined,
  startDate: string,
  endDate: string
): number {
  const days = daysBetween(startDate, endDate);

  if (!weekRate) {
    return Math.round(dayRate * days * 100) / 100;
  }

  // Full weeks at the weekly rate, remaining days at the day rate — but never
  // charge more than bumping up to the next full week would cost.
  const weeks = Math.floor(days / 7);
  const remainderDays = days % 7;
  let total = weeks * weekRate + remainderDays * dayRate;
  if (remainderDays > 0) {
    total = Math.min(total, (weeks + 1) * weekRate);
  }
  return Math.round(total * 100) / 100;
}

export const MIN_DAYS = 1;
