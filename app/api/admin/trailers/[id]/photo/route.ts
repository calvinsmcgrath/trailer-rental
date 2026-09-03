import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { isAdminAuthed } from "@/lib/admin/guard";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("photo");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No photo provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo must be 5MB or smaller." }, { status: 400 });
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Photo must be JPG, PNG, or WebP." }, { status: 400 });
  }

  const db = supabaseService();
  const path = `${id}-${Date.now()}.${extension}`;

  const { error: uploadError } = await db.storage
    .from("trailer-photos")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: "Failed to upload photo." }, { status: 500 });
  }

  const { data: publicUrlData } = db.storage.from("trailer-photos").getPublicUrl(path);

  const { data: trailer, error: updateError } = await db
    .from("trailers")
    .update({ photo_url: publicUrlData.publicUrl })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json({ error: "Photo uploaded but failed to save." }, { status: 500 });
  }

  return NextResponse.json({ trailer });
}
