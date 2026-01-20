import Link from 'next/link'

export function SimpleHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="container-wide flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="MemoriQR" 
            className="h-16 md:h-20 w-auto"
          />
        </Link>

        {/* Simple right-side link */}
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          ← Back to Home
        </Link>
      </nav>
    </header>
  )
}
