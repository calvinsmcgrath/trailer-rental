import { createClient } from "@supabase/supabase-js";

// Anon-key Supabase client, safe to use in the browser. RLS means this client
// can only ever read the public_trailers view (active trailers, limited columns) —
// it has zero access to the bookings table or the full trailers table.
export function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
