import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
// Import from lib directly to avoid pdf-parse's self-test that reads a local fixture file
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require('pdf-parse/lib/pdf-parse.js')

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Please upload a valid PDF file.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const parsed = await pdfParse(buffer)
    const rawText = parsed.text.trim()

    if (!rawText) {
      return NextResponse.json({ error: 'Could not extract text from this PDF. Make sure it is not a scanned image.' }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('guidelines')
      .insert({ filename: file.name, raw_text: rawText })
      .select('id')
      .single()

    if (error) {
      // Postgres unique constraint violation — same filename already exists
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `A file named "${file.name}" has already been uploaded.` },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ id: data.id })
  } catch (err: unknown) {
    console.error('Upload error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
