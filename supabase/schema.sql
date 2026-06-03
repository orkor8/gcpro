-- ════════════════════════════════════════
-- ClinHub Database Schema
-- ════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('student_gcp','student_cra','employer','lecturer_gcp','lecturer_cra','admin')),
  full_name text not null,
  email text not null,
  phone text,
  bio text,
  photo_url text,
  cv_url text,
  linkedin_url text,
  city text,
  skills text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── LECTURERS ──────────────────────────
create table public.lecturers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null unique,
  specialty text not null,
  course_type text not null check (course_type in ('gcp','cra','both')),
  bio text,
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── JOBS ───────────────────────────────
create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  company text not null,
  location text not null,
  job_type text not null,
  description text not null,
  requirements text,
  published_at timestamptz default now(),
  early_access_until timestamptz default (now() + interval '48 hours'),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── QUESTIONS ──────────────────────────
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references auth.users(id) on delete cascade not null,
  lecturer_id uuid references public.lecturers(id) on delete cascade not null,
  subject text not null,
  body text not null,
  student_email text not null,
  created_at timestamptz default now()
);

-- ─── KNOWLEDGE ITEMS ────────────────────
create table public.knowledge_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  content_url text,
  content_type text not null check (content_type in ('video','document','live','article')),
  cra_only boolean default false,
  thumbnail_url text,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.lecturers enable row level security;
alter table public.jobs enable row level security;
alter table public.questions enable row level security;
alter table public.knowledge_items enable row level security;

-- Profiles: user sees own profile, employers see student profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Employers can view student profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
      and p.role = 'employer'
    )
    and role in ('student_gcp', 'student_cra')
  );

-- Lecturers: anyone logged in can view
create policy "Authenticated users can view lecturers"
  on public.lecturers for select
  to authenticated
  using (is_active = true);

-- Jobs: CRA students see all active jobs, GCP students see jobs older than 48h
create policy "CRA students see all jobs"
  on public.jobs for select
  using (
    is_active = true
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
      and p.role in ('student_cra', 'employer', 'admin', 'lecturer_cra', 'lecturer_gcp')
    )
  );

create policy "GCP students see jobs after 48h"
  on public.jobs for select
  using (
    is_active = true
    and early_access_until < now()
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
      and p.role = 'student_gcp'
    )
  );

create policy "Employers can manage own jobs"
  on public.jobs for all
  using (auth.uid() = employer_id);

-- Questions: students see own questions
create policy "Students can insert questions"
  on public.questions for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Students can view own questions"
  on public.questions for select
  using (auth.uid() = student_id);

-- Knowledge items: GCP students see non-CRA-only, CRA sees all
create policy "GCP students see non-exclusive content"
  on public.knowledge_items for select
  using (
    cra_only = false
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
      and p.role = 'student_gcp'
    )
  );

create policy "CRA students see all content"
  on public.knowledge_items for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
      and p.role in ('student_cra', 'admin', 'lecturer_cra', 'lecturer_gcp')
    )
  );

-- ════════════════════════════════════════
-- TRIGGER: update updated_at on profiles
-- ════════════════════════════════════════
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

-- ════════════════════════════════════════
-- SAMPLE LECTURERS
-- ════════════════════════════════════════
insert into public.lecturers (name, email, specialty, course_type, bio) values
  ('ד"ר שרה לוי', 'sarah@gcp-academy.co.il', 'רגולציה ו-GCP', 'gcp', 'מומחית ב-ICH E6 ורגולציה בינלאומית עם ניסיון של 15 שנה'),
  ('פרופ'' דוד כהן', 'david@gcp-academy.co.il', 'מחקר קליני מתקדם', 'cra', 'ראש מחלקת מחקר קליני, מחבר 3 ספרי לימוד בתחום'),
  ('ד"ר מיכל ברק', 'michal@gcp-academy.co.il', 'ניהול ניסויים קליניים', 'cra', 'לשעבר CRA ראשית בנובה נורדיסק, 12 שנות ניסיון'),
  ('עו"ד רונית שמיר', 'ronit@gcp-academy.co.il', 'רגולציה ואתיקה', 'cra', 'עורכת דין המתמחה בדיני רפואה וניסויים קליניים');
