import { assertAdminSlug, requireAdminSession } from "@/lib/admin/guard";
import { supabaseService } from "@/lib/supabase/service";
import { AdminNav } from "../_components/AdminNav";
import { TrailersClient } from "./TrailersClient";
import type { Trailer } from "@/lib/types";

export default async function AdminTrailersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  assertAdminSlug(slug);
  await requireAdminSession(slug);

  const db = supabaseService();
  const { data: trailers } = await db
    .from("trailers")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <AdminNav slug={slug} />
      <TrailersClient initialTrailers={(trailers ?? []) as Trailer[]} />
    </main>
  );
}
