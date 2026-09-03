import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";
import { env } from "@/lib/env";
import { formatDisplayDate } from "@/lib/date";
import { daysBetween } from "@/lib/pricing";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = supabaseService();

  const { data: booking } = await db
    .from("bookings")
    .select("*, trailer:trailers(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (!booking) {
    notFound();
  }

  const days = daysBetween(booking.start_date, booking.end_date);
  const trailerName = booking.trailer?.name ?? "Trailer";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      <div className="card space-y-5 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)]">
            ✓
          </div>
          <h1 className="text-lg font-semibold">Booking confirmed</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Please take a screenshot of this page for your records, and save this link — it&apos;s
            your only record of this booking.
          </p>
        </div>

        <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
          <Row label="Trailer" value={trailerName} />
          <Row label="Pickup" value={formatDisplayDate(booking.start_date)} />
          <Row label="Return" value={formatDisplayDate(booking.end_date)} />
          <Row label="Length" value={`${days} day${days === 1 ? "" : "s"}`} />
          <Row label="Total price" value={`$${Number(booking.price).toFixed(2)}`} />
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-text-muted)]">
          {env.standardHoursText()}
        </div>

        <p className="text-center text-xs text-[var(--color-text-faint)]">
          Booked under {booking.contract_signed_name}
        </p>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
