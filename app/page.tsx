import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1 className="text-4xl font-bold text-gray-800">
        Kindergarten Worksheet Generator
      </h1>
      <p className="text-gray-500 max-w-md text-lg">
        Upload a curriculum PDF, then generate personalised worksheets for your
        students — covering all 5 child development domains.
      </p>
      <div className="flex gap-4 mt-2">
        <Link
          href="/upload"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Upload Guidelines
        </Link>
        <Link
          href="/generate"
          className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
        >
          Generate Worksheet
        </Link>
      </div>
    </div>
  )
}
