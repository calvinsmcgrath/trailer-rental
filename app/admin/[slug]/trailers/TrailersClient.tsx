"use client";

import { useState } from "react";
import { TrailerCard } from "./_components/TrailerCard";
import { AddTrailerForm } from "./_components/AddTrailerForm";
import type { Trailer } from "@/lib/types";

export function TrailersClient({ initialTrailers }: { initialTrailers: Trailer[] }) {
  const [trailers, setTrailers] = useState(initialTrailers);

  async function refresh() {
    const res = await fetch("/api/admin/trailers");
    const json = await res.json();
    setTrailers(json.trailers ?? []);
  }

  async function patchTrailer(id: string, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/trailers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const json = await res.json();
      setTrailers((prev) => prev.map((t) => (t.id === id ? json.trailer : t)));
    }
  }

  async function deleteTrailer(id: string): Promise<string | null> {
    const res = await fetch(`/api/admin/trailers/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTrailers((prev) => prev.filter((t) => t.id !== id));
      return null;
    }
    const json = await res.json().catch(() => ({}));
    return json.error || "Failed to delete trailer.";
  }

  async function swap(indexA: number, indexB: number) {
    const a = trailers[indexA];
    const b = trailers[indexB];
    if (!a || !b) return;
    setTrailers((prev) => {
      const next = [...prev];
      [next[indexA], next[indexB]] = [next[indexB], next[indexA]];
      return next;
    });
    await Promise.all([
      patchTrailer(a.id, { sort_order: b.sort_order }),
      patchTrailer(b.id, { sort_order: a.sort_order }),
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Trailers</h1>
        <AddTrailerForm onAdded={refresh} />
      </div>

      <div className="space-y-3">
        {trailers.map((trailer, i) => (
          <TrailerCard
            key={trailer.id}
            trailer={trailer}
            isFirst={i === 0}
            isLast={i === trailers.length - 1}
            onSave={(patch) => patchTrailer(trailer.id, patch)}
            onDelete={() => deleteTrailer(trailer.id)}
            onMoveUp={() => swap(i, i - 1)}
            onMoveDown={() => swap(i, i + 1)}
            onPhotoUploaded={(updated) =>
              setTrailers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            }
          />
        ))}
      </div>
    </div>
  );
}
