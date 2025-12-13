-- Create a table for plans (wishlist items)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  board_slug text not null,
  title text not null,
  description text,
  category text,
  location text,
  est_cost numeric,
  when_text text,
  priority int not null default 2,
  status text not null default 'wishlist',
  created_at timestamptz not null default now()
);

create index if not exists plans_board_slug_created_at_idx on public.plans(board_slug, created_at desc);

-- Optional: make edits open to anyone who has the link (no auth)
alter table public.plans enable row level security;

-- Policy: allow anyone (anon) to read/write rows for any board_slug.
-- If you want protection, see README for the "board_key" variant.
drop policy if exists "plans_select_anon" on public.plans;
drop policy if exists "plans_insert_anon" on public.plans;
drop policy if exists "plans_update_anon" on public.plans;
drop policy if exists "plans_delete_anon" on public.plans;

create policy "plans_select_anon"
on public.plans for select
to anon
using (true);

create policy "plans_insert_anon"
on public.plans for insert
to anon
with check (true);

create policy "plans_update_anon"
on public.plans for update
to anon
using (true)
with check (true);

create policy "plans_delete_anon"
on public.plans for delete
to anon
using (true);
