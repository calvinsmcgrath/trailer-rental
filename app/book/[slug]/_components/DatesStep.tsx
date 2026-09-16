import type { DateRange, Matcher } from "react-day-picker";
import { BackButton } from "@/components/BackButton";
import { Calendar } from "@/components/Calendar";
import { fullyBookedDates, lastSelectableDropoffDate } from "@/lib/availability";
import { toDateOnly, formatDisplayDate, startOfToday } from "@/lib/date";
import type { BookingSpan } from "@/lib/hours";
import { daysBetween, priceFor } from "@/lib/pricing";
import type { PublicTrailer } from "@/lib/types";

export function DatesStep({
  trailer,
  spans,
  windowStart,
  windowEnd,
  loadingAvailability,
  range,
  onRangeChange,
  onBack,
  onContinue,
  errorMessage,
}: {
  trailer: PublicTrailer;
  spans: BookingSpan[];
  windowStart: string;
  windowEnd: string;
  loadingAvailability: boolean;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onBack: () => void;
  onContinue: () => void;
  errorMessage: string | null;
}) {
  // Only whole days with no usable pickup time are struck out here — a day
  // another rental merely touches can still work, which is the point of the
  // buffer rules. The times step narrows it down from there.
  const disabled: Matcher[] = [
    { before: startOfToday() },
    ...fullyBookedDates(spans, windowStart, windowEnd),
  ];

  // While the return day is still being chosen, stop the range reaching past
  // the next rental, since no drop-off time there could ever clear the buffer.
  if (range?.from && !range.to) {
    const lastDropoff = lastSelectableDropoffDate(
      toDateOnly(range.from),
      spans,
      windowStart,
      windowEnd
    );
    if (lastDropoff) {
      disabled.push({ after: lastDropoff });
    }
  }

  const days =
    range?.from && range?.to ? daysBetween(toDateOnly(range.from), toDateOnly(range.to)) : 0;

  const canContinue = !!range?.from && !!range?.to && days >= 1;

  return (
    <div className="space-y-4">
      <BackButton label="Choose a different trailer" onClick={onBack} />
      <h1 className="text-lg font-semibold">Pick your dates</h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        {trailer.name} · ${trailer.day_rate}/day
        {trailer.week_rate != null && <> · ${trailer.week_rate}/week</>}
      </p>

      {errorMessage && (
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {errorMessage}
        </div>
      )}

      <div className="card p-2 sm:p-4">
        {loadingAvailability ? (
          <div className="flex h-64 items-center justify-center text-sm text-[var(--color-text-muted)]">
            Loading availability…
          </div>
        ) : (
          // No `min` here: a single click should immediately book that one day
          // (from === to). The backend enforces the actual minimum length.
          <Calendar selected={range} onSelect={onRangeChange} disabled={disabled} />
        )}
      </div>

      {range?.from && (
        <div className="card flex flex-col gap-1 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Pickup</span>
            <span>{formatDisplayDate(toDateOnly(range.from))}</span>
          </div>
          {range.to && (
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">Return</span>
              <span>{formatDisplayDate(toDateOnly(range.to))}</span>
            </div>
          )}
          {days >= 1 && range?.from && range?.to && (
            <div className="mt-2 flex justify-between border-t border-[var(--color-border)] pt-2 font-medium">
              <span>
                {days} day{days === 1 ? "" : "s"}
              </span>
              <span>
                $
                {priceFor(
                  trailer.day_rate,
                  trailer.week_rate,
                  toDateOnly(range.from),
                  toDateOnly(range.to)
                ).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      <button className="btn btn-primary w-full" disabled={!canContinue} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
