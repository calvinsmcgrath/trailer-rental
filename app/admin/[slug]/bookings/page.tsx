import { assertAdminSlug, requireAdminSession } from "@/lib/admin/guard";
import { supabaseService } from "@/lib/supabase/service";
import { toDateOnly } from "@/lib/date";
import { AdminNav } from "../_components/AdminNav";
import { BookingsClient } from "./BookingsClient";
import type { BookingWithTrailer, Trailer } from "@/lib/types";

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  assertAdminSlug(slug);
  await requireAdminSession(slug);

  const db = supabaseService();
  const today = toDateOnly(new Date());

  const [{ data: bookings }, { data: trailers }] = await Promise.all([
    db
      .from("bookings")
      .select("*, trailer:trailers(id, name)")
      .is("cancelled_at", null)
      .gte("end_date", today)
      .order("start_date", { ascending: true }),
    db.from("trailers").select("*").eq("active", true).order("sort_order", { ascending: true }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <AdminNav slug={slug} />
      <BookingsClient
        initialBookings={(bookings ?? []) as BookingWithTrailer[]}
        activeTrailers={(trailers ?? []) as Trailer[]}
      />
    </main>
  );
}
