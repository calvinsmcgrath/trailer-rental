-- Adds a "returned" flag to bookings so admin can track what's still out vs. back,
-- independent of the paid/unpaid flag.
alter table bookings add column returned boolean not null default false;
