import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ trailerId: string }> }
) {
  const { trailerId } = await params;
  const db = supabaseService();

  const { data, error } = await db
    .from("bookings")
    .select("start_date, end_date")
    .eq("trailer_id", trailerId)
    .is("cancelled_at", null);

  if (error) {
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }

  return NextResponse.json({ bookedRanges: data });
}
