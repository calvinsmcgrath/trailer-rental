"use client";

import { useState } from "react";
import { formatDisplayDate } from "@/lib/date";
import { formatDisplayTime } from "@/lib/hours";
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
  const [notesExpanded, setNotesExpanded] = useState(false);

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
  const rowTint = `${booking.is_block ? "bg-[var(--color-warning)]/5" : ""} ${isCancelled ? "opacity-50" : ""}`;

  return (
    <>
      <tr
        className={`border-b border-[var(--color-border)] align-top hover:bg-[var(--color-surface-raised)]/40 ${rowTint} ${
          notesExpanded ? "" : "last:border-0"
        }`}
      >
        <td className="whitespace-nowrap px-3 py-2">
          <div className="font-medium">{booking.trailer?.name ?? "Unknown trailer"}</div>
          {(booking.is_block || (booking.is_manual && !booking.is_block) || isCancelled) && (
            <div className="mt-1 flex gap-1">
              {booking.is_block && <span className="badge bg-[var(--color-warning)]/20 text-[var(--color-warning)]">Blocked</span>}
              {booking.is_manual && !booking.is_block && (
                <span className="badge bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]">Manual</span>
              )}
              {isCancelled && <span className="badge bg-[var(--color-danger)]/20 text-[var(--color-danger)]">Cancelled</span>}
            </div>
          )}
        </td>
        <td className="whitespace-nowrap px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-14 shrink-0 font-medium text-[var(--color-success)]">Pickup</span>
            <span className="font-mono text-[var(--color-text-muted)]">
              {formatDisplayDate(booking.start_date)} · {formatDisplayTime(booking.pickup_time)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-14 shrink-0 font-medium text-[var(--color-warning)]">Return</span>
            <span className="font-mono text-[var(--color-text-muted)]">
              {formatDisplayDate(booking.end_date)} · {formatDisplayTime(booking.dropoff_time)}
            </span>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-2">
          {booking.is_block ? <span className="text-[var(--color-text-faint)]">—</span> : booking.customer_name}
        </td>
        <td className="whitespace-nowrap px-3 py-2">
          {booking.is_block || !booking.customer_phone ? (
            <span className="text-[var(--color-text-faint)]">—</span>
          ) : (
            booking.customer_phone
          )}
        </td>
        <td className="whitespace-nowrap px-3 py-2 text-right font-mono">
          {booking.is_block ? (
            <span className="text-[var(--color-text-faint)]">—</span>
          ) : (
            `$${Number(booking.price).toFixed(2)}`
          )}
        </td>
        <td className="whitespace-nowrap px-3 py-2">
          {!isCancelled && !booking.is_block ? (
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
          ) : (
            <span className="text-[var(--color-text-faint)]">—</span>
          )}
        </td>
        <td className="whitespace-nowrap px-3 py-2">
          {!isCancelled && !booking.is_block ? (
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
          ) : (
            <span className="text-[var(--color-text-faint)]">—</span>
          )}
        </td>
        <td className="min-w-[160px] max-w-[240px] px-3 py-2">
          <button
            type="button"
            onClick={() => setNotesExpanded((v) => !v)}
            className="flex w-full items-center gap-1.5 text-left"
          >
            <span
              className={`shrink-0 text-xs text-[var(--color-text-muted)] transition-transform ${
                notesExpanded ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
            <span className="truncate">
              {notes ? notes : <span className="text-[var(--color-text-faint)]">—</span>}
            </span>
          </button>
        </td>
        <td className="whitespace-nowrap px-3 py-2 text-right">
          {!isCancelled && (
            <button onClick={cancelBooking} disabled={busy} className="btn btn-danger">
              Cancel
            </button>
          )}
        </td>
      </tr>
      {notesExpanded && (
        <tr className={`border-b border-[var(--color-border)] last:border-0 ${rowTint}`}>
          <td colSpan={9} className="px-3 pb-3 pt-0">
            <label className="label">Notes</label>
            <textarea
              className="input resize-y text-sm"
              rows={3}
              placeholder="Notes (e.g. paid via Venmo, minor scratch)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoFocus
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={saveNotes}
                disabled={savingNotes || notes === booking.notes}
                className="btn btn-primary"
              >
                {savingNotes ? "Saving…" : "Save"}
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
