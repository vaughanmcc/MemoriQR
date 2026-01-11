import Link from 'next/link'

export default function MemorialNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-memorial-cream px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-serif text-gray-900 mb-4">
          Memorial Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn't find this memorial. It may have been removed, 
          or the link might be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
