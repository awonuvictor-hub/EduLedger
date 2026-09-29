create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  role text check (role in ('admin', 'bursar', 'parent')),
  created_at timestamp with time zone default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_id_number text,
  first_name text,
  last_name text,
  class_level text,
  parent_id uuid references public.users(id),
  unique(student_id_number)
);

create table if not exists public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  title text,
  class_level text,
  amount numeric,
  due_date date
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  reference_code text,
  student_id uuid references public.students(id),
  amount_paid numeric,
  payment_method text check (payment_method in ('Bank Transfer', 'Mobile Money - MTN/Vodafone', 'Physical Cash')),
  status text check (status in ('successful', 'pending', 'reconciled')) default 'pending',
  created_at timestamp with time zone default now()
);

create index if not exists idx_students_parent on public.students(parent_id);
create index if not exists idx_transactions_student on public.transactions(student_id);
create index if not exists idx_transactions_status on public.transactions(status);

alter table public.users enable row level security;
alter table public.students enable row level security;
alter table public.fee_structures enable row level security;
alter table public.transactions enable row level security;
