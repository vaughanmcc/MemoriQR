'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { LogOut, ChevronDown, Building2 } from 'lucide-react'

interface LinkedPartner {
  id: string
  partner_name: string
}

interface PartnerHeaderProps {
  partnerName?: string
  linkedPartners?: LinkedPartner[]
}

export function PartnerHeader({ partnerName: propPartnerName, linkedPartners: propLinkedPartners }: PartnerHeaderProps) {
  const router = useRouter()
  const [partnerName, setPartnerName] = useState(propPartnerName || '')
  const [linkedPartners, setLinkedPartners] = useState<LinkedPartner[]>(propLinkedPartners || [])
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [switching, setSwitching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch session data to get linkedPartners (always fetch, props are just initial values)
  useEffect(() => {
    fetch('/api/partner/session')
      .then(res => res.json())
      .then(data => {
        if (data.partner && !propPartnerName) {
          setPartnerName(data.partner.name)
        }
        if (data.linkedPartners) {
          setLinkedPartners(data.linkedPartners)
        }
      })
      .catch(() => {})
  }, [propPartnerName])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSwitcher(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/partner/session', { method: 'DELETE' })
    router.push('/partner')
  }

  const handleSwitchPartner = async (partnerId: string) => {
    setSwitching(true)
    try {
      const response = await fetch('/api/partner/session/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId })
      })

      if (response.ok) {
        // Reload the page to get fresh data for the new partner
        window.location.href = '/partner/dashboard'
      } else {
        console.error('Failed to switch partner')
        setSwitching(false)
      }
    } catch (error) {
      console.error('Failed to switch partner:', error)
      setSwitching(false)
    }
    setShowSwitcher(false)
  }

  const hasMultipleBusinesses = linkedPartners.length > 0

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
              <div className="relative" ref={dropdownRef}>
                {hasMultipleBusinesses ? (
                  <button
                    onClick={() => setShowSwitcher(!showSwitcher)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    disabled={switching}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">{partnerName}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">{partnerName}</span>
                  </span>
                )}

                {/* Business Switcher Dropdown */}
                {showSwitcher && hasMultipleBusinesses && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Switch Business
                    </div>
                    <div className="py-1">
                      <div className="px-3 py-2 text-sm text-gray-900 bg-emerald-50 border-l-2 border-emerald-500">
                        <span className="font-medium">{partnerName}</span>
                        <span className="text-xs text-gray-500 ml-2">(current)</span>
                      </div>
                      {linkedPartners.map(partner => (
                        <button
                          key={partner.id}
                          onClick={() => handleSwitchPartner(partner.id)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          disabled={switching}
                        >
                          {partner.partner_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
