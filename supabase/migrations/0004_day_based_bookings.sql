-- Switches bookings from "nights" (end_date is an exclusive checkout day, the
-- day itself is NOT charged and is free for another booking to start on) to
-- "days" (end_date is the actual last day of use, inclusive, and is charged).
-- This allows a genuine single-day booking (start_date = end_date).
--
-- Trade-off: because end_date is now occupied, a trailer can no longer be
-- picked up by a different customer later on the same calendar day another
-- customer returns it — the earliest the next booking can start is the day
-- after the previous one's end_date.
--
-- One-time data fix: existing rows were stored under the old exclusive
-- convention, so end_date is shifted back a day here to preserve the same
-- real last-day-of-possession under the new inclusive convention. This keeps
-- the historical day count — and therefore the already-charged price, which
-- is stored separately and untouched by this migration — unchanged for every
-- existing booking.
update bookings set end_date = end_date - 1;

alter table bookings drop constraint booking_min_one_night;
alter table bookings add constraint booking_min_one_day check (end_date >= start_date);

-- The original exclusion constraint was left unnamed, so find it dynamically.
do $$
declare
  excl_name text;
begin
  select conname into excl_name
  from pg_constraint
  where conrelid = 'bookings'::regclass and contype = 'x';

  if excl_name is not null then
    execute format('alter table bookings drop constraint %I', excl_name);
  end if;
end $$;

alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    trailer_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (cancelled_at is null);
