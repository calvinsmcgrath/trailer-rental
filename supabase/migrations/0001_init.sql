-- Trailer Rental Booking App — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists btree_gist; -- lets the EXCLUDE constraint mix an equality column (trailer_id) with a range column

-- ---------------------------------------------------------------------------
-- trailers
-- ---------------------------------------------------------------------------
create table trailers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  day_rate    numeric(10,2) not null check (day_rate > 0),
  photo_url   text,
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table bookings (
  id                    uuid primary key default gen_random_uuid(),
  trailer_id            uuid not null references trailers(id) on delete restrict,

  customer_name         text not null,
  customer_phone        text not null,

  start_date            date not null,
  end_date              date not null, -- exclusive: nights = end_date - start_date
  price                 numeric(10,2) not null check (price >= 0),

  contract_signed_name  text not null,
  contract_signed_at    timestamptz not null default now(),
  signature_ip          text,
  signature_user_agent  text,

  is_manual             boolean not null default false, -- true = admin phoned this in on the customer's behalf
  is_block              boolean not null default false, -- true = admin-created hold (maintenance/personal use), not a real customer
  paid                  boolean not null default false,
  notes                 text not null default '',
  cancelled_at          timestamptz, -- null = active booking; set = soft-cancelled, frees the calendar, kept for history

  created_at            timestamptz not null default now(),

  constraint booking_min_one_night check (end_date > start_date),

  -- Prevents overlapping date ranges for the same trailer at the database level, even under
  -- concurrent submissions — this is the safety net an app-level availability check can't provide.
  -- Scoped to active (non-cancelled) bookings via the WHERE clause (a partial exclusion constraint).
  exclude using gist (
    trailer_id with =,
    daterange(start_date, end_date, '[)') with &&
  ) where (cancelled_at is null)
);

create index bookings_trailer_id_idx on bookings (trailer_id);
create index bookings_start_date_idx on bookings (start_date);

-- ---------------------------------------------------------------------------
-- admin login rate limiting (persisted so it survives across serverless invocations)
-- ---------------------------------------------------------------------------
create table admin_login_attempts (
  ip           text primary key,
  failed_count integer not null default 0,
  locked_until timestamptz,
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Public, column-limited view of active trailers for the customer-facing picker.
-- Views run with the privileges of their owner (not the querying role) by default in Postgres,
-- so granting anon SELECT on this view exposes exactly these columns/rows without granting any
-- access to the underlying trailers table (or to bookings) directly.
-- ---------------------------------------------------------------------------
create view public_trailers as
  select id, name, description, day_rate, photo_url, sort_order
  from trailers
  where active = true
  order by sort_order, name;

grant select on public_trailers to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table trailers enable row level security;
alter table bookings enable row level security;
alter table admin_login_attempts enable row level security;

-- No policies are defined for anon/authenticated on any of the three tables above, and all
-- privileges are explicitly revoked as a belt-and-suspenders measure:
--   - trailers:              browsers only ever read through the public_trailers view above.
--   - bookings:               zero direct access from the browser at all — every read/write
--                              (customer submit, availability lookup, admin dashboard) goes
--                              through a Next.js server route using the service_role key, which
--                              bypasses RLS by design. This also lets the server capture the
--                              signing IP/user-agent, which the browser can't be trusted to report.
--   - admin_login_attempts:   server-side only (login rate limiting).
revoke all on trailers from anon, authenticated;
revoke all on bookings from anon, authenticated;
revoke all on admin_login_attempts from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage bucket for trailer photos, uploaded by admin (via service_role) and
-- displayed publicly on the customer-facing picker.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('trailer-photos', 'trailer-photos', true)
on conflict (id) do nothing;
