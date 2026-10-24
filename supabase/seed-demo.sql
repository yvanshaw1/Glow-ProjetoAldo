-- Fictitious demo data for the catalog and the dashboard (docs/plataforma/infraestrutura.md).
-- Optional: load it after the migration and seed.sql, pasting it into the SQL Editor.
-- Every id derives from a fixed key, so loading it again duplicates nothing: it only adds
-- appointments to the days that have none yet. Appointment dates are relative to the load
-- day, in the company time zone (APP_TIMEZONE, America/Maceio). Only fictitious data:
-- e-mails at example.com (RFC 2606), phones (82) 90000-00NN and plates starting with GLW.

begin;

-- Helpers, dropped at the end of the session -----------------------------------

create or replace function pg_temp.glow_demo_id(key text)
returns uuid
language sql
immutable
as $$
  select md5('glow-demo:' || key)::uuid
$$;

-- A deterministic number from 0 to 2^28 - 1, used to vary the generated data.
create or replace function pg_temp.glow_demo_number(key text)
returns integer
language sql
immutable
as $$
  select ('x' || substr(md5('glow-demo:' || key), 1, 7))::bit(28)::integer
$$;

-- Expected end: the duration counts only the working periods of business_hours,
-- skipping the break, the night and the closed days (RN034).
create or replace function pg_temp.glow_demo_end_at(start_at timestamptz, minutes integer)
returns timestamptz
language plpgsql
as $$
declare
  remaining integer := minutes;
  work_day date := (start_at at time zone 'America/Maceio')::date;
  from_time time := (start_at at time zone 'America/Maceio')::time;
  opening public.business_hours;
  starts time[];
  ends time[];
  segment_start time;
  available integer;
begin
  for attempt in 1 .. 60 loop
    select * into opening from public.business_hours where weekday = extract(dow from work_day);
    if opening.is_open then
      if opening.break_starts_at is null then
        starts := array[opening.opens_at];
        ends := array[opening.closes_at];
      else
        starts := array[opening.opens_at, opening.break_ends_at];
        ends := array[opening.break_starts_at, opening.closes_at];
      end if;
      for i in 1 .. array_length(starts, 1) loop
        segment_start := greatest(starts[i], from_time);
        if segment_start < ends[i] then
          available := extract(epoch from ends[i] - segment_start)::integer / 60;
          if remaining <= available then
            return (work_day + segment_start + make_interval(mins => remaining)) at time zone 'America/Maceio';
          end if;
          remaining := remaining - available;
        end if;
      end loop;
    end if;
    work_day := work_day + 1;
    from_time := '00:00';
  end loop;
  raise exception 'business_hours has no open day for the demo appointments';
end;
$$;

-- Adds one appointment with its services and copies (RN037), with the status that suits
-- its date; returns the status, or null when the appointment already exists.
create or replace function pg_temp.glow_demo_add_appointment(
  appointment_id uuid,
  client_id uuid,
  vehicle_id uuid,
  rescheduled_from_id uuid,
  scheduled_at timestamptz,
  service_names text[],
  may_reschedule boolean,
  booked_at timestamptz
)
returns public.appointment_status
language plpgsql
as $$
declare
  now_at timestamptz := now();
  today date := (now() at time zone 'America/Maceio')::date;
  local_day date := (scheduled_at at time zone 'America/Maceio')::date;
  draw integer := pg_temp.glow_demo_number(appointment_id::text || ':status') % 100;
  payment_draw integer := pg_temp.glow_demo_number(appointment_id::text || ':payment') % 100;
  client public.clients;
  vehicle public.vehicles;
  duration integer;
  subtotal numeric(10, 2);
  method public.payment_method;
  fee numeric(5, 2);
  end_at timestamptz;
  status public.appointment_status;
  created timestamptz;
  completed timestamptz;
  cancelled timestamptz;
  inserted integer;
begin
  select * into client from public.clients c where c.id = client_id;
  select * into vehicle from public.vehicles v where v.id = vehicle_id;

  -- Price by the vehicle size or fixed, and the sum of the average durations (RN009, RN010, RN014).
  select sum(s.avg_duration_minutes), sum(coalesce(s.fixed_price, p.price))
    into duration, subtotal
  from unnest(service_names) as n(name)
  join public.services s on s.id = pg_temp.glow_demo_id('service:' || n.name)
  left join public.service_prices p on p.service_id = s.id and p.size = vehicle.size;

  method := case
    when payment_draw < 45 then 'pix'
    when payment_draw < 75 then 'credit'
    when payment_draw < 90 then 'debit'
    else 'cash'
  end;
  select f.percent into fee from public.payment_fees f where f.payment_method = method;

  end_at := pg_temp.glow_demo_end_at(scheduled_at, duration);
  created := coalesce(
    booked_at,
    least(scheduled_at - make_interval(days => 1 + draw % 6), now_at - make_interval(hours => 1 + draw % 24))
  );

  if scheduled_at > now_at then
    status := case when draw < 5 then 'cancelled' else 'scheduled' end;
  elsif local_day = today then
    if now_at < end_at then
      status := case when draw % 2 = 0 then 'checked_in' else 'in_progress' end;
    else
      status := case when draw % 2 = 0 then 'awaiting_payment' else 'completed' end;
    end if;
  elsif end_at + interval '10 minutes' > now_at then
    status := 'in_progress';
  elsif draw < 10 then
    status := 'cancelled';
  elsif draw < 15 and may_reschedule then
    status := 'rescheduled';
  else
    status := 'completed';
  end if;

  if status in ('completed', 'rescheduled') then
    completed := least(end_at + interval '10 minutes', now_at);
  elsif status = 'cancelled' then
    cancelled := least(created + (scheduled_at - created) / 2, now_at);
  end if;

  insert into public.appointments (
    id, client_id, vehicle_id, rescheduled_from_id, scheduled_at, status, payment_method,
    subtotal, fee_percent, total, estimated_duration_minutes, estimated_end_at,
    client_name, vehicle_plate, vehicle_type, vehicle_size, vehicle_brand, vehicle_model,
    vehicle_color, vehicle_year, completed_at, cancelled_at, created_at, updated_at
  )
  values (
    appointment_id, client_id, vehicle_id, rescheduled_from_id, scheduled_at, status, method,
    subtotal, fee, round(subtotal * (100 + fee) / 100, 2), duration, end_at,
    client.first_name || ' ' || client.last_name, vehicle.plate, vehicle.type, vehicle.size,
    vehicle.brand, vehicle.model, vehicle.color, vehicle.year, completed, cancelled, created,
    coalesce(completed, cancelled, case when status = 'scheduled' then created else least(scheduled_at, now_at) end)
  )
  on conflict do nothing;

  get diagnostics inserted = row_count;
  if inserted = 0 then
    return null;
  end if;

  insert into public.appointment_services (
    appointment_id, service_id, service_name, service_type, price, duration_minutes, created_at
  )
  select appointment_id, s.id, s.name, s.type, coalesce(s.fixed_price, p.price), s.avg_duration_minutes, created
  from unnest(service_names) as n(name)
  join public.services s on s.id = pg_temp.glow_demo_id('service:' || n.name)
  left join public.service_prices p on p.service_id = s.id and p.size = vehicle.size
  on conflict do nothing;

  return status;
end;
$$;

-- Catalog (RN006 to RN009, RN030, RN031) ---------------------------------------

insert into public.categories (id, name, description, is_active, created_at, updated_at)
select pg_temp.glow_demo_id('category:' || c.name), c.name, c.description, c.is_active,
  now() - interval '120 days', now() - interval '120 days'
from (values
  ('Lavagem', 'Lavagens externas e internas, da manutenção semanal à limpeza detalhada.', true),
  ('Polimento e proteção', 'Correção de pintura, polimento e proteção com cera, selante ou vitrificação.', true),
  ('Higienização', 'Limpeza profunda do interior: bancos, carpetes, teto e ar-condicionado.', true),
  ('Película e envelopamento', 'Películas de controle solar e envelopamento da carroceria.', false)
) as c(name, description, is_active)
on conflict do nothing;

-- Prices in reais: the fixed price, or small, medium, large and extra large (P, M, G, GG).
create temporary table glow_demo_services (
  name text,
  type public.service_type,
  category text,
  description text,
  minutes integer,
  fixed numeric(10, 2),
  small numeric(10, 2),
  medium numeric(10, 2),
  large numeric(10, 2),
  extra_large numeric(10, 2),
  is_active boolean,
  is_deleted boolean
) on commit drop;

insert into glow_demo_services values
  ('Lavagem simples', 'main', 'Lavagem',
    'Lavagem externa com shampoo neutro, aspiração interna e limpeza dos vidros.',
    40, null, 40, 50, 60, 70, true, false),
  ('Lavagem completa', 'main', 'Lavagem',
    'Lavagem externa e interna detalhada, com limpeza de painel, portas, rodas e caixas de roda.',
    90, null, 70, 85, 100, 120, true, false),
  ('Lavagem técnica', 'main', 'Lavagem',
    'Lavagem minuciosa com descontaminação da pintura e limpeza de frisos, emblemas e rodas.',
    180, null, 160, 190, 220, 260, true, false),
  ('Polimento comercial', 'main', 'Polimento e proteção',
    'Polimento em uma etapa que remove riscos leves e manchas e devolve o brilho da pintura.',
    240, null, 280, 330, 390, 450, true, false),
  ('Polimento técnico', 'main', 'Polimento e proteção',
    'Correção de pintura em várias etapas, para riscos e marcas mais profundos.',
    480, null, 550, 650, 750, 850, true, false),
  ('Vitrificação de pintura', 'main', 'Polimento e proteção',
    'Polimento seguido de proteção cerâmica, que repele água e sujeira por até três anos.',
    900, null, 1100, 1300, 1500, 1700, true, false),
  ('Higienização interna completa', 'main', 'Higienização',
    'Limpeza profunda de bancos, carpetes, teto e portas, com extração e secagem.',
    300, null, 280, 330, 380, 450, true, false),
  ('Película nos vidros', 'main', 'Película e envelopamento',
    'Aplicação de película de controle solar nos vidros laterais e traseiro.',
    180, null, 300, 350, 400, 450, true, false),
  ('Lavagem a seco', 'main', 'Lavagem',
    'Limpeza externa sem água, com produto de ação rápida e acabamento com cera.',
    30, null, 45, 55, 65, 75, false, true),
  ('Higienização do ar-condicionado', 'complementary', 'Higienização',
    'Limpeza e desinfecção dos dutos e do evaporador do ar-condicionado.',
    60, 120, null, null, null, null, true, false),
  ('Lavagem de motor', 'complementary', 'Lavagem',
    'Limpeza do compartimento do motor com produtos que protegem as partes elétricas.',
    40, 80, null, null, null, null, true, false),
  ('Revitalização de faróis', 'complementary', 'Polimento e proteção',
    'Lixamento, polimento e proteção dos faróis amarelados ou opacos.',
    60, 150, null, null, null, null, true, false),
  ('Oxi-sanitização', 'complementary', 'Higienização',
    'Eliminação de odores, fungos e bactérias do interior com ozônio.',
    40, 100, null, null, null, null, true, false),
  ('Cristalização de vidros', 'complementary', 'Polimento e proteção',
    'Tratamento dos vidros que melhora a visibilidade e facilita a limpeza.',
    40, 90, null, null, null, null, false, false),
  ('Cera de carnaúba', 'additional', null, null, 20, 35, null, null, null, null, true, false),
  ('Pretinho nos pneus', 'additional', null, null, 10, 10, null, null, null, null, true, false),
  ('Hidratação de couro', 'additional', null, null, 40, 90, null, null, null, null, true, false),
  ('Repelente de chuva nos vidros', 'additional', null, null, 20, 50, null, null, null, null, true, false);

insert into public.services (
  id, type, category_id, name, description, avg_duration_minutes, pricing_mode, fixed_price,
  is_active, deleted_at, created_at, updated_at
)
select pg_temp.glow_demo_id('service:' || d.name), d.type,
  case when d.category is not null then pg_temp.glow_demo_id('category:' || d.category) end,
  d.name, d.description, d.minutes,
  case when d.fixed is null then 'by_size'::public.pricing_mode else 'fixed'::public.pricing_mode end,
  d.fixed, d.is_active,
  case when d.is_deleted then now() - interval '45 days' end,
  now() - interval '120 days',
  case when d.is_deleted then now() - interval '45 days' else now() - interval '120 days' end
from glow_demo_services d
on conflict do nothing;

insert into public.service_prices (service_id, size, price, created_at)
select pg_temp.glow_demo_id('service:' || d.name), p.size, p.price, now() - interval '120 days'
from glow_demo_services d
cross join lateral (values
  ('small'::public.vehicle_size, d.small),
  ('medium'::public.vehicle_size, d.medium),
  ('large'::public.vehicle_size, d.large),
  ('extra_large'::public.vehicle_size, d.extra_large)
) as p(size, price)
where d.fixed is null
on conflict do nothing;

insert into public.service_additionals (main_service_id, additional_service_id, created_at)
select pg_temp.glow_demo_id('service:' || l.main), pg_temp.glow_demo_id('service:' || l.additional),
  now() - interval '120 days'
from (values
  ('Lavagem simples', 'Cera de carnaúba'),
  ('Lavagem completa', 'Cera de carnaúba'),
  ('Lavagem simples', 'Pretinho nos pneus'),
  ('Lavagem completa', 'Pretinho nos pneus'),
  ('Lavagem técnica', 'Pretinho nos pneus'),
  ('Lavagem completa', 'Hidratação de couro'),
  ('Lavagem técnica', 'Hidratação de couro'),
  ('Higienização interna completa', 'Hidratação de couro'),
  ('Lavagem completa', 'Repelente de chuva nos vidros'),
  ('Lavagem técnica', 'Repelente de chuva nos vidros'),
  ('Polimento comercial', 'Repelente de chuva nos vidros')
) as l(main, additional)
on conflict do nothing;

-- Clients and vehicles, with no Supabase Auth account: they appear on the panel and the
-- dashboard but cannot sign in. The last vehicle is shared by two accounts (RN036).

insert into public.clients (id, first_name, last_name, email, phone, created_at, updated_at)
select pg_temp.glow_demo_id('client:' || c.email), c.first_name, c.last_name, c.email,
  '829000000' || lpad(c.n::text, 2, '0'),
  now() - interval '120 days', now() - interval '120 days'
from (values
  (1, 'Ana', 'Souza', 'ana.souza@example.com'),
  (2, 'Bruno', 'Lima', 'bruno.lima@example.com'),
  (3, 'Carla', 'Mendes', 'carla.mendes@example.com'),
  (4, 'Diego', 'Ferreira', 'diego.ferreira@example.com'),
  (5, 'Eduarda', 'Santos', 'eduarda.santos@example.com'),
  (6, 'Felipe', 'Araújo', 'felipe.araujo@example.com'),
  (7, 'Gabriela', 'Rocha', 'gabriela.rocha@example.com'),
  (8, 'Henrique', 'Costa', 'henrique.costa@example.com'),
  (9, 'Isabela', 'Melo', 'isabela.melo@example.com'),
  (10, 'João Pedro', 'Barros', 'joao.barros@example.com'),
  (11, 'Larissa', 'Cavalcanti', 'larissa.cavalcanti@example.com'),
  (12, 'Marcos', 'Tenório', 'marcos.tenorio@example.com'),
  (13, 'Natália', 'Pires', 'natalia.pires@example.com')
) as c(n, first_name, last_name, email)
on conflict do nothing;

insert into public.vehicles (id, type, plate, brand, model, color, year, created_at, updated_at)
select pg_temp.glow_demo_id('vehicle:' || v.plate), v.type, v.plate, v.brand, v.model, v.color, v.year,
  now() - interval '120 days', now() - interval '120 days'
from (values
  ('hatch'::public.vehicle_type, 'GLW1A01', 'Volkswagen', 'Polo', 'Prata', 2021),
  ('sedan', 'GLW2B02', 'Toyota', 'Corolla', 'Preto', 2022),
  ('suv', 'GLW3C03', 'Jeep', 'Compass', 'Branco', 2023),
  ('pickup', 'GLW4D04', 'Toyota', 'Hilux', 'Prata', 2020),
  ('hatch', 'GLW5E05', 'Hyundai', 'HB20', 'Branco', 2019),
  ('sedan', 'GLW6F06', 'Honda', 'City', 'Cinza', 2021),
  ('suv', 'GLW7G07', 'Hyundai', 'Creta', 'Vermelho', 2022),
  ('pickup', 'GLW8H08', 'Fiat', 'Toro', 'Azul', 2021),
  ('hatch', 'GLW9J09', 'Chevrolet', 'Onix', 'Preto', 2020),
  ('sedan', 'GLW1010', 'Volkswagen', 'Virtus', 'Branco', 2023),
  ('suv', 'GLW2020', 'Volkswagen', 'T-Cross', 'Cinza', 2024),
  ('pickup', 'GLW3030', 'Chevrolet', 'S10', 'Preto', 2018),
  ('hatch', 'GLW4K14', 'Fiat', 'Argo', 'Vermelho', 2022),
  ('suv', 'GLW5L15', 'Toyota', 'SW4', 'Prata', 2019)
) as v(type, plate, brand, model, color, year)
on conflict do nothing;

insert into public.client_vehicles (client_id, vehicle_id, created_at)
select pg_temp.glow_demo_id('client:' || l.email), pg_temp.glow_demo_id('vehicle:' || l.plate),
  now() - interval '120 days'
from (values
  ('ana.souza@example.com', 'GLW1A01'),
  ('bruno.lima@example.com', 'GLW2B02'),
  ('carla.mendes@example.com', 'GLW3C03'),
  ('diego.ferreira@example.com', 'GLW4D04'),
  ('eduarda.santos@example.com', 'GLW5E05'),
  ('felipe.araujo@example.com', 'GLW6F06'),
  ('gabriela.rocha@example.com', 'GLW7G07'),
  ('henrique.costa@example.com', 'GLW8H08'),
  ('isabela.melo@example.com', 'GLW9J09'),
  ('joao.barros@example.com', 'GLW1010'),
  ('larissa.cavalcanti@example.com', 'GLW2020'),
  ('marcos.tenorio@example.com', 'GLW3030'),
  ('ana.souza@example.com', 'GLW4K14'),
  ('henrique.costa@example.com', 'GLW5L15'),
  ('isabela.melo@example.com', 'GLW5L15')
) as l(email, plate)
on conflict do nothing;

-- Appointments: 2 to 4 on full days and 1 or 2 on short days, from 90 days before the
-- load to 14 days after it, in the slots of business_hours (RN013) ----------------

do $$
declare
  today date := (now() at time zone 'America/Maceio')::date;
  combos text[] := array[
    'Lavagem simples|Pretinho nos pneus',
    'Lavagem simples',
    'Lavagem simples|Cera de carnaúba',
    'Lavagem completa',
    'Lavagem completa|Cera de carnaúba',
    'Lavagem completa|Pretinho nos pneus|Repelente de chuva nos vidros',
    'Lavagem completa|Lavagem de motor',
    'Lavagem completa',
    'Lavagem simples|Pretinho nos pneus',
    'Lavagem técnica|Hidratação de couro',
    'Lavagem técnica|Pretinho nos pneus',
    'Polimento comercial',
    'Polimento comercial|Repelente de chuva nos vidros',
    'Higienização interna completa',
    'Higienização interna completa|Oxi-sanitização',
    'Higienização do ar-condicionado',
    'Revitalização de faróis',
    'Oxi-sanitização',
    'Polimento técnico',
    'Vitrificação de pintura',
    'Lavagem a seco'
  ];
  link_clients uuid[];
  link_vehicles uuid[];
  work_day date;
  opening public.business_hours;
  slots timestamp[];
  daily_count integer;
  day_key text;
  draw integer;
  link integer;
  combo text;
  appointment_id uuid;
  status public.appointment_status;
  parent public.appointments;
begin
  select array_agg(cv.client_id order by cv.client_id, cv.vehicle_id),
    array_agg(cv.vehicle_id order by cv.client_id, cv.vehicle_id)
    into link_clients, link_vehicles
  from public.client_vehicles cv
  join public.clients c on c.id = cv.client_id
  where c.email like '%@example.com';

  for work_day in select d::date from generate_series((today - 90)::timestamp, (today + 14)::timestamp, interval '1 day') as d loop
    select * into opening from public.business_hours where weekday = extract(dow from work_day);
    continue when not opening.is_open;

    -- A day that already has demo appointments stays as it is.
    continue when exists (
      select 1 from public.appointments a
      where a.client_id = any(link_clients) and a.rescheduled_from_id is null
        and (a.scheduled_at at time zone 'America/Maceio')::date = work_day
    );

    -- Start times every 30 minutes, outside the break (RN013, RN035).
    select array_agg(slot order by slot) into slots
    from generate_series(
      work_day + opening.opens_at, work_day + opening.closes_at - interval '30 minutes', interval '30 minutes'
    ) as slot
    where opening.break_starts_at is null
      or slot::time < opening.break_starts_at or slot::time >= opening.break_ends_at;

    day_key := work_day::text;
    daily_count := case
      when opening.closes_at - opening.opens_at > interval '5 hours' then 2 + pg_temp.glow_demo_number(day_key) % 3
      else 1 + pg_temp.glow_demo_number(day_key) % 2
    end;

    for slot_number in 1 .. daily_count loop
      draw := pg_temp.glow_demo_number(day_key || ':' || slot_number);
      link := 1 + (draw / 7) % array_length(link_clients, 1);
      combo := combos[1 + (draw / 101) % array_length(combos, 1)];
      -- The dry wash was deleted 45 days ago and only appears in older appointments (RN030).
      if combo = 'Lavagem a seco' and work_day >= today - 45 then
        combo := combos[1];
      end if;

      appointment_id := pg_temp.glow_demo_id('appointment:' || day_key || ':' || slot_number);
      status := pg_temp.glow_demo_add_appointment(
        appointment_id, link_clients[link], link_vehicles[link], null,
        slots[1 + draw % array_length(slots, 1)] at time zone 'America/Maceio',
        string_to_array(combo, '|'), combo <> 'Lavagem a seco', null
      );

      -- A rescheduled appointment originates a new one four weeks later (RN020).
      if status = 'rescheduled' then
        select * into parent from public.appointments a where a.id = appointment_id;
        perform pg_temp.glow_demo_add_appointment(
          pg_temp.glow_demo_id('reschedule:' || appointment_id::text), parent.client_id, parent.vehicle_id,
          parent.id, parent.scheduled_at + interval '28 days', string_to_array(combo, '|'), false,
          least(parent.completed_at + interval '1 day', now())
        );
      end if;
    end loop;
  end loop;
end;
$$;

-- Contact data shown in the portal footer, only where it is still empty (RN028).
update public.business_settings
set email = coalesce(email, 'contato@glow.example'),
  address = coalesce(address, 'Rua Exemplo, 100 – Ponta Verde, Maceió – AL')
where id = 1 and (email is null or address is null);

commit;
