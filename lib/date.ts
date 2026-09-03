// Formats a Date using its LOCAL calendar fields (not UTC) so the day never shifts —
// react-day-picker gives us Date objects in the browser's local timezone.
export function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateOnly(dateOnly: string): Date {
  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function formatDisplayDate(dateOnly: string): string {
  return fromDateOnly(dateOnly).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
