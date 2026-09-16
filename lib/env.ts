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
  bookingWindowStart: () => process.env.BOOKING_WINDOW_START || "07:00",
  bookingWindowEnd: () => process.env.BOOKING_WINDOW_END || "21:00",
};
