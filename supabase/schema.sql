-- ============================================================
-- FlyDetector - Schema SQL Completo per Supabase
-- Copia e incolla questo script nell'SQL Editor di Supabase
-- ============================================================

-- 1. Rimuovi tabelle precedenti se esistono (sicuro per fresh install)
drop table if exists public.alert_logs cascade;
drop table if exists public.user_alerts cascade;
drop table if exists public.flights cascade;
drop table if exists public.profiles cascade;

-- 2. Tabella PROFILES (collegata agli utenti Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  country text default 'Italia',
  preferred_airlines text[] default '{}',
  email_notifications_enabled boolean default true,
  onboarding_completed boolean default false,
  updated_at timestamp with time zone default now()
);

-- 3. Tabella FLIGHTS (voli salvati dal Cron Job)
create table public.flights (
  id uuid primary key default gen_random_uuid(),
  origin varchar(3) not null,
  destination varchar(3) not null,
  airline varchar(100) not null,
  price numeric(10, 2) not null,
  currency varchar(3) default 'EUR',
  departure_date timestamp with time zone not null,
  return_date timestamp with time zone,
  booking_url text not null,
  is_last_minute boolean default false,
  found_at timestamp with time zone default now()
);

-- 4. Tabella USER_ALERTS (radar personalizzati degli utenti)
create table public.user_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  origin text,
  destination text,
  max_price numeric(10, 2),
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 5. Tabella ALERT_LOGS (anti-spam: traccia le email inviate)
create table public.alert_logs (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.user_alerts(id) on delete cascade not null,
  flight_id uuid references public.flights(id) on delete cascade not null,
  sent_at timestamp with time zone default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Protezione dei dati
-- ============================================================

alter table public.profiles enable row level security;
alter table public.flights enable row level security;
alter table public.user_alerts enable row level security;
alter table public.alert_logs enable row level security;

-- PROFILES: ogni utente vede e modifica solo il suo profilo
create policy "Utenti possono leggere il proprio profilo"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Utenti possono aggiornare il proprio profilo"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Utenti possono creare il proprio profilo"
  on public.profiles for insert
  with check (auth.uid() = id);

-- FLIGHTS: tutti gli utenti autenticati possono leggere i voli
create policy "Utenti autenticati possono leggere i voli"
  on public.flights for select
  using (auth.role() = 'authenticated');

-- I voli vengono scritti SOLO dal service_role (Cron Job lato server)
create policy "Solo service_role può scrivere i voli"
  on public.flights for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- USER_ALERTS: ogni utente gestisce solo i propri radar
create policy "Utenti gestiscono i propri radar"
  on public.user_alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ALERT_LOGS: ogni utente vede solo i propri log
create policy "Utenti leggono i propri log notifiche"
  on public.alert_logs for select
  using (
    exists (
      select 1 from public.user_alerts
      where public.user_alerts.id = public.alert_logs.alert_id
      and public.user_alerts.user_id = auth.uid()
    )
  );

-- I log vengono scritti SOLO dal service_role (Cron Job lato server)
create policy "Solo service_role può scrivere i log"
  on public.alert_logs for insert
  with check (auth.role() = 'service_role');

-- ============================================================
-- TRIGGER: Crea profilo automaticamente al signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, country, preferred_airlines, email_notifications_enabled, onboarding_completed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'country', 'Italia'),
    '{}',
    coalesce((new.raw_user_meta_data->>'email_notifications_enabled')::boolean, true),
    false
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ============================================================
-- INDICI: Ottimizzazione delle query più frequenti
-- ============================================================

create index idx_flights_route on public.flights(origin, destination);
create index idx_flights_price on public.flights(price);
create index idx_flights_found_at on public.flights(found_at desc);
create index idx_user_alerts_active on public.user_alerts(origin, destination, max_price) where is_active = true;
create index idx_alert_logs_spam_check on public.alert_logs(alert_id, flight_id, sent_at desc);
