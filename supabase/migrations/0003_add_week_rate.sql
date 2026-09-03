-- Adds an optional weekly rate to trailers. When set, a rental gets billed at
-- this rate for every full 7-night block instead of 7x the day rate.
alter table trailers add column week_rate numeric(10,2) check (week_rate is null or week_rate > 0);

drop view public_trailers;
create view public_trailers as
  select id, name, description, day_rate, week_rate, photo_url, sort_order
  from trailers
  where active = true
  order by sort_order, name;

grant select on public_trailers to anon, authenticated;
