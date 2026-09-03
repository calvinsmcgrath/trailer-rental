import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabaseService } from "@/lib/supabase/service";
import { bookingRequestSchema } from "@/lib/validation";
import { nightsBetween, priceFor, MIN_NIGHTS } from "@/lib/pricing";
import { getClientIp } from "@/lib/http";

const EXCLUSION_VIOLATION = "23P01";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  if (nightsBetween(body.startDate, body.endDate) < MIN_NIGHTS) {
    return NextResponse.json(
      { error: `Minimum rental length is ${MIN_NIGHTS} night.` },
      { status: 400 }
    );
  }

  const db = supabaseService();

  const { data: trailer, error: trailerError } = await db
    .from("trailers")
    .select("id, day_rate, week_rate, active")
    .eq("id", body.trailerId)
    .maybeSingle();

  if (trailerError || !trailer || !trailer.active) {
    return NextResponse.json({ error: "This trailer is not available." }, { status: 400 });
  }

  const price = priceFor(trailer.day_rate, trailer.week_rate, body.startDate, body.endDate);

  const headersList = await headers();
  const signatureIp = getClientIp(headersList);
  const signatureUserAgent = headersList.get("user-agent") || "unknown";

  const { data: booking, error: insertError } = await db
    .from("bookings")
    .insert({
      trailer_id: body.trailerId,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      start_date: body.startDate,
      end_date: body.endDate,
      price,
      contract_signed_name: body.contractSignedName,
      signature_ip: signatureIp,
      signature_user_agent: signatureUserAgent,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === EXCLUSION_VIOLATION) {
      return NextResponse.json(
        { error: "Sorry, those dates were just booked by someone else. Please pick new dates." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }

  return NextResponse.json({ id: booking.id });
}
