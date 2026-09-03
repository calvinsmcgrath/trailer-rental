"use client";

import { useState } from "react";
import { formatDisplayDate } from "@/lib/date";
import type { BookingWithTrailer } from "@/lib/types";

export function BookingRow({
  booking,
  onUpdate,
}: {
  booking: BookingWithTrailer;
  onUpdate: (
    id: string,
    patch: { paid?: boolean; returned?: boolean; notes?: string; cancel?: boolean }
  ) => Promise<void>;
}) {
  const [notes, setNotes] = useState(booking.notes);
  const [savingNotes, setSavingNotes] = useState(false);
  const [busy, setBusy] = useState(false);

  async function changePaid(value: string) {
    setBusy(true);
    try {
      await onUpdate(booking.id, { paid: value === "paid" });
    } finally {
      setBusy(false);
    }
  }

  async function changeReturned(value: string) {
    setBusy(true);
    try {
      await onUpdate(booking.id, { returned: value === "returned" });
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes() {
    if (notes === booking.notes) return;
    setSavingNotes(true);
    try {
      await onUpdate(booking.id, { notes });
    } finally {
      setSavingNotes(false);
    }
  }

  async function cancelBooking() {
    if (!confirm(`Cancel this booking for ${booking.customer_name}?`)) return;
    setBusy(true);
    try {
      await onUpdate(booking.id, { cancel: true });
    } finally {
      setBusy(false);
    }
  }

  const isCancelled = !!booking.cancelled_at;

  return (
    <div
      className={`card p-4 ${booking.is_block ? "border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{booking.trailer?.name ?? "Unknown trailer"}</span>
            {booking.is_block && <span className="badge bg-[var(--color-warning)]/20 text-[var(--color-warning)]">Blocked</span>}
            {booking.is_manual && !booking.is_block && (
              <span className="badge bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]">Manual</span>
            )}
            {isCancelled && <span className="badge bg-[var(--color-danger)]/20 text-[var(--color-danger)]">Cancelled</span>}
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {formatDisplayDate(booking.start_date)} → {formatDisplayDate(booking.end_date)}
          </p>
          {!booking.is_block && (
            <p className="text-sm">
              {booking.customer_name}
              {booking.customer_phone && ` · ${booking.customer_phone}`}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="font-medium">${Number(booking.price).toFixed(2)}</span>
          {!isCancelled && !booking.is_block && (
            <div className="flex gap-1.5">
              <select
                value={booking.paid ? "paid" : "unpaid"}
                onChange={(e) => changePaid(e.target.value)}
                disabled={busy}
                className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${
                  booking.paid
                    ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                    : "bg-[var(--color-danger)]/20 text-[var(--color-danger)]"
                }`}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
              <select
                value={booking.returned ? "returned" : "not_returned"}
                onChange={(e) => changeReturned(e.target.value)}
                disabled={busy}
                className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${
                  booking.returned
                    ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                    : "bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
                }`}
              >
                <option value="not_returned">Not returned</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <input
            className="input text-sm"
            placeholder="Notes (e.g. paid via Venmo, minor scratch)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
          />
        </div>
        {!isCancelled && (
          <button onClick={cancelBooking} disabled={busy} className="btn btn-danger">
            Cancel booking
          </button>
        )}
      </div>
      {savingNotes && <p className="mt-1 text-xs text-[var(--color-text-faint)]">Saving…</p>}
    </div>
  );
}
