-- Enable pgvector extension
create extension if not exists vector;

-- Create profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  education_level text,
  field_of_study text,
  current_role text,
  target_role text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create user_skills table
create table if not exists user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  skill_name text,
  skill_level int check (skill_level between 0 and 5),
  last_updated timestamp default now()
);

-- Create user_interests table
create table if not exists user_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  interest text,
  weight float check (weight between 0 and 1)
);

-- Create user_constraints table
create table if not exists user_constraints (
  user_id uuid primary key references profiles(id),
  hours_per_week int,
  budget int,
  preferred_learning_style text
);

-- Create user_progress table
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  activity text,
  completed boolean default false,
  completion_date timestamp
);

-- Create knowledge_base table
create table if not exists knowledge_base (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  embedding vector(1536), -- 1536 is dimensions for text-embedding-3-small
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table user_skills enable row level security;
alter table user_interests enable row level security;
alter table user_constraints enable row level security;
alter table user_progress enable row level security;
alter table knowledge_base enable row level security;

-- RLS Policies
create policy "Users can manage own profile"
on profiles
for all
using (auth.uid() = id);

create policy "Users can manage own skills"
on user_skills
for all
using (auth.uid() = user_id);

create policy "Users can manage own interests"
on user_interests
for all
using (auth.uid() = user_id);

create policy "Users can manage own constraints"
on user_constraints
for all
using (auth.uid() = user_id);

create policy "Users can manage own progress"
on user_progress
for all
using (auth.uid() = user_id);

-- Simple public access policy for the demo
create policy "Public Access" on knowledge_base for select using (true);

-- Create match_knowledge function for vector similarity search
create or replace function match_knowledge (
  query_embedding vector(1536),
  match_count int DEFAULT 5
) returns table (
  id uuid,
  content text,
  source text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kb.id,
    kb.content,
    kb.source,
    1 - (kb.embedding <=> query_embedding) as similarity
  from knowledge_base kb
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;
