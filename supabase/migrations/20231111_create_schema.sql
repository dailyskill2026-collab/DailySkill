-- Supabase Migration: Create core tables for Sprint 5
-- Run with: supabase db reset && supabase db push

create extension if not exists pgcrypto;

-- 1️⃣ content_sources
create table content_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('html','rss','pdf','atom')),
  base_url text not null,
  feed_url text,
  technology text not null,
  categories text[] not null,
  enabled boolean not null default true,
  poll_interval_minutes int not null default 1440,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  access_method text not null check (access_method in ('public','auth')),
  access_policy_status text not null check (access_policy_status in ('allowed','review','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2️⃣ source_documents
create table source_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references content_sources(id) on delete cascade,
  url text not null,
  canonical_url text,
  title text,
  doc_type text not null check (doc_type in ('html','pdf','text')),
  published_at timestamptz,
  last_modified_at timestamptz,
  fetched_at timestamptz not null default now(),
  content_hash text not null,
  version int not null default 1,
  status text not null check (status in ('new','processed','failed','duplicate')),
  processing_error text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3️⃣ document_versions
create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references source_documents(id) on delete cascade,
  version int not null,
  content_hash text not null,
  fetched_at timestamptz not null,
  storage_path text,
  created_at timestamptz not null default now()
);

-- 4️⃣ source_sections
create table source_sections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references source_documents(id) on delete cascade,
  heading text,
  section_order int not null,
  parent_heading text,
  page_number int,
  anchor text,
  section_text text not null,
  content_hash text not null,
  created_at timestamptz not null default now()
);

-- 5️⃣ pipeline_runs
create table pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  trigger_type text not null check (trigger_type in ('cron','manual')),
  status text not null check (status in ('running','completed','failed')),
  processed_documents int not null default 0,
  new_documents int not null default 0,
  updated_documents int not null default 0,
  failed_documents int not null default 0,
  total_cost_usd numeric(10,4),
  logs text
);

-- 6️⃣ pipeline_errors
create table pipeline_errors (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references pipeline_runs(id) on delete cascade,
  document_id uuid references source_documents(id),
  source text not null,
  error_message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: Only admins (role = 'admin') can access tables.
-- Assuming a column "role" on auth.users via a policy.

alter table content_sources enable row level security;
alter table source_documents enable row level security;
alter table document_versions enable row level security;
alter table source_sections enable row level security;
alter table pipeline_runs enable row level security;
alter table pipeline_errors enable row level security;

create policy admin_all on content_sources using (auth.role() = 'admin');
create policy admin_all on source_documents using (auth.role() = 'admin');
create policy admin_all on document_versions using (auth.role() = 'admin');
create policy admin_all on source_sections using (auth.role() = 'admin');
create policy admin_all on pipeline_runs using (auth.role() = 'admin');
create policy admin_all on pipeline_errors using (auth.role() = 'admin');

-- Insert initial Salesforce sources (example rows)
insert into content_sources (name, type, base_url, feed_url, technology, categories, access_method, access_policy_status)
values
  ('Salesforce Developer Blog', 'html', 'https://developer.salesforce.com', 'https://developer.salesforce.com/blogs/', 'salesforce', ARRAY['general'], 'public', 'allowed'),
  ('Salesforce Release Notes', 'html', 'https://releasenotes.docs.salesforce.com', 'https://releasenotes.docs.salesforce.com/en-us/summer24/release-notes/salesforce_release_notes.htm', 'salesforce', ARRAY['apex','lwc','api'], 'public', 'allowed'),
  ('Salesforce Developer Documentation', 'html', 'https://developer.salesforce.com/docs', null, 'salesforce', ARRAY['apex','lwc','security'], 'public', 'allowed'),
  ('Salesforce REST API Release Notes', 'html', 'https://developer.salesforce.com/docs', 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_defining_named_credentials.htm', 'salesforce', ARRAY['rest_api'], 'public', 'allowed'),
  ('Salesforce LWC Documentation', 'html', 'https://developer.salesforce.com/docs/component-library', 'https://developer.salesforce.com/docs/component-library/documentation/en/lwc', 'salesforce', ARRAY['lwc'], 'public', 'allowed');
