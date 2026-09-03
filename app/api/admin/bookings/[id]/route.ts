import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/service";
import { isAdminAuthed } from "@/lib/admin/guard";

const patchSchema = z.object({
  paid: z.boolean().optional(),
  returned: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  cancel: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.paid !== undefined) update.paid = parsed.data.paid;
  if (parsed.data.returned !== undefined) update.returned = parsed.data.returned;
  if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;
  if (parsed.data.cancel) update.cancelled_at = new Date().toISOString();

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const db = supabaseService();
  const { data: booking, error } = await db
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select("*, trailer:trailers(id, name)")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update booking." }, { status: 500 });
  }

  return NextResponse.json({ booking });
}
