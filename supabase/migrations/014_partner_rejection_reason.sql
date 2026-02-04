-- Add rejection reason metadata for partners
alter table public.partners
  add column if not exists rejected_reason text;
