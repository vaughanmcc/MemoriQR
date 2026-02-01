'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

interface PartnerOption {
  id: string
  name: string
}

export default function PartnerLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code' | 'select-business'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [trustDevice, setTrustDevice] = useState(false)
  const [showTrustWarning, setShowTrustWarning] = useState(false)
  const [warningAcknowledged, setWarningAcknowledged] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [partnerOptions, setPartnerOptions] = useState<PartnerOption[]>([])

  // Check if user has previously acknowledged the warning
  useEffect(() => {
    const acknowledged = localStorage.getItem('partner_trust_warning_ack')
    if (acknowledged === 'true') {
      setWarningAcknowledged(true)
    }
  }, [])

  const handleTrustDeviceChange = (checked: boolean) => {
    if (checked && !warningAcknowledged) {
      // Clear any previous acknowledgment to ensure warning shows
      // This handles the case where admin revoked trust or partner previously disabled it
      setShowTrustWarning(true)
    } else if (checked) {
      setTrustDevice(true)
    } else {
      setTrustDevice(false)
    }
  }

  const confirmTrustDevice = () => {
    if (dontShowAgain) {
      localStorage.setItem('partner_trust_warning_ack', 'true')
      setWarningAcknowledged(true)
    }
    setTrustDevice(true)
    setShowTrustWarning(false)
  }

  const cancelTrustDevice = () => {
    setTrustDevice(false)
    setShowTrustWarning(false)
    setDontShowAgain(false)
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send login code')
        return
      }

      setMessage(data.message)
      setStep('code')
    } catch (err) {
      setError('Failed to send login code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent, selectedPartnerId?: string) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, trustDevice, partnerId: selectedPartnerId })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid code')
        return
      }

      // Check if multiple businesses require selection
      if (data.requiresSelection && data.partners) {
        setPartnerOptions(data.partners)
        setMessage(data.message)
        setStep('select-business')
        return
      }

      // Redirect to dashboard
      router.push('/partner/dashboard')
    } catch (err) {
      setError('Failed to verify code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBusiness = async (partnerId: string) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, trustDevice, partnerId })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to select business')
        return
      }

      // Redirect to dashboard
      router.push('/partner/dashboard')
    } catch (err) {
      setError('Failed to select business. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-memorial-cream to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif text-primary-700">MemoriQR</h1>
          </Link>
          <p className="text-gray-600 text-lg mt-2">Partner Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">
            {step === 'email' ? 'Partner Login' : step === 'code' ? 'Enter Verification Code' : 'Select Business'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base">
              {error}
            </div>
          )}

          {message && (step === 'code' || step === 'select-business') && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-base">
              {message}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestCode}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">
                  Partner Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@veterinaryclinic.co.nz"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Login Code'}
              </button>
            </form>
          ) : step === 'select-business' ? (
            <div>
              <p className="text-gray-600 text-base mb-4">
                Your email is linked to multiple businesses. Select which one to log into:
              </p>

              <div className="space-y-2">
                {partnerOptions.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => handleSelectBusiness(partner.id)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-colors text-left disabled:opacity-50"
                  >
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{partner.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep('code')
                  setPartnerOptions([])
                }}
                className="mt-4 w-full text-gray-500 text-sm hover:text-gray-700"
              >
                ← Back to code entry
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => handleVerifyCode(e)}>
              <p className="text-gray-600 text-base mb-4">
                We sent a 6-digit code to <strong>{email}</strong>. 
                Enter it below to continue.
              </p>

              <div className="mb-4">
                <label htmlFor="code" className="block text-base font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => handleTrustDeviceChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-base text-gray-600">
                    <strong>Stay signed in longer</strong>
                    <br />
                    <span className="text-sm text-gray-500">Keep me logged in for 24 hours on this device</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true)
                  setError('')
                  setCode('')
                  try {
                    const response = await fetch('/api/partner/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email })
                    })
                    const data = await response.json()
                    if (!response.ok) {
                      setError(data.error || 'Failed to send new code')
                    } else {
                      setMessage('New verification code sent!')
                    }
                  } catch {
                    setError('Failed to send new code. Please try again.')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="w-full mt-3 text-primary-600 text-sm hover:text-primary-800 font-medium disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Request New Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError('')
                  setMessage('')
                }}
                className="w-full mt-3 text-gray-600 text-sm hover:text-gray-900"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-base mt-6">
          Not a partner yet?{' '}
          <Link href="/contact" className="text-primary-600 hover:underline">
            Contact us
          </Link>{' '}
          to learn about our partner program.
        </p>
      </div>

      {/* Trust Device Warning Modal */}
      {showTrustWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Extended Session Warning
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-base">
                Selecting <strong>&quot;Stay signed in longer&quot;</strong> will keep you logged in for <strong>24 hours</strong> instead of the standard 1 hour.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-base font-medium mb-2">Security Considerations:</p>
                <ul className="text-amber-700 text-base space-y-1 list-disc list-inside">
                  <li>Anyone with access to this device can access your partner account</li>
                  <li>Your commission data and business information will be accessible</li>
                  <li>Only use on personal, secure devices you control</li>
                </ul>
              </div>

              <p className="text-gray-500 text-sm">
                You can always log out manually at any time from the Partner Portal.
              </p>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-base text-gray-600">Don&apos;t show this warning again</span>
              </label>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
              <button
                onClick={cancelTrustDevice}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmTrustDevice}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                I Understand, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
