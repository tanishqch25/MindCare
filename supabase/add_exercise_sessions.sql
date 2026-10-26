-- Run once in the Supabase SQL Editor after applying schema.sql.
-- Stores only a known exercise identifier, estimated minutes, and completion time.
create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exercise_key text not null check (exercise_key in ('memory-match', 'focus-flow', 'mindful-breathing')),
  duration_minutes integer not null check (duration_minutes between 1 and 30),
  created_at timestamptz not null default now()
);

alter table public.exercise_sessions enable row level security;
revoke all on table public.exercise_sessions from anon, authenticated;
grant select, insert, delete on table public.exercise_sessions to authenticated;

create policy "Users can read their own exercise sessions"
  on public.exercise_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own exercise sessions"
  on public.exercise_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own exercise sessions"
  on public.exercise_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);
