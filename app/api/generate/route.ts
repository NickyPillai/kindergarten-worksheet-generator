import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'
import type { WorksheetContent, Domain } from '@/lib/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const MODEL = 'gemini-2.5-flash'
const REQUIRED_DOMAINS = 4
const MAX_RETRIES = 2

function buildPrompt(guidelineText: string, age: number, strict = false): string {
  const strictNote = strict
    ? '\nCRITICAL: The previous attempt did not cover enough domains. You MUST cover at least 4 different domains this time. Assign each of the 5 activities a DIFFERENT domain — Cognitive, Language, Social-Emotional, Physical, Adaptive — using at most one repeat.\n'
    : ''

  return `You are a kindergarten worksheet generator. You must only use content from the curriculum guidelines provided. Do not use any outside knowledge or internet sources. Generate content that is free of cultural, gender, and socioeconomic bias.
${strictNote}
Generate a kindergarten worksheet for a child aged ${age}.

CURRICULUM GUIDELINES (use only this content):
${guidelineText}

INSTRUCTIONS:
- Create exactly 5 activities
- Label each with one of these domains: Cognitive, Language, Social-Emotional, Physical, Adaptive
- Cover at least 4 different domains across the 5 activities
- Use simple words suitable for age ${age}
- Each activity needs: a title, a clear instruction for the child, and a list of materials needed

Return ONLY valid JSON in this exact format, nothing else:
{
  "title": "Worksheet title here",
  "childAge": ${age},
  "activities": [
    {
      "domain": "Cognitive",
      "title": "Activity title",
      "instruction": "What the child should do",
      "materials": ["item1", "item2"]
    }
  ]
}`
}

async function callGemini(prompt: string): Promise<WorksheetContent> {
  const model = genAI.getGenerativeModel({ model: MODEL })
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Gemini did not return valid JSON.')

  const parsed: WorksheetContent = JSON.parse(jsonMatch[0])

  if (!parsed.title || !Array.isArray(parsed.activities) || parsed.activities.length === 0) {
    throw new Error('Response JSON is missing required fields.')
  }

  return parsed
}

function countDomains(worksheet: WorksheetContent): Domain[] {
  const unique = new Set(worksheet.activities.map((a) => a.domain))
  return [...unique] as Domain[]
}

export async function POST(req: NextRequest) {
  try {
    const { guidelineId, childAge } = await req.json()

    if (!guidelineId || !childAge) {
      return NextResponse.json({ error: 'guidelineId and childAge are required.' }, { status: 400 })
    }

    const age = Number(childAge)
    if (age < 3 || age > 6) {
      return NextResponse.json({ error: 'Child age must be between 3 and 6.' }, { status: 400 })
    }

    const { data: guideline, error: fetchError } = await supabase
      .from('guidelines')
      .select('raw_text')
      .eq('id', guidelineId)
      .single()

    if (fetchError || !guideline) {
      return NextResponse.json({ error: 'Guideline not found.' }, { status: 404 })
    }

    let worksheet: WorksheetContent | null = null
    let domains: Domain[] = []
    let attempt = 0

    while (attempt <= MAX_RETRIES) {
      const strict = attempt > 0
      const prompt = buildPrompt(guideline.raw_text, age, strict)
      worksheet = await callGemini(prompt)
      domains = countDomains(worksheet)
      if (domains.length >= REQUIRED_DOMAINS) break
      attempt++
    }

    if (!worksheet || domains.length < REQUIRED_DOMAINS) {
      return NextResponse.json(
        { error: `Generated worksheet only covers ${domains.length} domains after ${MAX_RETRIES + 1} attempts. Please try again.` },
        { status: 422 }
      )
    }

    const { data: saved, error: saveError } = await supabase
      .from('worksheets')
      .insert({
        guideline_id: guidelineId,
        title: worksheet.title,
        content_json: worksheet,
        domain_coverage: domains,
      })
      .select('id')
      .single()

    if (saveError) throw saveError

    return NextResponse.json({ id: saved.id, worksheet, domains })
  } catch (err: unknown) {
    console.error('Generate error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
