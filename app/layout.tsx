import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kindergarten Worksheet Generator',
  description: 'AI-powered worksheet generation from curriculum guidelines',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} min-h-full flex flex-col bg-gray-50`}>
        <nav className="bg-white border-b border-gray-200 shadow-sm print:hidden">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
            <span className="font-bold text-indigo-600 text-lg">
              KinderSheets
            </span>
            <Link
              href="/upload"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Upload Guidelines
            </Link>
            <Link
              href="/generate"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Generate Worksheet
            </Link>
            <Link
              href="/history"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              History
            </Link>
          </div>
        </nav>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
