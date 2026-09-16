import { BackButton } from "@/components/BackButton";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import { freeDropoffSlots, freePickupSlots } from "@/lib/availability";
import { formatDisplayDate } from "@/lib/date";
import { combineDateTime, formatDisplayTime, type BookingSpan } from "@/lib/hours";

export function TimesStep({
  pickupDate,
  dropoffDate,
  spans,
  windowStart,
  windowEnd,
  pickupTime,
  dropoffTime,
  onPickupTimeChange,
  onDropoffTimeChange,
  onBack,
  onContinue,
}: {
  pickupDate: string;
  dropoffDate: string;
  spans: BookingSpan[];
  windowStart: string;
  windowEnd: string;
  pickupTime: string | null;
  dropoffTime: string | null;
  onPickupTimeChange: (time: string | null) => void;
  onDropoffTimeChange: (time: string | null) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const pickupSlots = freePickupSlots(pickupDate, spans, windowStart, windowEnd);
  const pickupAt = pickupTime ? combineDateTime(pickupDate, pickupTime) : null;
  const dropoffSlots = pickupAt
    ? freeDropoffSlots(dropoffDate, pickupAt, spans, windowStart, windowEnd)
    : [];

  function handlePickupChange(time: string) {
    onPickupTimeChange(time);
    const stillAvailable = freeDropoffSlots(
      dropoffDate,
      combineDateTime(pickupDate, time),
      spans,
      windowStart,
      windowEnd
    );
    if (dropoffTime && !stillAvailable.includes(dropoffTime)) {
      onDropoffTimeChange(null);
    }
  }

  const canContinue = !!pickupTime && !!dropoffTime;

  return (
    <div className="space-y-4">
      <BackButton label="Change your dates" onClick={onBack} />

      <h1 className="text-lg font-semibold">Pick your times</h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        Times already taken — plus the 3 hours we need between rentals to check the trailer over —
        aren&apos;t shown.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <TimeSlotPicker
          title="Pickup"
          subtitle={formatDisplayDate(pickupDate)}
          slots={pickupSlots}
          value={pickupTime}
          onChange={handlePickupChange}
          emptyMessage="No pickup times left on this day. Go back and pick another date."
        />
        <TimeSlotPicker
          title="Drop-off"
          subtitle={formatDisplayDate(dropoffDate)}
          slots={dropoffSlots}
          value={dropoffTime}
          onChange={onDropoffTimeChange}
          emptyMessage={
            pickupTime
              ? "No drop-off times work with that pickup. Try an earlier pickup, or go back and pick another date."
              : "Choose a pickup time first."
          }
        />
      </div>

      {pickupTime && dropoffTime && (
        <div className="card flex flex-col gap-1 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Pickup</span>
            <span>
              {formatDisplayDate(pickupDate)} · {formatDisplayTime(pickupTime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Return</span>
            <span>
              {formatDisplayDate(dropoffDate)} · {formatDisplayTime(dropoffTime)}
            </span>
          </div>
        </div>
      )}

      <button className="btn btn-primary w-full" disabled={!canContinue} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
