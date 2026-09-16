// Pinned to the viewport rather than sitting in the step's flow, so it stays in
// the same place on every step of the booking wizard however tall the step is.
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="group fixed left-4 top-6 z-10 sm:left-6">
      <button
        onClick={onClick}
        aria-label={label}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-lg text-[var(--color-text-muted)] shadow-sm hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
      >
        ←
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-2 py-1 text-xs font-medium text-[var(--color-text)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}
