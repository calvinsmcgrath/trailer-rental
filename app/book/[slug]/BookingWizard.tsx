"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import type { PublicTrailer } from "@/lib/types";
import { toDateOnly } from "@/lib/date";
import { CONTRACT_TEXT } from "@/lib/contract";
import { TrailerStep } from "./_components/TrailerStep";
import { DatesStep } from "./_components/DatesStep";
import { ContactStep } from "./_components/ContactStep";
import { ContractStep } from "./_components/ContractStep";
import { ProgressHeader } from "./_components/ProgressHeader";

type Step = "trailer" | "dates" | "contact" | "contract";
type BookedRange = { start_date: string; end_date: string };

const STEP_INDEX: Record<Step, number> = { trailer: 0, dates: 1, contact: 2, contract: 3 };

export function BookingWizard({
  trailers,
  businessName,
  standardHoursText,
}: {
  trailers: PublicTrailer[];
  businessName: string;
  standardHoursText: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("trailer");
  const [trailer, setTrailer] = useState<PublicTrailer | null>(null);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signedName, setSignedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  async function loadAvailability(t: PublicTrailer) {
    setLoadingAvailability(true);
    try {
      const res = await fetch(`/api/availability/${t.id}`);
      const json = await res.json();
      setBookedRanges(json.bookedRanges ?? []);
    } finally {
      setLoadingAvailability(false);
    }
  }

  async function handleSelectTrailer(t: PublicTrailer) {
    setTrailer(t);
    setRange(undefined);
    setDatesError(null);
    setStep("dates");
    await loadAvailability(t);
  }

  async function handleSubmit() {
    if (!trailer || !range?.from || !range?.to) return;
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
          customerName,
          customerPhone,
          contractAgreed: agreed,
          contractSignedName: signedName,
        }),
      });
      const json = await res.json();

      if (res.status === 409) {
        setDatesError(json.error);
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
          bookedRanges={bookedRanges}
          loadingAvailability={loadingAvailability}
          range={range}
          onRangeChange={(r) => {
            setRange(r);
            setDatesError(null);
          }}
          onBack={() => setStep("trailer")}
          onContinue={() => setStep("contact")}
          errorMessage={datesError}
        />
      )}

      {step === "contact" && (
        <ContactStep
          name={customerName}
          phone={customerPhone}
          onNameChange={setCustomerName}
          onPhoneChange={setCustomerPhone}
          onBack={() => setStep("dates")}
          onContinue={() => setStep("contract")}
        />
      )}

      {step === "contract" && (
        <ContractStep
          contractText={CONTRACT_TEXT}
          standardHoursText={standardHoursText}
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
