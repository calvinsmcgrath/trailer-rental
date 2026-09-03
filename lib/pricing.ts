// Date-only day strings (YYYY-MM-DD) so calendar math never drifts across timezones.
export function nightsBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function priceFor(dayRate: number, startDate: string, endDate: string): number {
  const nights = nightsBetween(startDate, endDate);
  return Math.round(dayRate * nights * 100) / 100;
}

export const MIN_NIGHTS = 1;
