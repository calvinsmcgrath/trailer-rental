export function ContractStep({
  contractText,
  standardHoursText,
  agreed,
  signedName,
  submitting,
  errorMessage,
  onAgreedChange,
  onSignedNameChange,
  onBack,
  onSubmit,
}: {
  contractText: string;
  standardHoursText: string;
  agreed: boolean;
  signedName: string;
  submitting: boolean;
  errorMessage: string | null;
  onAgreedChange: (value: boolean) => void;
  onSignedNameChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const canSubmit = agreed && signedName.trim().length > 0 && !submitting;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        ← Back
      </button>
      <h1 className="text-lg font-semibold">Rental agreement</h1>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
        {standardHoursText}
      </div>

      <div className="card max-h-64 overflow-y-auto p-4 text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-muted)]">
        {contractText}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
        />
        <span>I have read and agree to the rental agreement above.</span>
      </label>

      <div>
        <label className="label" htmlFor="signature">
          Type your full legal name to sign
        </label>
        <input
          id="signature"
          className="input"
          value={signedName}
          onChange={(e) => onSignedNameChange(e.target.value)}
          placeholder="Full legal name"
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
          {errorMessage}
        </div>
      )}

      <button className="btn btn-primary w-full" disabled={!canSubmit} onClick={onSubmit}>
        {submitting ? "Booking…" : "Confirm booking"}
      </button>
    </div>
  );
}
