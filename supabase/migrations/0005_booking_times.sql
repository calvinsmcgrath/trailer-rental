-- Adds the time of day a customer picks up and drops off the trailer, and
-- replaces the whole-day overlap guard with a timestamp-based one that allows
-- same-day turnover as long as a 3-hour buffer separates one booking's
-- drop-off from the next booking's pickup on the same trailer.
--
-- This deliberately reverses the trade-off documented in 0004: a trailer is no
-- longer unavailable for the whole of its return day.
--
-- Pricing is unaffected. start_date/end_date remain inclusive whole days and
-- stay the only inputs to lib/pricing.ts, so a booking costs the same whatever
-- times are chosen.

-- The defaults exist only to backfill existing rows; they are dropped again
-- below so every insert from here on supplies both explicitly, exactly like
-- start_date/end_date. 09:00/17:00 also keeps backfilled same-day rows valid
-- under the drop-off-after-pickup check added below.
alter table bookings
  add column pickup_time time not null default '09:00',
  add column dropoff_time time not null default '17:00';

alter table bookings
  alter column pickup_time drop default,
  alter column dropoff_time drop default;

alter table bookings add constraint booking_dropoff_after_pickup
  check (end_date > start_date or dropoff_time > pickup_time);

alter table bookings drop constraint bookings_no_overlap;

-- Padding only the tail of each booking's span by the buffer is what makes the
-- required gap symmetric: two padded spans [start, end + 3h) intersect
-- precisely when fewer than 3 hours separate one booking's drop-off from the
-- other's pickup, in whichever order the two fall. The half-open bound makes
-- the boundary exact — a 2:00 PM drop-off frees a 5:00 PM pickup, not 4:59 PM.
--
-- The 3 hours here is mirrored by BUFFER_MINUTES in lib/hours.ts, which is what
-- the booking UI filters its time slots with. Changing one means changing both.
alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    trailer_id with =,
    tsrange(
      start_date + pickup_time,
      end_date + dropoff_time + interval '3 hours',
      '[)'
    ) with &&
  ) where (cancelled_at is null);
