"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import type { PublicTrailer } from "@/lib/types";
import { toSpans, type AvailabilityBooking } from "@/lib/availability";
import { toDateOnly } from "@/lib/date";
import { formatDisplayDateTime } from "@/lib/hours";
import { CONTRACT_TEXT } from "@/lib/contract";
import { TrailerStep } from "./_components/TrailerStep";
import { DatesStep } from "./_components/DatesStep";
import { TimesStep } from "./_components/TimesStep";
import { ContactStep } from "./_components/ContactStep";
import { ContractStep } from "./_components/ContractStep";
import { ProgressHeader } from "./_components/ProgressHeader";

type Step = "trailer" | "dates" | "times" | "contact" | "contract";

const STEP_INDEX: Record<Step, number> = {
  trailer: 0,
  dates: 1,
  times: 2,
  contact: 3,
  contract: 4,
};

export function BookingWizard({
  trailers,
  businessName,
  windowStart,
  windowEnd,
}: {
  trailers: PublicTrailer[];
  businessName: string;
  windowStart: string;
  windowEnd: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("trailer");
  const [trailer, setTrailer] = useState<PublicTrailer | null>(null);
  const [bookings, setBookings] = useState<AvailabilityBooking[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [dropoffTime, setDropoffTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signedName, setSignedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  const spans = useMemo(() => toSpans(bookings), [bookings]);

  async function loadAvailability(t: PublicTrailer) {
    setLoadingAvailability(true);
    try {
      const res = await fetch(`/api/availability/${t.id}`);
      const json = await res.json();
      setBookings(json.bookings ?? []);
    } finally {
      setLoadingAvailability(false);
    }
  }

  async function handleSelectTrailer(t: PublicTrailer) {
    setTrailer(t);
    setRange(undefined);
    setPickupTime(null);
    setDropoffTime(null);
    setDatesError(null);
    setStep("dates");
    await loadAvailability(t);
  }

  function handleRangeChange(next: DateRange | undefined) {
    setRange(next);
    setPickupTime(null);
    setDropoffTime(null);
    setDatesError(null);
  }

  async function handleSubmit() {
    if (!trailer || !range?.from || !range?.to || !pickupTime || !dropoffTime) return;
    setSubmitting(true);
    setContractError(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trailerId: trailer.id,
          startDate: toDateOnly(range.from),
          endDate: toDateOnly(range.to),
          pickupTime,
          dropoffTime,
          customerName,
          customerPhone,
          contractAgreed: agreed,
          contractSignedName: signedName,
        }),
      });
      const json = await res.json();

      if (res.status === 409) {
        setDatesError(json.error);
        setPickupTime(null);
        setDropoffTime(null);
        setStep("dates");
        await loadAvailability(trailer);
        return;
      }
      if (!res.ok) {
        setContractError(json.error || "Something went wrong. Please try again.");
        return;
      }
      router.push(`/booking/${json.id}`);
    } catch {
      setContractError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className={`mx-auto flex min-h-dvh w-full flex-col px-4 py-8 ${
        step === "trailer" ? "max-w-4xl" : "max-w-2xl"
      }`}
    >
      <ProgressHeader businessName={businessName} stepIndex={STEP_INDEX[step]} />

      {step === "trailer" && <TrailerStep trailers={trailers} onSelect={handleSelectTrailer} />}

      {step === "dates" && trailer && (
        <DatesStep
          trailer={trailer}
          spans={spans}
          windowStart={windowStart}
          windowEnd={windowEnd}
          loadingAvailability={loadingAvailability}
          range={range}
          onRangeChange={handleRangeChange}
          onBack={() => setStep("trailer")}
          onContinue={() => setStep("times")}
          errorMessage={datesError}
        />
      )}

      {step === "times" && range?.from && range?.to && (
        <TimesStep
          pickupDate={toDateOnly(range.from)}
          dropoffDate={toDateOnly(range.to)}
          spans={spans}
          windowStart={windowStart}
          windowEnd={windowEnd}
          pickupTime={pickupTime}
          dropoffTime={dropoffTime}
          onPickupTimeChange={setPickupTime}
          onDropoffTimeChange={setDropoffTime}
          onBack={() => setStep("dates")}
          onContinue={() => setStep("contact")}
        />
      )}

      {step === "contact" && (
        <ContactStep
          name={customerName}
          phone={customerPhone}
          onNameChange={setCustomerName}
          onPhoneChange={setCustomerPhone}
          onBack={() => setStep("times")}
          onContinue={() => setStep("contract")}
        />
      )}

      {step === "contract" && range?.from && range?.to && pickupTime && dropoffTime && (
        <ContractStep
          contractText={CONTRACT_TEXT}
          pickupLabel={formatDisplayDateTime(toDateOnly(range.from), pickupTime)}
          dropoffLabel={formatDisplayDateTime(toDateOnly(range.to), dropoffTime)}
          agreed={agreed}
          signedName={signedName}
          submitting={submitting}
          errorMessage={contractError}
          onAgreedChange={setAgreed}
          onSignedNameChange={setSignedName}
          onBack={() => setStep("contact")}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  );
}
