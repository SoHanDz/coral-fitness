create table if not exists workout_logs (
  id uuid default gen_random_uuid() primary key,
  workout_date date not null default current_date,
  day_key text not null,
  title text not null,
  completed_exercises jsonb not null default '[]'::jsonb,
  duration_minutes integer not null default 0,
  is_lazy_mode boolean not null default false,
  created_at timestamptz default now()
);

-- Personal single-user app using the publishable (anon) key: allow anon to insert/read.
alter table workout_logs enable row level security;
drop policy if exists "anon insert" on workout_logs;
drop policy if exists "anon select" on workout_logs;
create policy "anon insert" on workout_logs for insert to anon with check (true);
create policy "anon select" on workout_logs for select to anon using (true);
