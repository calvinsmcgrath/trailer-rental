"use client";

import { useState } from "react";
import { BookingRow } from "./_components/BookingRow";
import { AddBookingModal } from "./_components/AddBookingModal";
import type { BookingWithTrailer, Trailer } from "@/lib/types";

type Scope = "upcoming" | "history";

export function BookingsClient({
  initialBookings,
  activeTrailers,
}: {
  initialBookings: BookingWithTrailer[];
  activeTrailers: Trailer[];
}) {
  const [scope, setScope] = useState<Scope>("upcoming");
  const [bookingsByScope, setBookingsByScope] = useState<Record<Scope, BookingWithTrailer[] | null>>({
    upcoming: initialBookings,
    history: null,
  });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const bookings = bookingsByScope[scope];

  async function loadScope(nextScope: Scope) {
    setScope(nextScope);
    if (bookingsByScope[nextScope]) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings?scope=${nextScope}`);
      const json = await res.json();
      setBookingsByScope((prev) => ({ ...prev, [nextScope]: json.bookings ?? [] }));
    } finally {
      setLoading(false);
    }
  }

  async function refreshCurrentScope() {
    const res = await fetch(`/api/admin/bookings?scope=${scope}`);
    const json = await res.json();
    setBookingsByScope((prev) => ({ ...prev, [scope]: json.bookings ?? [] }));
  }

  async function handleUpdate(
    id: string,
    patch: { paid?: boolean; returned?: boolean; notes?: string; cancel?: boolean }
  ) {
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await refreshCurrentScope();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
          <button
            onClick={() => loadScope("upcoming")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              scope === "upcoming" ? "bg-[var(--color-surface-raised)]" : "text-[var(--color-text-muted)]"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => loadScope("history")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              scope === "history" ? "bg-[var(--color-surface-raised)]" : "text-[var(--color-text-muted)]"
            }`}
          >
            History
          </button>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          + Add booking
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>}

      {!loading && bookings?.length === 0 && (
        <div className="card p-6 text-center text-sm text-[var(--color-text-muted)]">
          {scope === "upcoming" ? "No upcoming bookings." : "No past bookings yet."}
        </div>
      )}

      <div className="space-y-3">
        {bookings?.map((booking) => (
          <BookingRow key={booking.id} booking={booking} onUpdate={handleUpdate} />
        ))}
      </div>

      {showAddModal && (
        <AddBookingModal
          trailers={activeTrailers}
          onClose={() => setShowAddModal(false)}
          onCreated={async () => {
            setShowAddModal(false);
            setBookingsByScope({ upcoming: null, history: null });
            await loadScope("upcoming");
          }}
        />
      )}
    </div>
  );
}
