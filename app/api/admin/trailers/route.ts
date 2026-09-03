import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isAdminAuthed } from "@/lib/admin/guard";
import { createTrailerSchema } from "@/lib/validation";

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseService();
  const { data, error } = await db
    .from("trailers")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load trailers" }, { status: 500 });
  }
  return NextResponse.json({ trailers: data });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createTrailerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = supabaseService();

  const { data: maxSort } = await db
    .from("trailers")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: trailer, error } = await db
    .from("trailers")
    .insert({
      ...parsed.data,
      sort_order: (maxSort?.sort_order ?? -1) + 1,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create trailer." }, { status: 500 });
  }

  return NextResponse.json({ trailer });
}
