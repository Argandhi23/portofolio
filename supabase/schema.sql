-- ============================================================================
-- SUPABASE SCHEMA, STRICT RLS, & STORAGE SETUP ("FOLIOBLOX" PORTFOLIO CMS)
-- ============================================================================
-- INSTRUKSI PENTING SEBELUM KLIK "RUN" DI SUPABASE SQL EDITOR:
-- Ubah 'email_admin_kamu@gmail.com' pada fungsi public.is_admin() di bawah ini
-- menjadi alamat email asli yang kamu daftarkan di Supabase Authentication.
-- ============================================================================

-- 1. AKTIFKAN EKSTENSI UUID
create extension if not exists "pgcrypto";

-- 2. FUNGSI HELPER KEAMANAN ADMIN (CASE-INSENSITIVE)
-- Fungsi ini menjadi kunci utama Row Level Security (RLS) di seluruh tabel & storage.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('email_admin_kamu@gmail.com');
$$;

-- 3. FUNGSI TRIGGER OTOMATIS UNTUK KOLOM updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 4. TABEL SITE_SETTINGS (SINGLETON: HANYA 1 BARIS KONFIGURASI UTAMA)
-- ============================================================================
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  brand_name text not null default 'Argandhi.',
  hero_greeting text not null default 'Hey, I''m Faqih Rafasha — Full-Stack &',
  hero_title text not null default 'Software Developer',
  hero_subtitle text not null default 'Great software should feel effortless.',
  hero_description text not null default 'Informatics Engineering student at UNESA (''24) & Freelance Full-Stack Developer crafting fast, scalable web apps, mobile APKs, and AI-powered software.',
  hero_image_url text,
  about_label text not null default 'Behind the Code',
  about_heading text not null default 'Engineering Digital Products That Solve Real Problems',
  about_description text not null default 'I''m Faqih Rafasha Argandhi, a Full-Stack & Software Developer based in Surabaya. With multiple production-ready websites and mobile APKs running live, I help businesses and clients turn complex ideas into clean, secure, and high-performance applications.',
  contact_email text default 'argandhi23@gmail.com',
  whatsapp_number text default '6285806912873',
  github_url text default 'https://github.com/Argandhi23',
  cta_url text not null default '#contact',
  updated_at timestamptz not null default now()
);

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 5. TABEL SERVICES (DAFTAR KEAHLIAN #01 - #04 DI HERO SECTION)
-- ============================================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  number_label text not null, -- Contoh: '#01', '#02'
  title text not null,        -- Contoh: 'Brand Strategy'
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_services_order on public.services (is_active, display_order asc);

-- ============================================================================
-- 6. TABEL BRANDS (LOGO KLIEN "TRUSTED BY BRANDS I'VE HELPED SHAPE")
-- ============================================================================
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,         -- Contoh: 'Supa Blox'
  logo_url text,              -- URL SVG/PNG dari Supabase Storage
  website_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_brands_order on public.brands (is_active, display_order asc);

-- ============================================================================
-- 7. TABEL PROJECTS (INTI CRUD PORTOFOLIO)
-- ============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,                -- Contoh: 'Brand Identity Design'
  client_name text,
  summary text,                          -- Ringkasan singkat project
  content text,                          -- Studi kasus lengkap (Markdown)
  thumbnail_url text not null,           -- Gambar utama untuk kartu project
  gallery_urls text[] not null default '{}',
  tech_stack text[] not null default '{}', -- Daftar teknologi yang digunakan
  project_url text,                      -- Link live preview project
  github_url text,                       -- Link repositori GitHub
  apk_url text,                          -- Link unduh APK / rilis mobile app
  is_featured boolean not null default false, -- Tampil di 3 kartu halaman utama
  status text not null default 'draft' check (status in ('draft', 'published')),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_public_list
  on public.projects (status, is_featured, display_order asc, created_at desc);
create index if not exists idx_projects_slug
  on public.projects (slug);

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) — KEAMANAN KETAT LEVEL DATABASE
-- ============================================================================
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.brands enable row level security;
alter table public.projects enable row level security;

-- Policies: SITE_SETTINGS
drop policy if exists "Public can read site_settings" on public.site_settings;
create policy "Public can read site_settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Only admin can modify site_settings" on public.site_settings;
create policy "Only admin can modify site_settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Policies: SERVICES
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
  on public.services for select
  using (is_active = true or public.is_admin());

drop policy if exists "Only admin can manage services" on public.services;
create policy "Only admin can manage services"
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Policies: BRANDS
drop policy if exists "Public can read active brands" on public.brands;
create policy "Public can read active brands"
  on public.brands for select
  using (is_active = true or public.is_admin());

drop policy if exists "Only admin can manage brands" on public.brands;
create policy "Only admin can manage brands"
  on public.brands for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Policies: PROJECTS
drop policy if exists "Public can only read published projects" on public.projects;
create policy "Public can only read published projects"
  on public.projects for select
  using (status = 'published' or public.is_admin());

drop policy if exists "Only admin can insert projects" on public.projects;
create policy "Only admin can insert projects"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Only admin can update projects" on public.projects;
create policy "Only admin can update projects"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Only admin can delete projects" on public.projects;
create policy "Only admin can delete projects"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 9. SUPABASE STORAGE BUCKET & POLICIES (KHUSUS MEDIA PORTOFOLIO)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880, -- Batas ketat 5MB per file
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

drop policy if exists "Only admin can upload portfolio media" on storage.objects;
create policy "Only admin can upload portfolio media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "Only admin can update portfolio media" on storage.objects;
create policy "Only admin can update portfolio media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin())
  with check (bucket_id = 'portfolio-media' and public.is_admin());

drop policy if exists "Only admin can delete portfolio media" on storage.objects;
create policy "Only admin can delete portfolio media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- ============================================================================
-- 9B. TABEL INQUIRIES (PESAN MASUK KLIEN DARI CONTACT FORM -> /admin/inquiries)
-- ============================================================================
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  email text not null check (char_length(trim(email)) between 5 and 160),
  subject text check (subject is null or char_length(subject) <= 200),
  message text not null check (char_length(trim(message)) between 10 and 4000),
  status text not null default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.handle_updated_at();

create index if not exists idx_inquiries_status_created
  on public.inquiries (status, created_at desc);

alter table public.inquiries enable row level security;

drop policy if exists "Public can submit inquiries" on public.inquiries;
create policy "Public can submit inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'unread');

drop policy if exists "Only admin can view inquiries" on public.inquiries;
create policy "Only admin can view inquiries"
  on public.inquiries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Only admin can update inquiries" on public.inquiries;
create policy "Only admin can update inquiries"
  on public.inquiries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Only admin can delete inquiries" on public.inquiries;
create policy "Only admin can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 9C. TABEL PAGE_VIEWS (DETEKSI & ANALITIK PENGUNJUNG WEBSITE -> /admin)
-- ============================================================================
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null check (char_length(trim(visitor_id)) between 8 and 120),
  path text not null check (char_length(trim(path)) between 1 and 300),
  referrer_source text not null default 'Direct' check (char_length(trim(referrer_source)) between 1 and 120),
  referrer text check (referrer is null or char_length(referrer) <= 500),
  country text check (country is null or char_length(country) <= 80),
  city text check (city is null or char_length(city) <= 120),
  device_type text not null default 'Desktop' check (device_type in ('Desktop', 'Mobile', 'Tablet')),
  browser text not null default 'Browser' check (char_length(trim(browser)) <= 80),
  os text not null default 'OS' check (char_length(trim(os)) <= 80),
  is_returning boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_page_views_created_at
  on public.page_views (created_at desc);

create index if not exists idx_page_views_visitor_id
  on public.page_views (visitor_id);

alter table public.page_views enable row level security;

drop policy if exists "Public can insert page_views" on public.page_views;
create policy "Public can insert page_views"
  on public.page_views for insert
  to anon, authenticated
  with check (
    char_length(trim(visitor_id)) between 8 and 120
    and char_length(trim(path)) between 1 and 300
  );

drop policy if exists "Only admin can view page_views" on public.page_views;
create policy "Only admin can view page_views"
  on public.page_views for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Only admin can delete page_views" on public.page_views;
create policy "Only admin can delete page_views"
  on public.page_views for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- 10. DATA AWAL (SEED DATA SESUAI DESAIN REFERENSI "FOLIOBLOX")
-- ============================================================================
-- Insert pengaturan utama default
insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- Insert 4 layanan default (#01 - #04) jika tabel masih kosong
insert into public.services (number_label, title, display_order, is_active)
select * from (values
  ('#01', 'Web Development', 1, true),
  ('#02', 'Mobile App (APK)', 2, true),
  ('#03', 'AI Integration & Engineering', 3, true),
  ('#04', 'UI/UX & Maintenance', 4, true)
) as v(number_label, title, display_order, is_active)
where not exists (select 1 from public.services limit 1);

-- Insert 9 tech stack default jika tabel masih kosong
insert into public.brands (name, display_order, is_active)
select * from (values
  ('Next.js', 1, true),
  ('Supabase', 2, true),
  ('Shadcn UI', 3, true),
  ('Tailwind CSS', 4, true),
  ('Flutter', 5, true),
  ('Firebase', 6, true),
  ('React', 7, true),
  ('Astro', 8, true),
  ('Vercel', 9, true)
) as v(name, display_order, is_active)
where not exists (select 1 from public.brands limit 1);