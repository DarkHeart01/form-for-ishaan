# The Real Cost of Our Closets: Pune Edition

Mobile-first survey (Next.js + Tailwind + Supabase). Responses are stored as one flat row per respondent, ready for CSV export.

## Setup
1. Create a Supabase project, then run [supabase/schema.sql](supabase/schema.sql) in the SQL editor.
2. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).
3. `npm install && npm run dev`

## Deploy to Vercel
Push to GitHub, import the repo in Vercel, add the same two env vars, deploy.

## Export data
Supabase dashboard → Table Editor → `survey_export` view → Export → CSV.

Columns: `q1_buy_frequency`, `q2_shop_*` (boolean per option), `q3_top_factor`, `q4_unworn_items`, `q5_disposal`,
`q6_waste_awareness` (1–5), `q7_water_footprint`, `q8_pay_more`, `q9_habit_*` (boolean per option), `q10_barrier` (free text).
Unanswered single-choice questions are empty (NULL); unticked multi-choice options are `false`.
