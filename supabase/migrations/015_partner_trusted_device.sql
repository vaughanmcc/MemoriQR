-- Add trusted device flag to partner sessions for extended session duration
alter table public.partner_sessions
  add column if not exists is_trusted_device boolean default false;
