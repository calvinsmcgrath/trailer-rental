# Trailer Rental Booking

A single-link booking flow for a small trailer rental business, plus a password-protected
admin page. Next.js (App Router) + Supabase (Postgres, RLS, Storage) + Vercel.

## What's built

- **Customer flow** at `/book/<BOOKING_SLUG>` — pick a trailer, pick dates (booked ranges
  disabled), enter contact info, agree to the rental contract and sign, get a bookmarkable
  confirmation page. No login, no payment.
- **Admin** at `/admin/<ADMIN_SLUG>` — single shared password, rate-limited login.
  - **Bookings** — upcoming/history tabs, paid/unpaid toggle, notes, cancel, and a manual
    "add booking" flow for phone-in customers or blocking dates for maintenance.
  - **Trailers** — add, edit, deactivate/reactivate, delete (blocked if the trailer has any
    booking history — deactivate instead), photo upload, manual sort order.
- Overlapping bookings for the same trailer are physically impossible at the database level
  (a Postgres `EXCLUDE` constraint), not just checked in the app before insert.
- Row Level Security is on for every table. The browser only ever talks to Supabase directly
  to read the public trailer list (via a column-limited view); every booking read/write and
  all admin operations go through Next.js server routes using the service-role key, which also
  lets the app capture the signing IP/user-agent server-side.

## One-time setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/0001_init.sql` (creates tables, the exclusion
   constraint, RLS, the public trailers view, the login-attempts table, and the
   `trailer-photos` storage bucket).
3. From **Project Settings → API**, copy the Project URL, `anon` public key, and
   `service_role` key into `.env.local`.

### 2. Environment variables

Copy `.env.local.example` → `.env.local` (a `.env.local` with freshly-generated
`ADMIN_SLUG`/`BOOKING_SLUG`/`SESSION_SECRET` already exists for local dev — just fill in the
three Supabase values). See that file for what each variable does.

### 3. Content you still need to provide

These currently ship with placeholder content — replace before real customers use this:

- **`lib/contract.ts`** — the actual rental agreement text.
- **`ADMIN_PASSWORD`**, **`STANDARD_HOURS_TEXT`** (env vars) — pick a real password; set the
  actual pickup/return hours shown on the contract step and confirmation page.
- **Trailer data** — once deployed, add your real trailers (name, description, day rate,
  photo) through the admin **Trailers** page. Nothing is seeded.

### 4. Run locally

```bash
npm install
npm run dev
```

Customer flow: `http://localhost:3000/book/<BOOKING_SLUG>`
Admin: `http://localhost:3000/admin/<ADMIN_SLUG>`

### 5. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel (or `vercel` CLI from this directory).
2. Add all the variables from `.env.local` as Vercel Project → Settings → Environment
   Variables (use fresh random values for `ADMIN_SLUG`, `BOOKING_SLUG`, and `SESSION_SECRET`
   in production rather than reusing the local dev ones — see below).
3. Deploy. The app ships on Vercel's default `your-project.vercel.app` subdomain — no custom
   domain needed to share the link with customers.
4. Share `https://your-project.vercel.app/book/<BOOKING_SLUG>` with your customers (pinned
   post, direct message, etc. — it's deliberately not linked from anywhere on the site) and
   keep `https://your-project.vercel.app/admin/<ADMIN_SLUG>` for yourself.

To generate fresh random values for `ADMIN_SLUG` / `BOOKING_SLUG` / `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(6).toString('hex'))"   # slug
openssl rand -base64 32                                                   # session secret
```

## Notes / known v1 tradeoffs

- No email/SMS notifications — the admin bookings list is the source of truth, checked
  manually.
- No payment processing — Venmo, handled outside the app. The `paid` toggle on each booking
  is just a manual flag for tracking what's owed.
- The upcoming/history split in the admin bookings list uses UTC "today" server-side, so the
  cutoff can be a few hours off from local time right around midnight.
- Admin login is a single shared password (env var) with IP-based rate limiting (5 attempts /
  15 min lockout), not a full auth provider — appropriate for a one-user admin page.
