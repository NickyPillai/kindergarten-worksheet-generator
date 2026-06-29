# KinderSheets — AI-Powered Kindergarten Worksheet Generator

An intelligent tool that generates personalized, unbiased kindergarten worksheets based on government-defined curriculum guidelines. Leveraging AI and the **Unmukh framework**, KinderSheets ensures consistent, equitable learning experiences across all five child development domains.

## 🎯 Purpose

Traditional worksheet creation often carries unconscious human biases—whether in language complexity, cultural references, or the balance of learning domains covered. **KinderSheets removes this bias** by:

- 📋 Using **Unmukh government guidelines** as the authoritative source
- 🤖 Leveraging AI (Google Gemini) to generate content based on structured guidelines
- ✅ Ensuring **all 5 child development domains** are systematically covered
- 👥 Creating equitable worksheets for diverse student populations
- 🎨 Maintaining pedagogically sound, age-appropriate activities

## ✨ Features

- **PDF Curriculum Upload** — Extract text from curriculum guidelines (PDFs)
- **Worksheet Generation** — AI generates worksheets covering 4–5 child development domains
- **Bias-Free Design** — Structured AI prompts ensure consistent, unbiased output
- **History Tracking** — View and manage previously generated worksheets
- **Domain Coverage Validation** — Auto-retry if domain coverage is insufficient
- **Print-Ready Output** — Download and print worksheets directly

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Google Gemini 2.5 Flash
- **PDF Processing:** pdf-parse

### Folder Structure
```
app/
  layout.tsx              # Root layout with navigation
  page.tsx                # Home / landing page
  upload/page.tsx         # [Hidden] PDF upload UI
  generate/page.tsx       # Worksheet generation form
  history/page.tsx        # Past worksheets list
  api/
    upload/route.ts       # POST /api/upload
    generate/route.ts     # POST /api/generate

lib/
  supabase.ts             # Supabase client
  types.ts                # TypeScript types

public/
  favicon.ico             # App icon

styles/
  globals.css             # Global styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Cloud API key (Gemini)

### 1. Environment Setup

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

**Where to find these:**
| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon key |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API Key |

### 2. Database Setup

Run this SQL in your Supabase SQL editor to create the required tables:

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

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit **http://localhost:3000** to start using KinderSheets.

## 📊 How It Works

### Worksheet Generation Flow

1. **Upload Guidelines** (Optional — pre-loaded with Unmukh framework)
   - Teacher uploads a PDF with curriculum guidelines
   - `/api/upload` extracts text using pdf-parse
   - Raw text is stored in the `guidelines` table

2. **Enter Student Details**
   - Navigate to **Generate Worksheet**
   - Select curriculum guidelines
   - Input student age

3. **AI Generation**
   - `/api/generate` fetches the guideline text
   - Builds a structured prompt incorporating:
     - Student age
     - Curriculum context
     - Domain coverage requirements
   - Calls Gemini 2.5 Flash with the prompt
   - Parses JSON response into structured worksheet

4. **Validation & Retry**
   - Checks that **at least 4 of 5 domains** are covered
   - If insufficient: automatically retries with stricter prompt (max 2 retries)
   - Once valid, saves worksheet to `worksheets` table

5. **View & Print**
   - Displays worksheet with colored domain badges
   - Print button for physical copies
   - Past worksheets accessible via **History**

## 🎨 Child Development Domains

KinderSheets covers these five universally recognized domains:

| Domain | Color | Focus |
|--------|-------|-------|
| **Cognitive** | 🔵 Blue | Problem-solving, reasoning, learning |
| **Language** | 🟣 Purple | Communication, vocabulary, literacy |
| **Social-Emotional** | 🩷 Pink | Emotions, relationships, empathy |
| **Physical** | 🟢 Green | Motor skills, coordination, health |
| **Adaptive** | 🟠 Orange | Self-care, independence, life skills |

## 🛠️ Available Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint code quality check
```

## 📝 Notes for Developers

- **Supabase Auth:** Currently using public anon key (auth-less). RLS policies can be added when authentication is introduced.
- **PDF Limitations:** pdf-parse works on text-based PDFs only. Scanned/image-based PDFs will return empty text.
- **AI Model:** Uses `gemini-2.5-flash`. Update in `api/generate/route.ts` if deprecated.
- **Children Table:** Created but not yet wired to UI (future feature for personalized tracking).
- **Tailwind Config:** Uses @tailwindcss/postcss (v4 syntax).

## 🔒 Removing Bias: How It Works

Traditional worksheets carry implicit biases in:
- **Language complexity** — varies by teacher interpretation
- **Cultural examples** — reflect creator's background
- **Domain balance** — unconsciously favored areas
- **Accessibility** — may not consider diverse learners

**KinderSheets solves this by:**
1. **Structured Input** — Uses government Unmukh guidelines as the objective source
2. **Deterministic AI** — AI prompt templates ensure consistent generation rules
3. **Domain Validation** — Mathematically enforces coverage of all 5 domains
4. **Reproducibility** — Same guidelines + age = predictable, fair output
5. **Transparency** — Teachers see which domains are covered via badges

## 📚 Future Enhancements

- [ ] Student profiles and personalized learning tracking
- [ ] Multi-language support
- [ ] Difficulty level selection
- [ ] Worksheet templates gallery
- [ ] Teacher collaboration & sharing
- [ ] Analytics on domain coverage trends

## 📄 License

This project is open-source. See LICENSE for details.

## 🤝 Contributing

Contributions welcome! Please ensure:
- Code follows the existing style (ESLint)
- All changes include tests where applicable
- Commit messages are clear and descriptive

## 📧 Support

For issues, questions, or feedback, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ to make kindergarten education more equitable and unbiased.**
