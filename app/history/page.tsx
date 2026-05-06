'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Worksheet, WorksheetContent, Domain } from '@/lib/types'

const DOMAIN_COLORS: Record<Domain, string> = {
  Cognitive: 'bg-blue-100 text-blue-800',
  Language: 'bg-purple-100 text-purple-800',
  'Social-Emotional': 'bg-pink-100 text-pink-800',
  Physical: 'bg-green-100 text-green-800',
  Adaptive: 'bg-orange-100 text-orange-800',
}

export default function HistoryPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Worksheet | null>(null)

  useEffect(() => {
    supabase
      .from('worksheets')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setWorksheets((data as Worksheet[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="text-gray-400">Loading history…</p>
  }

  if (worksheets.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No worksheets generated yet.</p>
        <a href="/generate" className="mt-4 inline-block text-indigo-600 underline text-sm">
          Generate your first worksheet
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="no-print text-2xl font-bold text-gray-800">Worksheet History</h1>

      {selected ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelected(null)}
            className="no-print text-sm text-indigo-600 hover:underline"
          >
            ← Back to list
          </button>
          <WorksheetDetail worksheet={selected} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Age</th>
                <th className="px-4 py-3 text-left">Domains</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {worksheets.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setSelected(w)}
                  className="cursor-pointer hover:bg-indigo-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{w.title}</td>
                  <td className="px-4 py-3 text-gray-500">{w.content_json?.childAge ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(w.domain_coverage ?? []).map((d) => (
                        <span
                          key={d}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOMAIN_COLORS[d as Domain]}`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(w.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function WorksheetDetail({ worksheet }: { worksheet: Worksheet }) {
  const content: WorksheetContent = worksheet.content_json
  const allDomains: Domain[] = ['Cognitive', 'Language', 'Social-Emotional', 'Physical', 'Adaptive']
  const covered = worksheet.domain_coverage as Domain[]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 print:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{content.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Age: {content.childAge} years</p>
        </div>
        <button
          onClick={() => window.print()}
          className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors print:hidden"
        >
          Print / Save PDF
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Domains covered</p>
        <div className="flex flex-wrap gap-2">
          {allDomains.map((d) => (
            <span
              key={d}
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                covered.includes(d) ? DOMAIN_COLORS[d] : 'bg-gray-100 text-gray-400 line-through'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {content.activities.map((activity, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOMAIN_COLORS[activity.domain]}`}>
                {activity.domain}
              </span>
              <h3 className="font-semibold text-gray-800 text-sm">{activity.title}</h3>
            </div>
            <p className="text-gray-700 text-sm mb-3">{activity.instruction}</p>
            {activity.materials.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Materials</p>
                <ul className="flex flex-wrap gap-1">
                  {activity.materials.map((m, j) => (
                    <li key={j} className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600">
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
