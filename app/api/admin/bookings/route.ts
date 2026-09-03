import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isAdminAuthed } from "@/lib/admin/guard";
import { manualBookingSchema } from "@/lib/validation";
import { nightsBetween, priceFor, MIN_NIGHTS } from "@/lib/pricing";
import { toDateOnly } from "@/lib/date";

const EXCLUSION_VIOLATION = "23P01";

export async function GET(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = new URL(request.url).searchParams.get("scope") === "history" ? "history" : "upcoming";
  const today = toDateOnly(new Date());
  const db = supabaseService();

  let query = db.from("bookings").select("*, trailer:trailers(id, name)");
  if (scope === "upcoming") {
    query = query.is("cancelled_at", null).gte("end_date", today).order("start_date", { ascending: true });
  } else {
    query = query
      .or(`cancelled_at.not.is.null,end_date.lt.${today}`)
      .order("start_date", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
  return NextResponse.json({ bookings: data });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = manualBookingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  if (nightsBetween(body.startDate, body.endDate) < MIN_NIGHTS) {
    return NextResponse.json(
      { error: `Minimum length is ${MIN_NIGHTS} night.` },
      { status: 400 }
    );
  }

  const db = supabaseService();
  const { data: trailer } = await db
    .from("trailers")
    .select("id, day_rate")
    .eq("id", body.trailerId)
    .maybeSingle();

  if (!trailer) {
    return NextResponse.json({ error: "Trailer not found." }, { status: 400 });
  }

  const price = body.isBlock ? 0 : priceFor(trailer.day_rate, body.startDate, body.endDate);
  const signerName = body.customerName || (body.isBlock ? "Blocked" : "Manual booking");

  const { data: booking, error: insertError } = await db
    .from("bookings")
    .insert({
      trailer_id: body.trailerId,
      customer_name: signerName,
      customer_phone: body.customerPhone,
      start_date: body.startDate,
      end_date: body.endDate,
      price,
      contract_signed_name: signerName,
      is_manual: true,
      is_block: body.isBlock,
      notes: body.notes,
      paid: body.isBlock,
    })
    .select("*, trailer:trailers(id, name)")
    .single();

  if (insertError) {
    if (insertError.code === EXCLUSION_VIOLATION) {
      return NextResponse.json(
        { error: "Those dates overlap an existing booking for this trailer." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }

  return NextResponse.json({ booking });
}
