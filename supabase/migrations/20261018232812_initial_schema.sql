-- Initial schema of Glow (issue #17).
-- Tables, columns and rules: docs/<subject>/dados.md and docs/acesso/autenticacao.md.
-- Conventions (names, types, RLS, deletion): docs/padroes/banco.md.
-- Multi-table write functions (create_appointment, save_service, ...) come later,
-- each in its own migration, with the feature that calls it.


-- 1. Enumerated types --------------------------------------------------------

create type public.permission_key as enum (
  'dashboard', 'appointments', 'services', 'clients', 'staff', 'settings'
);
create type public.vehicle_type as enum ('hatch', 'sedan', 'suv', 'pickup');
create type public.vehicle_size as enum ('small', 'medium', 'large', 'extra_large');
create type public.service_type as enum ('main', 'additional', 'complementary');
create type public.pricing_mode as enum ('fixed', 'by_size');
create type public.payment_method as enum ('credit', 'debit', 'pix', 'cash');
create type public.appointment_status as enum (
  'scheduled', 'checked_in', 'in_progress', 'awaiting_payment', 'completed', 'cancelled', 'rescheduled'
);


-- 2. updated_at, used by the optimistic concurrency control (RNF011) ---------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- 3. Tables --------------------------------------------------------------------

-- Staff (docs/equipe/dados.md)

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_roles_name on public.roles (lower(name));

create table public.role_permissions (
  role_id uuid not null,
  permission_key public.permission_key not null,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_key),
  constraint fk_role_permissions_role_id foreign key (role_id)
    references public.roles (id) on delete cascade
);

create table public.staff (
  id uuid primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  role_id uuid,
  job_title text,
  is_admin boolean not null default false,
  is_active boolean not null default true,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_staff_id foreign key (id) references auth.users (id) on delete restrict,
  constraint fk_staff_role_id foreign key (role_id) references public.roles (id) on delete restrict,
  constraint uq_staff_email unique (email),
  constraint ck_staff_email check (email = lower(email) and email !~ '\s'),
  -- The admin account has no role; every other account has one (RN024, RN027).
  constraint ck_staff_role_id check (
    (is_admin and role_id is null) or (not is_admin and role_id is not null)
  )
);

-- At most one admin account (RN027).
create unique index uq_staff_is_admin on public.staff (is_admin) where is_admin;

-- Clients and vehicles (docs/clientes/dados.md)

-- No foreign key to auth.users: deleting a client removes the Auth account.
create table public.clients (
  id uuid primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  must_change_password boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_clients_email check (email = lower(email) and email !~ '\s')
);

-- The e-mail is unique among clients that were not deleted (RN022, RN030).
create unique index uq_clients_email on public.clients (email) where deleted_at is null;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  type public.vehicle_type not null,
  -- The size is derived from the type and never written by the application (RN002).
  size public.vehicle_size not null generated always as (
    case type
      when 'hatch' then 'small'::public.vehicle_size
      when 'sedan' then 'medium'::public.vehicle_size
      when 'suv' then 'large'::public.vehicle_size
      when 'pickup' then 'extra_large'::public.vehicle_size
    end
  ) stored,
  plate text not null,
  brand text not null,
  model text not null,
  color text not null,
  year smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_vehicles_plate unique (plate),
  -- Upper case and no hyphen, Mercosul (ABC1D23) or old (ABC1234) pattern (RN035, RN036).
  constraint ck_vehicles_plate check (plate ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),
  constraint ck_vehicles_year check (year >= 1886)
);

create table public.client_vehicles (
  client_id uuid not null,
  vehicle_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (client_id, vehicle_id),
  constraint fk_client_vehicles_client_id foreign key (client_id)
    references public.clients (id) on delete restrict,
  constraint fk_client_vehicles_vehicle_id foreign key (vehicle_id)
    references public.vehicles (id) on delete restrict
);

-- Catalog (docs/catalogo/dados.md)

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_categories_name on public.categories (lower(name));

create table public.services (
  id uuid primary key default gen_random_uuid(),
  type public.service_type not null,
  category_id uuid,
  name text not null,
  description text,
  image_path text,
  avg_duration_minutes integer not null,
  pricing_mode public.pricing_mode not null,
  fixed_price numeric(10, 2),
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_services_category_id foreign key (category_id)
    references public.categories (id) on delete restrict,
  constraint ck_services_avg_duration_minutes check (avg_duration_minutes between 5 and 2400),
  constraint ck_services_fixed_price check (fixed_price > 0),
  constraint ck_services_pricing check ((pricing_mode = 'fixed') = (fixed_price is not null)),
  -- Main and complementary services need a category and a description; an additional
  -- service has no category, description or image and always has a fixed price (RN006, RN007, RN009).
  constraint ck_services_type_fields check (
    case type
      when 'additional' then
        category_id is null and description is null and image_path is null and pricing_mode = 'fixed'
      else
        category_id is not null and description is not null
    end
  )
);

-- The name is unique among services that were not deleted, ignoring case (RN030, RN035).
create unique index uq_services_name on public.services (lower(name)) where deleted_at is null;

create table public.service_prices (
  service_id uuid not null,
  size public.vehicle_size not null,
  price numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  primary key (service_id, size),
  constraint fk_service_prices_service_id foreign key (service_id)
    references public.services (id) on delete cascade,
  constraint ck_service_prices_price check (price > 0)
);

create table public.service_additionals (
  main_service_id uuid not null,
  additional_service_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (main_service_id, additional_service_id),
  constraint fk_service_additionals_main_service_id foreign key (main_service_id)
    references public.services (id) on delete cascade,
  constraint fk_service_additionals_additional_service_id foreign key (additional_service_id)
    references public.services (id) on delete cascade
);

-- Settings (docs/configuracoes/dados.md)

create table public.business_settings (
  id smallint primary key default 1,
  company_name text not null,
  cnpj text,
  email text,
  phone text,
  address text,
  instagram_url text,
  facebook_url text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_business_settings_id check (id = 1)
);

create table public.business_hours (
  weekday smallint primary key,
  is_open boolean not null,
  opens_at time,
  closes_at time,
  break_starts_at time,
  break_ends_at time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_business_hours_weekday check (weekday between 0 and 6),
  -- Opening and closing times if and only if the day is open; a closed day has no break (RN013).
  constraint ck_business_hours_open check (
    (is_open and opens_at is not null and closes_at is not null)
    or (
      not is_open and opens_at is null and closes_at is null
      and break_starts_at is null and break_ends_at is null
    )
  ),
  constraint ck_business_hours_closes_at check (closes_at > opens_at),
  -- The break has a start and an end and stays within the working hours.
  constraint ck_business_hours_break check (
    (break_starts_at is null and break_ends_at is null)
    or (
      break_starts_at is not null and break_ends_at is not null
      and break_starts_at >= opens_at and break_ends_at > break_starts_at and break_ends_at <= closes_at
    )
  ),
  -- Every time ends in 00 or 30 minutes (RN035).
  constraint ck_business_hours_half_hour check (
    mod(extract(epoch from opens_at), 1800) = 0
    and mod(extract(epoch from closes_at), 1800) = 0
    and mod(extract(epoch from break_starts_at), 1800) = 0
    and mod(extract(epoch from break_ends_at), 1800) = 0
  )
);

create table public.payment_fees (
  payment_method public.payment_method primary key,
  -- Positive for a surcharge, negative for a discount, zero for no adjustment (RN012).
  percent numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_payment_fees_percent check (percent between -100 and 100)
);

-- Access (docs/acesso/autenticacao.md)

create table public.login_attempts (
  email text primary key,
  failed_count integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_login_attempts_failed_count check (failed_count >= 0),
  constraint ck_login_attempts_email check (email = lower(email) and email !~ '\s')
);

-- Appointments (docs/agendamento/dados.md)

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  vehicle_id uuid not null,
  created_by_staff_id uuid,
  rescheduled_from_id uuid,
  scheduled_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  payment_method public.payment_method not null,
  subtotal numeric(10, 2) not null,
  fee_percent numeric(5, 2) not null,
  total numeric(10, 2) not null,
  estimated_duration_minutes integer not null,
  estimated_end_at timestamptz not null,
  -- Copies of the client and vehicle data when the appointment was registered or last edited (RN037).
  client_name text not null,
  vehicle_plate text not null,
  vehicle_type public.vehicle_type not null,
  vehicle_size public.vehicle_size not null,
  vehicle_brand text not null,
  vehicle_model text not null,
  vehicle_color text not null,
  vehicle_year smallint not null,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_appointments_client_id_vehicle_id foreign key (client_id, vehicle_id)
    references public.client_vehicles (client_id, vehicle_id) on delete restrict,
  constraint fk_appointments_created_by_staff_id foreign key (created_by_staff_id)
    references public.staff (id) on delete restrict,
  constraint fk_appointments_rescheduled_from_id foreign key (rescheduled_from_id)
    references public.appointments (id) on delete restrict,
  -- An appointment originates at most one rescheduled appointment (RN020).
  constraint uq_appointments_rescheduled_from_id unique (rescheduled_from_id),
  constraint ck_appointments_subtotal check (subtotal > 0),
  constraint ck_appointments_fee_percent check (fee_percent between -100 and 100),
  -- The total may be zero, with a 100% discount (RN010).
  constraint ck_appointments_total check (total >= 0),
  constraint ck_appointments_estimated_duration_minutes check (estimated_duration_minutes > 0),
  constraint ck_appointments_estimated_end_at check (estimated_end_at >= scheduled_at),
  -- Payment time only when paid, cancellation time only when cancelled (RN017).
  constraint ck_appointments_completed_at check (
    (completed_at is not null) = (status in ('completed', 'rescheduled'))
  ),
  constraint ck_appointments_cancelled_at check ((cancelled_at is not null) = (status = 'cancelled'))
);

create table public.appointment_services (
  appointment_id uuid not null,
  service_id uuid not null,
  -- Copies of the service when the appointment was registered or last edited (RN037).
  service_name text not null,
  service_type public.service_type not null,
  price numeric(10, 2) not null,
  duration_minutes integer not null,
  created_at timestamptz not null default now(),
  primary key (appointment_id, service_id),
  constraint fk_appointment_services_appointment_id foreign key (appointment_id)
    references public.appointments (id) on delete restrict,
  constraint fk_appointment_services_service_id foreign key (service_id)
    references public.services (id) on delete restrict,
  constraint ck_appointment_services_price check (price > 0),
  constraint ck_appointment_services_duration_minutes check (duration_minutes > 0)
);


-- 4. Rules across rows or columns that cannot change ---------------------------
-- A trigger that rejects a write raises a check violation named after the rule,
-- so the repository converts it like any other constraint (docs/padroes/banco.md).

-- The type of a service never changes (RN006).
create function public.prevent_service_type_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.type is distinct from old.type then
    raise exception 'The type of a service cannot be changed.'
      using errcode = 'check_violation', constraint = 'ck_services_type_unchanged',
        schema = 'public', table = 'services';
  end if;
  return new;
end;
$$;

create trigger trg_services_type_unchanged
  before update of type on public.services
  for each row execute function public.prevent_service_type_change();

-- A service priced by size has exactly the four prices, and a fixed-price service has none
-- (RN009). Checked at commit, so the service and its prices are written in one transaction.
create function public.check_service_prices_complete()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  service_ids uuid[];
  checked_id uuid;
  mode public.pricing_mode;
  price_count integer;
begin
  if tg_table_name = 'services' then
    service_ids := array[new.id];
  elsif tg_op = 'INSERT' then
    service_ids := array[new.service_id];
  elsif tg_op = 'DELETE' then
    service_ids := array[old.service_id];
  else
    service_ids := array[old.service_id, new.service_id];
  end if;

  foreach checked_id in array service_ids loop
    select s.pricing_mode into mode from public.services s where s.id = checked_id;
    -- A service removed in the same transaction takes its prices with it.
    continue when not found;

    select count(*) into price_count from public.service_prices p where p.service_id = checked_id;
    if (mode = 'by_size' and price_count <> 4) or (mode = 'fixed' and price_count <> 0) then
      raise exception 'A service priced by size needs the four prices, and a fixed-price service none.'
        using errcode = 'check_violation', constraint = 'ck_service_prices_complete',
          schema = 'public', table = 'service_prices';
    end if;
  end loop;

  return null;
end;
$$;

create constraint trigger trg_services_prices_complete
  after insert or update of pricing_mode on public.services
  deferrable initially deferred
  for each row execute function public.check_service_prices_complete();

create constraint trigger trg_service_prices_complete
  after insert or update or delete on public.service_prices
  deferrable initially deferred
  for each row execute function public.check_service_prices_complete();

-- The first service of the link is a main service, and the second an additional one (RN006).
create function public.check_service_additional_types()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- A missing service is left to the foreign keys.
  if exists (
    select 1 from public.services s where s.id = new.main_service_id and s.type <> 'main'
  ) or exists (
    select 1 from public.services s where s.id = new.additional_service_id and s.type <> 'additional'
  ) then
    raise exception 'An additional service is linked only to a main service.'
      using errcode = 'check_violation', constraint = 'ck_service_additionals_types',
        schema = 'public', table = 'service_additionals';
  end if;
  return new;
end;
$$;

create trigger trg_service_additionals_types
  before insert or update on public.service_additionals
  for each row execute function public.check_service_additional_types();


-- 5. updated_at on every editable table ----------------------------------------

create trigger trg_roles_updated_at before update on public.roles
  for each row execute function public.set_updated_at();
create trigger trg_staff_updated_at before update on public.staff
  for each row execute function public.set_updated_at();
create trigger trg_clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger trg_vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger trg_services_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger trg_business_settings_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();
create trigger trg_business_hours_updated_at before update on public.business_hours
  for each row execute function public.set_updated_at();
create trigger trg_payment_fees_updated_at before update on public.payment_fees
  for each row execute function public.set_updated_at();
create trigger trg_login_attempts_updated_at before update on public.login_attempts
  for each row execute function public.set_updated_at();
create trigger trg_appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();


-- 6. Indexes for frequent queries on growing tables (see the dados.md files) ----

create index idx_client_vehicles_vehicle_id on public.client_vehicles (vehicle_id);
create index idx_appointments_scheduled_at on public.appointments (scheduled_at);
create index idx_appointments_client_id_scheduled_at on public.appointments (client_id, scheduled_at);
create index idx_appointments_vehicle_id on public.appointments (vehicle_id);
create index idx_appointments_completed_at on public.appointments (completed_at)
  where completed_at is not null;


-- 7. Access: only the backend, with the service key, reads and writes ----------
-- RLS on with no policies (decision 0005), and no privileges for the public
-- roles even if RLS is turned off by mistake (decision 0042).

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.staff enable row level security;
alter table public.clients enable row level security;
alter table public.vehicles enable row level security;
alter table public.client_vehicles enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.service_prices enable row level security;
alter table public.service_additionals enable row level security;
alter table public.business_settings enable row level security;
alter table public.business_hours enable row level security;
alter table public.payment_fees enable row level security;
alter table public.login_attempts enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated;

grant select, insert, update, delete on all tables in schema public to service_role;


-- 8. Storage bucket for the service images (decision 0044) --------------------
-- Public read; with no policies on storage.objects, only the service key writes.
-- The API also checks the files before sending them (RS015).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('service-images', 'service-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
