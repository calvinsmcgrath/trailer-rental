import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Service-role Supabase client. Bypasses Row Level Security entirely — this must
// never be imported into client-side code. Every booking read/write and every
// admin operation goes through this client from a server route, never directly
// from the browser.
export function supabaseService() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false },
  });
}
