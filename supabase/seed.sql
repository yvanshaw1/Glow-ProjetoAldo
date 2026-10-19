-- Required initial data (workflows/procedimentos/migration.md, "Dados iniciais").
-- Idempotent: loading it again neither duplicates rows nor overwrites what the panel changed.

-- The four payment methods, with no adjustment (RN011, RN012).
insert into public.payment_fees (payment_method, percent)
values ('credit', 0), ('debit', 0), ('pix', 0), ('cash', 0)
on conflict (payment_method) do nothing;

-- The seven weekdays, from Sunday (0) to Saturday (6): Monday to Friday from 08:00 to 18:00
-- with a break from 12:00 to 13:00, Saturday from 08:00 to 12:00, Sunday closed (RN013).
insert into public.business_hours (weekday, is_open, opens_at, closes_at, break_starts_at, break_ends_at)
values
  (0, false, null, null, null, null),
  (1, true, '08:00', '18:00', '12:00', '13:00'),
  (2, true, '08:00', '18:00', '12:00', '13:00'),
  (3, true, '08:00', '18:00', '12:00', '13:00'),
  (4, true, '08:00', '18:00', '12:00', '13:00'),
  (5, true, '08:00', '18:00', '12:00', '13:00'),
  (6, true, '08:00', '12:00', null, null)
on conflict (weekday) do nothing;

-- The single row of company data (RN028); the other fields are filled in on the panel.
insert into public.business_settings (id, company_name)
values (1, 'Glow – Estética Automotiva')
on conflict (id) do nothing;
