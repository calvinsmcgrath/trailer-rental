// Date-only day strings (YYYY-MM-DD) so calendar math never drifts across timezones.
export function nightsBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function priceFor(
  dayRate: number,
  weekRate: number | null | undefined,
  startDate: string,
  endDate: string
): number {
  const nights = nightsBetween(startDate, endDate);

  if (!weekRate) {
    return Math.round(dayRate * nights * 100) / 100;
  }

  // Full weeks at the weekly rate, remaining nights at the day rate — but never
  // charge more than bumping up to the next full week would cost.
  const weeks = Math.floor(nights / 7);
  const remainderNights = nights % 7;
  let total = weeks * weekRate + remainderNights * dayRate;
  if (remainderNights > 0) {
    total = Math.min(total, (weeks + 1) * weekRate);
  }
  return Math.round(total * 100) / 100;
}

export const MIN_NIGHTS = 1;
