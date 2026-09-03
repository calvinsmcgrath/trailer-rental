import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isAdminAuthed } from "@/lib/admin/guard";
import { updateTrailerSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = updateTrailerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const db = supabaseService();
  const { data: trailer, error } = await db
    .from("trailers")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update trailer." }, { status: 500 });
  }

  return NextResponse.json({ trailer });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = supabaseService();

  const { count, error: countError } = await db
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("trailer_id", id);

  if (countError) {
    return NextResponse.json({ error: "Failed to check booking history." }, { status: 500 });
  }

  if (count && count > 0) {
    return NextResponse.json(
      {
        error:
          "This trailer has booking history and can't be deleted — deactivate it instead.",
      },
      { status: 409 }
    );
  }

  const { error: deleteError } = await db.from("trailers").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: "Failed to delete trailer." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
