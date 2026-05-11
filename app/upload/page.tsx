'use client'

import { useState, useRef } from 'react'

export default function UploadPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = inputRef.current?.files?.[0]
    if (!file) return

    setStatus('uploading')
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)

    if (file.size > 4 * 1024 * 1024) {
      setStatus('error')
      setMessage('File is too large. Please use a PDF under 4 MB.')
      return
    }

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      let data: { error?: string; id?: string } = {}
      try {
        data = await res.json()
      } catch {
        if (res.status === 413) throw new Error('File is too large for the server (max 4 MB). Please use a smaller PDF.')
        throw new Error(`Server error (HTTP ${res.status}). Please try again.`)
      }

      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setStatus('success')
      if (inputRef.current) inputRef.current.value = ''
    } catch (err: unknown) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Upload Guidelines</h1>
      <p className="text-gray-500 mb-6">
        Upload a government curriculum PDF. The text will be extracted and saved
        so you can use it to generate worksheets.
      </p>

      <form onSubmit={handleUpload} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Curriculum PDF
          </label>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'uploading'}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'uploading' ? 'Extracting & Saving…' : 'Upload PDF'}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <p className="font-medium">Upload successful!</p>
          <p className="text-sm mt-1">Your curriculum PDF has been saved and is ready to use on the Generate page.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-medium">Upload failed</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
      )}
    </div>
  )
}
