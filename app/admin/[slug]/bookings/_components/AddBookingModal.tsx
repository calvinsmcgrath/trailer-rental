"use client";

import { useState } from "react";
import type { Trailer } from "@/lib/types";

export function AddBookingModal({
  trailers,
  onClose,
  onCreated,
}: {
  trailers: Trailer[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [trailerId, setTrailerId] = useState(trailers[0]?.id ?? "");
  const [isBlock, setIsBlock] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trailerId,
          startDate,
          endDate,
          customerName: isBlock ? customerName || "Blocked" : customerName,
          customerPhone,
          notes,
          isBlock,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create booking.");
        return;
      }
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add booking</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost">
            ✕
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBlock}
            onChange={(e) => setIsBlock(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Block for maintenance / personal use (no customer)
        </label>

        <div>
          <label className="label">Trailer</label>
          <select
            className="input"
            value={trailerId}
            onChange={(e) => setTrailerId(e.target.value)}
            required
          >
            {trailers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {!isBlock && (
          <>
            <div>
              <label className="label">Customer name</label>
              <input
                className="input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start date</label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">End date</label>
            <input
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={submitting || !trailerId}>
          {submitting ? "Saving…" : "Add booking"}
        </button>
      </form>
    </div>
  );
}
