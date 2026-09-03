import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/Calendar";
import { fromDateOnly, toDateOnly, formatDisplayDate, startOfToday } from "@/lib/date";
import { daysBetween, priceFor } from "@/lib/pricing";
import type { PublicTrailer } from "@/lib/types";

export function DatesStep({
  trailer,
  bookedRanges,
  loadingAvailability,
  range,
  onRangeChange,
  onBack,
  onContinue,
  errorMessage,
}: {
  trailer: PublicTrailer;
  bookedRanges: { start_date: string; end_date: string }[];
  loadingAvailability: boolean;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onBack: () => void;
  onContinue: () => void;
  errorMessage: string | null;
}) {
  const disabled = [
    { before: startOfToday() },
    ...bookedRanges.map((b) => ({ from: fromDateOnly(b.start_date), to: fromDateOnly(b.end_date) })),
  ];

  const days =
    range?.from && range?.to ? daysBetween(toDateOnly(range.from), toDateOnly(range.to)) : 0;

  const canContinue = !!range?.from && !!range?.to && days >= 1;

  return (
    <div className="space-y-4">
      <div className="group fixed left-4 top-6 z-10 sm:left-6">
        <button
          onClick={onBack}
          aria-label="Choose a different trailer"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg text-[var(--color-text-muted)] shadow-sm hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
        >
          ←
        </button>
        <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-xs font-medium text-[var(--color-text)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          Choose a different trailer
        </span>
      </div>
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
