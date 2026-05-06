# Kindergarten Worksheet Generator — PoC

AI-powered tool for teachers: upload a curriculum PDF, generate kindergarten
worksheets covering at least 4 of 5 child development domains.

## Commands

```bash
npm run dev      # Start local dev server at http://localhost:3000
npm run build    # Production build (run before deploying)
npm run lint     # ESLint check
```

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Supabase (Postgres DB + auth-less client)
- Google Gemini 2.5 Flash (AI generation)
- pdf-parse (PDF text extraction)

## Folder Structure

```
app/
  layout.tsx          — Root layout with top navigation bar
  page.tsx            — Home / landing page
  upload/page.tsx     — Feature A: PDF upload UI
  generate/page.tsx   — Feature B+C: worksheet generation form + display
  history/page.tsx    — Feature D: list of past worksheets, click to view
  api/
    upload/route.ts   — POST /api/upload — extracts PDF text, saves to Supabase
    generate/route.ts — POST /api/generate — calls Gemini, saves worksheet
lib/
  supabase.ts         — Supabase client singleton
  types.ts            — Shared TypeScript types (Domain, Activity, Worksheet…)
```

## Environment Variables (.env.local)

| Variable                        | Where to find it                                    |
|---------------------------------|-----------------------------------------------------|
| NEXT_PUBLIC_SUPABASE_URL        | Supabase dashboard → Settings → API → Project URL   |
| NEXT_PUBLIC_SUPABASE_ANON_KEY   | Supabase dashboard → Settings → API → anon key      |
| GEMINI_API_KEY                  | aistudio.google.com → Get API Key                   |

## Supabase Tables

Run this SQL in the Supabase SQL editor to create the tables:

```sql
create table guidelines (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  raw_text text not null,
  uploaded_at timestamptz default now()
);

create table worksheets (
  id uuid primary key default gen_random_uuid(),
  guideline_id uuid references guidelines(id),
  title text not null,
  content_json jsonb not null,
  domain_coverage text[] not null,
  created_at timestamptz default now()
);

create table children (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int not null,
  class_name text,
  created_at timestamptz default now()
);
```

## Generation Flow (end to end)

1. Teacher uploads PDF at `/upload`
2. `POST /api/upload` extracts text with pdf-parse, saves row to `guidelines`
3. Teacher goes to `/generate`, selects guideline + enters child age
4. `POST /api/generate`:
   a. Fetches guideline text from Supabase
   b. Builds prompt (see `buildPrompt()` in api/generate/route.ts)
   c. Calls Gemini 2.5 Flash
   d. Parses JSON response
   e. Checks domain count — if < 4, retries with stricter prompt (max 2 retries)
   f. Saves worksheet to `worksheets` table
   g. Returns worksheet JSON to frontend
5. Frontend displays worksheet with coloured domain badges + Print button
6. Past worksheets listed at `/history`

## Domain Colour Key

- Cognitive → blue
- Language → purple
- Social-Emotional → pink
- Physical → green
- Adaptive → orange

## Notes for Future Claude Code Sessions

- The Supabase client uses the anon key (public, safe for browser). RLS policies
  can be added later if auth is introduced.
- The Gemini model name is `gemini-2.5-flash` — update in api/generate/route.ts
  if the model is deprecated.
- pdf-parse works on text-based PDFs only. Scanned image PDFs will return empty
  text and the upload will return a 422 error.
- The `children` table is created but not yet wired to the UI (future feature).
- Tailwind v4 uses @tailwindcss/postcss instead of the old tailwind.config.js.
