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

## 🎨 Child Development Domains

KinderSheets covers these five universally recognized domains:

| Domain | Color | Focus |
|--------|-------|-------|
| **Cognitive** | 🔵 Blue | Problem-solving, reasoning, learning |
| **Language** | 🟣 Purple | Communication, vocabulary, literacy |
| **Social-Emotional** | 🩷 Pink | Emotions, relationships, empathy |
| **Physical** | 🟢 Green | Motor skills, coordination, health |
| **Adaptive** | 🟠 Orange | Self-care, independence, life skills |

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Google Gemini 2.5 Flash
- **PDF Processing:** pdf-parse

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

---

**Built with ❤️ to make kindergarten education more equitable and unbiased.**
