import { BackButton } from "@/components/BackButton";

export function ContractStep({
  contractText,
  pickupLabel,
  dropoffLabel,
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
  pickupLabel: string;
  dropoffLabel: string;
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
      <BackButton label="Change your contact info" onClick={onBack} />
      <h1 className="text-lg font-semibold">Rental agreement</h1>

      <div className="space-y-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[var(--color-text-muted)]">Pickup</span>
          <span className="text-right font-medium">{pickupLabel}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[var(--color-text-muted)]">Return by</span>
          <span className="text-right font-medium">{dropoffLabel}</span>
        </div>
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
