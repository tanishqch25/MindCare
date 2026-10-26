-- Run this in the Supabase SQL Editor after creating your project.
-- Mood entries are private to their owner. No free-text notes are stored.
create table if not exists public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mood text not null check (mood in ('Low', 'A little low', 'Okay', 'Good', 'Great')),
  created_at timestamptz not null default now()
);

alter table public.mood_checkins enable row level security;
revoke all on table public.mood_checkins from anon, authenticated;
grant select, insert, delete on table public.mood_checkins to authenticated;

create policy "Users can read their own mood check-ins"
  on public.mood_checkins for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own mood check-ins"
  on public.mood_checkins for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own mood check-ins"
  on public.mood_checkins for delete to authenticated
  using ((select auth.uid()) = user_id);
