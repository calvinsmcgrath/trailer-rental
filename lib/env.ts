import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  adminPassword: () => required("ADMIN_PASSWORD"),
  adminSlug: () => required("ADMIN_SLUG"),
  bookingSlug: () => required("BOOKING_SLUG"),
  sessionSecret: () => required("SESSION_SECRET"),
  businessName: () => process.env.NEXT_PUBLIC_BUSINESS_NAME || "Trailer Rentals",
  standardHoursText: () =>
    process.env.STANDARD_HOURS_TEXT ||
    "Pickup after 2:00 PM · Return by 11:00 AM (placeholder — set STANDARD_HOURS_TEXT)",
};
