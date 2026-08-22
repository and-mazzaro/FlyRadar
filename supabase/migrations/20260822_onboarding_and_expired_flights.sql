-- Apply this migration to an existing FlyDetector database.

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Existing accounts have already passed through the old preference flow.
update public.profiles
set onboarding_completed = true
where onboarding_completed = false;

-- Expired flights are removed by the API before they are returned. This index
-- keeps that cleanup query efficient as the feed grows.
create index if not exists idx_flights_departure_date
  on public.flights(departure_date);
