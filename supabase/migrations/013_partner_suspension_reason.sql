-- Add suspension reason metadata for partners
alter table public.partners
  add column if not exists suspended_reason text;

alter table public.partners
  add column if not exists suspended_at timestamptz;
