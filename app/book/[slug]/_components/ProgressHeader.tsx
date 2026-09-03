const STEPS = ["Trailer", "Dates", "Contact", "Agreement"] as const;

export function ProgressHeader({ businessName, stepIndex }: { businessName: string; stepIndex: number }) {
  return (
    <div className="mb-6 space-y-3">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">{businessName}</p>
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
