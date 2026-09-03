"use client";

import { useState } from "react";

export function AddTrailerForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dayRate, setDayRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/trailers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, day_rate: parseFloat(dayRate) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to add trailer.");
        return;
      }
      setName("");
      setDescription("");
      setDayRate("");
      setOpen(false);
      onAdded();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary">
        + Add trailer
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-4">
      <div>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Description / specs</label>
        <textarea
          className="input min-h-[3rem] resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="label">Day rate ($)</label>
        <input
          className="input"
          value={dayRate}
          onChange={(e) => setDayRate(e.target.value)}
          inputMode="decimal"
          required
        />
      </div>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
          {submitting ? "Adding…" : "Add trailer"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <p className="text-xs text-[var(--color-text-faint)]">
        You can add a photo after creating the trailer.
      </p>
    </form>
  );
}
