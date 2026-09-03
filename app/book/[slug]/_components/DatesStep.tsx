import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/Calendar";
import { fromDateOnly, toDateOnly, formatDisplayDate, startOfToday } from "@/lib/date";
import { nightsBetween } from "@/lib/pricing";
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
    ...bookedRanges.map((b) => {
      const start = fromDateOnly(b.start_date);
      const end = fromDateOnly(b.end_date);
      end.setDate(end.getDate() - 1); // end_date is exclusive — the return day itself is free
      return { from: start, to: end };
    }),
  ];

  const nights =
    range?.from && range?.to ? nightsBetween(toDateOnly(range.from), toDateOnly(range.to)) : 0;

  const canContinue = !!range?.from && !!range?.to && nights >= 1;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        ← Choose a different trailer
      </button>
      <h1 className="text-lg font-semibold">Pick your dates</h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        {trailer.name} · ${trailer.day_rate}/day
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
          <Calendar selected={range} onSelect={onRangeChange} disabled={disabled} min={2} />
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
          {nights >= 1 && (
            <div className="mt-2 flex justify-between border-t border-[var(--color-border)] pt-2 font-medium">
              <span>
                {nights} night{nights === 1 ? "" : "s"} × ${trailer.day_rate}
              </span>
              <span>${(nights * trailer.day_rate).toFixed(2)}</span>
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
