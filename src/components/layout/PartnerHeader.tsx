'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface PartnerHeaderProps {
  partnerName?: string
}

export function PartnerHeader({ partnerName }: PartnerHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/partner/session', { method: 'DELETE' })
    router.push('/partner')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-serif text-primary-700">
              MemoriQR
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/partner/dashboard" className="text-gray-600 hover:text-gray-900">
              Partner Portal
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {partnerName && (
              <span className="text-sm text-gray-600">{partnerName}</span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
