-- One row per respondent, flat columns (CSV / chart friendly).
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  q1_buy_frequency text check (q1_buy_frequency in ('weekly','monthly','every_few_months','rarely')),

  q2_shop_fast_fashion   boolean not null default false,
  q2_shop_street_markets boolean not null default false,
  q2_shop_thrift         boolean not null default false,
  q2_shop_sustainable    boolean not null default false,

  q3_top_factor text check (q3_top_factor in ('price','trends','quality','eco_friendly')),
  q4_unworn_items text check (q4_unworn_items in ('0-5','6-10','11-20','20+')),
  q5_disposal text check (q5_disposal in ('donated','passed_down','repurposed','trash')),
  q6_waste_awareness smallint check (q6_waste_awareness between 1 and 5),
  q7_water_footprint text check (q7_water_footprint in ('influences_me','heard_still_buy','no_idea')),
  q8_pay_more text check (q8_pay_more in ('yes','maybe','no')),

  q9_habit_swap         boolean not null default false,
  q9_habit_thrifting    boolean not null default false,
  q9_habit_mending      boolean not null default false,
  q9_habit_no_buy_month boolean not null default false,
  q9_habit_none         boolean not null default false,

  q10_barrier text check (char_length(q10_barrier) <= 500)
);

-- No policies: only the server (service role) can read/write.
alter table public.survey_responses enable row level security;

-- Readable export view, question order, for CSV download from the dashboard.
create or replace view public.survey_export with (security_invoker = true) as
select
  created_at,
  q1_buy_frequency, q2_shop_fast_fashion, q2_shop_street_markets, q2_shop_thrift, q2_shop_sustainable,
  q3_top_factor, q4_unworn_items, q5_disposal, q6_waste_awareness, q7_water_footprint, q8_pay_more,
  q9_habit_swap, q9_habit_thrifting, q9_habit_mending, q9_habit_no_buy_month, q9_habit_none,
  q10_barrier
from public.survey_responses
order by created_at;
