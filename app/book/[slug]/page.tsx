import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { supabasePublic } from "@/lib/supabase/public";
import { BookingWizard } from "./BookingWizard";
import type { PublicTrailer } from "@/lib/types";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== env.bookingSlug()) {
    notFound();
  }

  const supabase = supabasePublic();
  const { data: trailers } = await supabase
    .from("public_trailers")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <BookingWizard
      trailers={(trailers ?? []) as PublicTrailer[]}
      businessName={env.businessName()}
      standardHoursText={env.standardHoursText()}
    />
  );
}
