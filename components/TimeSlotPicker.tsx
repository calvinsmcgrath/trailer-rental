"use client";

import { formatDisplayTime } from "@/lib/hours";

export function TimeSlotPicker({
  title,
  subtitle,
  slots,
  value,
  onChange,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  slots: string[];
  value: string | null;
  onChange: (time: string) => void;
  emptyMessage: string;
}) {
  return (
    <div className="card flex flex-col p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mb-3 text-xs text-[var(--color-text-muted)]">{subtitle}</div>

      {slots.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
      ) : (
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {slots.map((slot) => {
            const selected = slot === value;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onChange(slot)}
                aria-pressed={selected}
                className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-raised)]"
                }`}
              >
                {formatDisplayTime(slot)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
