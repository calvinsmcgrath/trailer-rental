"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { Trailer } from "@/lib/types";

export function TrailerCard({
  trailer,
  isFirst,
  isLast,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  onPhotoUploaded,
}: {
  trailer: Trailer;
  isFirst: boolean;
  isLast: boolean;
  onSave: (patch: Partial<Pick<Trailer, "name" | "description" | "day_rate" | "active">>) => Promise<void>;
  onDelete: () => Promise<string | null>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPhotoUploaded: (trailer: Trailer) => void;
}) {
  const [name, setName] = useState(trailer.name);
  const [description, setDescription] = useState(trailer.description);
  const [dayRate, setDayRate] = useState(String(trailer.day_rate));
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function saveField() {
    const rate = parseFloat(dayRate);
    await onSave({
      name: name.trim() || trailer.name,
      description,
      day_rate: Number.isFinite(rate) && rate > 0 ? rate : trailer.day_rate,
    });
  }

  async function handleDelete() {
    if (!confirm(`Delete ${trailer.name}? This can't be undone.`)) return;
    setDeleteError(null);
    const error = await onDelete();
    if (error) setDeleteError(error);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(`/api/admin/trailers/${trailer.id}/photo`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) onPhotoUploaded(json.trailer);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className={`card p-4 ${!trailer.active ? "opacity-60" : ""}`}>
      <div className="flex gap-4">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-raised)]">
          {trailer.photo_url ? (
            <Image src={trailer.photo_url} alt={trailer.name} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-faint)]">
              No photo
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity hover:opacity-100"
          >
            {uploading ? "Uploading…" : "Change photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              className="input flex-1 font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveField}
            />
            {!trailer.active && (
              <span className="badge bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]">
                Inactive
              </span>
            )}
          </div>
          <textarea
            className="input min-h-[2.5rem] resize-none text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveField}
            placeholder="Description / specs"
          />
          <div className="flex items-center gap-1 text-sm">
            <span className="text-[var(--color-text-muted)]">$</span>
            <input
              className="input w-24"
              value={dayRate}
              onChange={(e) => setDayRate(e.target.value)}
              onBlur={saveField}
              inputMode="decimal"
            />
            <span className="text-[var(--color-text-muted)]">/day</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="btn btn-ghost px-2 disabled:opacity-20">
            ↑
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="btn btn-ghost px-2 disabled:opacity-20">
            ↓
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
        <button onClick={() => onSave({ active: !trailer.active })} className="btn btn-secondary">
          {trailer.active ? "Deactivate" : "Reactivate"}
        </button>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete
        </button>
      </div>
      {deleteError && <p className="mt-2 text-sm text-[var(--color-danger)]">{deleteError}</p>}
    </div>
  );
}
