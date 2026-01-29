'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Tag, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react'

interface ReferralCode {
  id: string
  code: string
  discount_percent: number
  commission_percent: number
  free_shipping: boolean
  is_used: boolean
  used_at: string | null
  created_at: string
  expires_at: string | null
  batch_id: string | null
  batch_name: string | null
}

interface Batch {
  batch_id: string
  batch_name: string | null
  total: number
  used: number
  available: number
  discount_percent: number
  commission_percent: number
  free_shipping: boolean
  created_at: string
}

interface Summary {
  total: number
  available: number
  used: number
}

export default function PartnerReferralsPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<ReferralCode[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, available: 0, used: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'batches' | 'codes'>('batches')

  useEffect(() => {
    fetchReferrals()
  }, [filter])

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`/api/partner/referrals?status=${filter}`)
      
      if (response.status === 401) {
        router.push('/partner')
        return
      }

      const data = await response.json()
      setCodes(data.codes || [])
      setBatches(data.batches || [])
      setSummary(data.summary || { total: 0, available: 0, used: 0 })
    } catch (err) {
      console.error('Failed to fetch referral codes:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const copyOrderLink = (code: string) => {
    const url = `${window.location.origin}/order?ref=${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(`link-${code}`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const downloadCodes = (batchId?: string) => {
    const codesToDownload = batchId 
      ? codes.filter(c => c.batch_id === batchId && !c.is_used)
      : codes.filter(c => !c.is_used)
    
    const batch = batchId ? batches.find(b => b.batch_id === batchId) : null
    
    const csv = [
      'Referral Code,Order Link,Discount,Commission,Free Shipping,Created',
      ...codesToDownload.map(c => 
        `${c.code},${window.location.origin}/order?ref=${c.code},${c.discount_percent}%,${c.commission_percent}%,${c.free_shipping ? 'Yes' : 'No'},${new Date(c.created_at).toLocaleDateString()}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `referral-codes-${batch?.batch_name || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/partner/dashboard" 
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Referral Codes</h1>
              <p className="text-sm text-gray-600">Referral codes for your customers</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="h-5 w-5 text-primary-600" />
              <span className="text-gray-600 text-sm">Total Cards</span>
            </div>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-gray-600 text-sm">Available</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{summary.available}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600 text-sm">Redeemed</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.used}</p>
            {summary.total > 0 && (
              <p className="text-sm text-gray-500">
                {Math.round((summary.used / summary.total) * 100)}% conversion
              </p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-900 mb-2">How Referral Codes Work</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Give customers a card with a scratch-off referral code</li>
            <li>• Customer visits the order page and enters the code for their discount</li>
            <li>• You earn commission on each successful order</li>
            <li>• Track your conversions and earnings in the Commissions tab</li>
          </ul>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'batches'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Batches
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'codes'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Individual Codes
          </button>
        </div>

        {activeTab === 'batches' ? (
          /* Batches View */
          <div className="bg-white rounded-lg shadow">
            {batches.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No referral codes yet</p>
                <p className="text-sm mt-1">Contact us to request referral codes</p>
              </div>
            ) : (
              <div className="divide-y">
                {batches.map(batch => (
                  <div key={batch.batch_id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {batch.batch_name || `Batch ${batch.batch_id.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(batch.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadCodes(batch.batch_id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                        disabled={batch.available === 0}
                      >
                        <Download className="h-4 w-4" />
                        Download Available
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-500">Total Cards</p>
                        <p className="text-xl font-bold">{batch.total}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-600">Available</p>
                        <p className="text-xl font-bold text-green-700">{batch.available}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600">Redeemed</p>
                        <p className="text-xl font-bold text-blue-700">{batch.used}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-sm text-purple-600">Conversion</p>
                        <p className="text-xl font-bold text-purple-700">
                          {batch.total > 0 ? Math.round((batch.used / batch.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Customer Discount: {batch.discount_percent}%
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Your Commission: {batch.commission_percent}%
                      </span>
                      {batch.free_shipping && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Free Shipping
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Individual Codes View */
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex gap-2">
                {(['all', 'available', 'used'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                      filter === f
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => downloadCodes()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                disabled={summary.available === 0}
              >
                <Download className="h-4 w-4" />
                Download All Available
              </button>
            </div>

            {codes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No codes found</p>
              </div>
            ) : (
              <div className="divide-y">
                {codes.map(code => (
                  <div 
                    key={code.id} 
                    className={`p-4 flex items-center justify-between ${
                      code.is_used ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {code.is_used ? (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className={`font-mono font-medium ${code.is_used ? 'text-gray-400' : ''}`}>
                          {code.code}
                        </p>
                        <p className="text-xs text-gray-500">
                          {code.is_used 
                            ? `Used ${new Date(code.used_at!).toLocaleDateString()}`
                            : `${code.discount_percent}% discount • ${code.commission_percent}% commission`
                          }
                        </p>
                      </div>
                    </div>
                    
                    {!code.is_used && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyCode(code.code)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="Copy code"
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyOrderLink(code.code)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="Copy order link"
                        >
                          {copiedCode === `link-${code.code}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
          <h3 className="font-semibold mb-2">Need more referral codes?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Contact us to request additional cards for your business.
          </p>
          <Link
            href="mailto:support@memoriqr.co.nz?subject=Request%20More%20Lead%20Generation%20Cards"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Request More Cards
          </Link>
        </div>
      </main>
    </div>
  )
}
