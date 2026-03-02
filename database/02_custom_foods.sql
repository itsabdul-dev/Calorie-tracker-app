-- Create the custom_foods table
create table public.custom_foods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  food_name text not null,
  calories integer not null,
  protein decimal,
  carbs decimal,
  fat decimal,
  serving_size text default '100g',
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.custom_foods enable row level security;

-- Create Policies
-- Users can view their own custom foods OR any public custom foods
create policy "Users can view own or public custom foods" on public.custom_foods
  for select using (auth.uid() = user_id or is_public = true);

-- Users can insert their own custom foods
create policy "Users can insert own custom foods" on public.custom_foods
  for insert with check (auth.uid() = user_id);

-- Users can update their own custom foods
create policy "Users can update own custom foods" on public.custom_foods
  for update using (auth.uid() = user_id);

-- Users can delete their own custom foods
create policy "Users can delete own custom foods" on public.custom_foods
  for delete using (auth.uid() = user_id);

-- Create index for faster search
create index custom_foods_name_idx on public.custom_foods using gin(to_tsvector('english', food_name));
