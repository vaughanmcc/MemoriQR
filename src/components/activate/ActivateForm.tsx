'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { validateActivationCode } from '@/lib/utils'

export function ActivateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanCode = code.toUpperCase()
    
    if (!validateActivationCode(cleanCode)) {
      setError('Please enter a valid activation code (e.g., MQR-10B-XXXXXX)')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/activate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid activation code')
      }

      // Redirect to memorial setup page
      router.push(`/activate/${cleanCode}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <label className="label">Activation Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="e.g., MQR-10B-XXXXXX"
            className="input text-center text-xl tracking-widest uppercase"
            maxLength={20}
            autoComplete="off"
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 8}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have a code?{' '}
        <a href="/order" className="text-primary-600 hover:underline">
          Order a memorial tag
        </a>
      </p>
    </div>
  )
}
