-- Create visitors table
create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_agent text,
  ip_address inet,
  created_at timestamptz default now()
);

-- Create page_views table
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitors(id) not null,
  page_path text not null,
  entered_at timestamptz default now(),
  exited_at timestamptz
);

-- Create events table
create table public.events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid references public.visitors(id) not null,
  event_type text not null,
  product_id uuid references public.products(id),
  search_query text,
  created_at timestamptz default now(),
  constraint check_event_type check (event_type in ('page_click', 'product_click', 'add_to_cart', 'remove_from_cart', 'search', 'checkout'))
);

-- Create product_analytics table
create table public.product_analytics (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) not null,
  week_start date not null,
  click_count integer default 0,
  search_count integer default 0,
  unique(product_id, week_start)
);

-- Create function to update product_analytics on event insert
create or replace function public.update_product_analytics()
returns trigger as $$
declare
  current_week_start date;
begin
  current_week_start := date_trunc('week', new.created_at)::date;

  -- Handle Product Clicks
  if new.event_type = 'product_click' and new.product_id is not null then
    insert into public.product_analytics (product_id, week_start, click_count)
    values (new.product_id, current_week_start, 1)
    on conflict (product_id, week_start)
    do update set click_count = product_analytics.click_count + 1;
  end if;

  -- Handle Search (find matching products and increment search_count)
  if new.event_type = 'search' and new.search_query is not null and length(new.search_query) > 2 then
     -- Search for products matching the query (simple ILIKE) and increment their search_count
     insert into public.product_analytics (product_id, week_start, search_count)
     select id, current_week_start, 1
     from public.products
     where name ilike '%' || new.search_query || '%'
     on conflict (product_id, week_start)
     do update set search_count = product_analytics.search_count + 1;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for product clicks and searches
create trigger on_event_created
  after insert on public.events
  for each row
  execute function public.update_product_analytics();

-- Enable Row Level Security (RLS)
alter table public.visitors enable row level security;
alter table public.page_views enable row level security;
alter table public.events enable row level security;
alter table public.product_analytics enable row level security;

-- Create policies (Allow public insert for tracking, read for everyone or admin)
-- Visitors
create policy "Allow public insert visitors" on public.visitors for insert with check (true);
create policy "Allow public select visitors" on public.visitors for select using (true); 

-- Page Views
create policy "Allow public insert page_views" on public.page_views for insert with check (true);
create policy "Allow public update page_views" on public.page_views for update using (true);
create policy "Allow public select page_views" on public.page_views for select using (true);

-- Events
create policy "Allow public insert events" on public.events for insert with check (true);
create policy "Allow public select events" on public.events for select using (true);

-- Product Analytics
create policy "Allow public read product_analytics" on public.product_analytics for select using (true);
