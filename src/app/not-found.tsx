import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-memorial-cream px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-serif text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-serif text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Go home
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
