export function ContactStep({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  onBack,
  onContinue,
}: {
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const canContinue = name.trim().length > 0 && phone.trim().length >= 7;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
        ← Back to dates
      </button>
      <h1 className="text-lg font-semibold">Your contact info</h1>

      <div>
        <label className="label" htmlFor="customer-name">
          Full name
        </label>
        <input
          id="customer-name"
          className="input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Jane Smith"
          autoComplete="name"
        />
      </div>

      <div>
        <label className="label" htmlFor="customer-phone">
          Phone number
        </label>
        <input
          id="customer-phone"
          className="input"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="(555) 123-4567"
          type="tel"
          autoComplete="tel"
        />
      </div>

      <button className="btn btn-primary w-full" disabled={!canContinue} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
