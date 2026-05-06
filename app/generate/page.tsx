'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Guideline, WorksheetContent, Domain } from '@/lib/types'

const DOMAIN_COLORS: Record<Domain, string> = {
  Cognitive: 'bg-blue-100 text-blue-800',
  Language: 'bg-purple-100 text-purple-800',
  'Social-Emotional': 'bg-pink-100 text-pink-800',
  Physical: 'bg-green-100 text-green-800',
  Adaptive: 'bg-orange-100 text-orange-800',
}

export default function GeneratePage() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [childAge, setChildAge] = useState('5')
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [worksheet, setWorksheet] = useState<WorksheetContent | null>(null)
  const [domains, setDomains] = useState<Domain[]>([])

  useEffect(() => {
    supabase
      .from('guidelines')
      .select('id, filename, uploaded_at')
      .order('uploaded_at', { ascending: false })
      .then(({ data }) => setGuidelines((data as Guideline[]) ?? []))
  }, [])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setStatus('generating')
    setErrorMsg('')
    setWorksheet(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guidelineId: selectedId, childAge: Number(childAge) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setWorksheet(data.worksheet)
      setDomains(data.domains)
      setStatus('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Generate Worksheet</h1>
        <p className="text-gray-500">
          Select a saved guideline and enter the child&apos;s age to generate a worksheet.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="no-print bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curriculum Guideline
          </label>
          {guidelines.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              No guidelines uploaded yet.{' '}
              <a href="/upload" className="underline font-medium">Upload one first.</a>
            </p>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">— Select a guideline —</option>
              {guidelines.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.filename} (uploaded {new Date(g.uploaded_at).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Child Age
          </label>
          <input
            type="number"
            min={3}
            max={6}
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            required
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <span className="ml-2 text-sm text-gray-400">years (3–6)</span>
        </div>

        <button
          type="submit"
          disabled={status === 'generating' || guidelines.length === 0}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'generating' ? 'Generating… (this may take 20–30 seconds)' : 'Generate Worksheet'}
        </button>
      </form>

      {status === 'error' && (
        <div className="no-print p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-medium">Generation failed</p>
          <p className="text-sm mt-1">{errorMsg}</p>
        </div>
      )}

      {status === 'success' && worksheet && (
        <WorksheetDisplay worksheet={worksheet} domains={domains} />
      )}
    </div>
  )
}

function WorksheetDisplay({ worksheet, domains }: { worksheet: WorksheetContent; domains: Domain[] }) {
  const allDomains: Domain[] = ['Cognitive', 'Language', 'Social-Emotional', 'Physical', 'Adaptive']

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 print:shadow-none print:border-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{worksheet.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Age: {worksheet.childAge} years</p>
        </div>
        <button
          onClick={() => window.print()}
          className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors print:hidden"
        >
          Print / Save PDF
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Domains covered
        </p>
        <div className="flex flex-wrap gap-2">
          {allDomains.map((d) => (
            <span
              key={d}
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                domains.includes(d)
                  ? DOMAIN_COLORS[d]
                  : 'bg-gray-100 text-gray-400 line-through'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {worksheet.activities.map((activity, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOMAIN_COLORS[activity.domain]}`}
              >
                {activity.domain}
              </span>
              <h3 className="font-semibold text-gray-800 text-sm">{activity.title}</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3">{activity.instruction}</p>
            {activity.materials.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                  Materials
                </p>
                <ul className="flex flex-wrap gap-1">
                  {activity.materials.map((m, j) => (
                    <li
                      key={j}
                      className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
