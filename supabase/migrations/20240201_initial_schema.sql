-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create households table
create table public.households (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'My Kitchen',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table (public profiles linked to auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  color text default '#4361ee', -- Default color
  household_id uuid references public.households(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create foods table
create table public.foods (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  recipe_markdown text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tags table
create type tag_type as enum ('specific', 'global');

create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  type tag_type default 'specific',
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create food_tags junction table
create table public.food_tags (
  food_id uuid references public.foods(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (food_id, tag_id)
);

-- Create food_ingredients table
create type unit_type as enum ('gr', 'ml', '#', 'tbsp', 'tsp');

create table public.food_ingredients (
  id uuid primary key default uuid_generate_v4(),
  food_id uuid references public.foods(id) on delete cascade not null,
  ingredient_name text not null,
  quantity numeric not null,
  unit unit_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create meal_slots table (Breakfast, Lunch, Dinner, etc.)
create table public.meal_slots (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  sort_order integer not null,
  is_visible boolean default true,
  specific_date date, -- If set, this slot is only for a specific day (override)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create calendar_entries table
create table public.calendar_entries (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid references public.households(id) on delete cascade not null,
  food_id uuid references public.foods(id) on delete set null, -- Nullable for ad-hoc/leftovers text only? Or use specific leftovers flag
  meal_slot_id uuid references public.meal_slots(id) on delete cascade not null,
  date date not null,
  is_leftover boolean default false,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_slot_date unique (meal_slot_id, date)
);

-- Create usage_logs table
create table public.usage_logs (
  id uuid primary key default uuid_generate_v4(),
  food_id uuid references public.foods(id) on delete cascade not null,
  used_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create favorites table
create table public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  food_id uuid references public.foods(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, food_id)
);

-- Row Level Security (RLS) Policies
-- Helper function to get current user's household_id
create or replace function get_auth_household_id()
returns uuid as $$
  select household_id from public.users where id = auth.uid() limit 1;
$$ language sql security definer;

-- Enable RLS on all tables
alter table public.households enable row level security;
alter table public.users enable row level security;
alter table public.foods enable row level security;
alter table public.tags enable row level security;
alter table public.food_tags enable row level security;
alter table public.food_ingredients enable row level security;
alter table public.meal_slots enable row level security;
alter table public.calendar_entries enable row level security;
alter table public.usage_logs enable row level security;
alter table public.favorites enable row level security;

-- Policies
-- Households: Users can view their own household
create policy "Users can view their own household" on public.households
  for select using (id in (select household_id from public.users where id = auth.uid()));

-- Users: Users can view profiles in their household
create policy "Users can view members of their household" on public.users
  for select using (household_id = get_auth_household_id());
  
-- Users can update their own profile
create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Foods: View/Edit if in same household
create policy "Household view foods" on public.foods
  for select using (household_id = get_auth_household_id());
create policy "Household edit foods" on public.foods
  for all using (household_id = get_auth_household_id());

-- Tags, Ingredients, Meal Slots, Calendar Entries, Usage Logs: Same household policy
create policy "Household view tags" on public.tags
  for select using (household_id = get_auth_household_id());
create policy "Household edit tags" on public.tags
  for all using (household_id = get_auth_household_id());

create policy "Household view food tags" on public.food_tags
  for select using (
    exists (select 1 from public.foods where id = food_tags.food_id and household_id = get_auth_household_id())
  );
create policy "Household edit food tags" on public.food_tags
  for all using (
    exists (select 1 from public.foods where id = food_tags.food_id and household_id = get_auth_household_id())
  );

create policy "Household view ingredients" on public.food_ingredients
  for select using (
    exists (select 1 from public.foods where id = food_ingredients.food_id and household_id = get_auth_household_id())
  );
create policy "Household edit ingredients" on public.food_ingredients
  for all using (
    exists (select 1 from public.foods where id = food_ingredients.food_id and household_id = get_auth_household_id())
  );

create policy "Household view slots" on public.meal_slots
  for select using (household_id = get_auth_household_id());
create policy "Household edit slots" on public.meal_slots
  for all using (household_id = get_auth_household_id());

create policy "Household view calendar" on public.calendar_entries
  for select using (household_id = get_auth_household_id());
create policy "Household edit calendar" on public.calendar_entries
  for all using (household_id = get_auth_household_id());
  
create policy "Household view logs" on public.usage_logs
  for select using (
    exists (select 1 from public.foods where id = usage_logs.food_id and household_id = get_auth_household_id())
  );

-- Favorites: View others in household, but only manage your own
create policy "Household view favorites" on public.favorites
  for select using (
    exists (select 1 from public.users where id = favorites.user_id and household_id = get_auth_household_id())
  );
create policy "User manage favorites" on public.favorites
  for all using (auth.uid() = user_id);

-- Trigger to create a user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
begin
  -- Check if invited (omitted for MVP, assuming new household for every new user if not specified)
  -- Create a new household for the user
  insert into public.households (name) values ('My Kitchen') returning id into new_household_id;
  
  insert into public.users (id, email, name, household_id)
  values (new.id, new.email, split_part(new.email, '@', 1), new_household_id);
  
  -- Create default meal slots
  insert into public.meal_slots (household_id, name, sort_order) values 
    (new_household_id, 'Breakfast', 1),
    (new_household_id, 'Lunch', 2),
    (new_household_id, 'Dinner', 3);
    
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
