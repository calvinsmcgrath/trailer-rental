import Image from "next/image";
import type { PublicTrailer } from "@/lib/types";

export function TrailerStep({
  trailers,
  onSelect,
}: {
  trailers: PublicTrailer[];
  onSelect: (trailer: PublicTrailer) => void;
}) {
  if (trailers.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-[var(--color-text-muted)]">
        No trailers are available to book right now. Please check back later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Choose a trailer</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {trailers.map((trailer) => (
          <button
            key={trailer.id}
            onClick={() => onSelect(trailer)}
            className="card group flex flex-col overflow-hidden text-left transition-colors hover:border-[var(--color-border-strong)]"
          >
            <div className="relative aspect-[16/9] w-full bg-[var(--color-surface-raised)]">
              {trailer.photo_url ? (
                <Image
                  src={trailer.photo_url}
                  alt={trailer.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-faint)]">
                  No photo
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg font-semibold">{trailer.name}</span>
                <span className="whitespace-nowrap text-sm font-medium text-[var(--color-text-muted)]">
                  ${trailer.day_rate}/day
                </span>
              </div>
              {trailer.week_rate != null && (
                <p className="text-sm text-[var(--color-text-muted)]">
                  ${trailer.week_rate}/week
                </p>
              )}
              {trailer.description && (
                <p className="text-sm text-[var(--color-text-muted)]">{trailer.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
