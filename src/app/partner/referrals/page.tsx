'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDateOnly, formatTimeWithZone } from '@/lib/utils'
import { 
  ArrowLeft, 
  Tag, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  CheckCircle,
  XCircle,
  TrendingUp,
  Send,
  X
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

interface LinkedPartner {
  id: string
  partner_name: string
  contact_email: string
  partner_type: string
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
  
  // Transfer state
  const [linkedPartners, setLinkedPartners] = useState<LinkedPartner[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferTargetId, setTransferTargetId] = useState('')
  const [transferNotes, setTransferNotes] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferResult, setTransferResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetchReferrals()
    fetchLinkedPartners()
  }, [filter])

  const fetchLinkedPartners = async () => {
    try {
      const response = await fetch('/api/partner/referrals/transfer')
      if (response.ok) {
        const data = await response.json()
        setLinkedPartners(data.linkedPartners || [])
      }
    } catch (err) {
      console.error('Failed to fetch linked partners:', err)
    }
  }

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

  const toggleCodeSelection = (codeId: string) => {
    const newSelected = new Set(selectedCodes)
    if (newSelected.has(codeId)) {
      newSelected.delete(codeId)
    } else {
      newSelected.add(codeId)
    }
    setSelectedCodes(newSelected)
  }

  const selectAllAvailable = () => {
    const availableCodes = codes.filter(c => !c.is_used).map(c => c.id)
    setSelectedCodes(new Set(availableCodes))
  }

  const clearSelection = () => {
    setSelectedCodes(new Set())
  }

  const handleTransfer = async () => {
    if (!transferTargetId || selectedCodes.size === 0) return

    setIsTransferring(true)
    setTransferResult(null)

    try {
      const response = await fetch('/api/partner/referrals/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeIds: Array.from(selectedCodes),
          toPartnerId: transferTargetId,
          notes: transferNotes || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTransferResult({ success: true, message: data.message })
        // Refresh the codes list
        fetchReferrals()
        // Clear selection
        setSelectedCodes(new Set())
        // Close modal after a delay
        setTimeout(() => {
          setShowTransferModal(false)
          setTransferResult(null)
          setTransferNotes('')
          setTransferTargetId('')
        }, 2000)
      } else {
        setTransferResult({ success: false, message: data.error || 'Transfer failed' })
      }
    } catch (err) {
      setTransferResult({ success: false, message: 'Failed to transfer codes' })
    } finally {
      setIsTransferring(false)
    }
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
                        <div className="text-sm text-gray-500">
                          <div>Created {formatDateOnly(batch.created_at)}</div>
                          <div className="text-xs">{formatTimeWithZone(batch.created_at)}</div>
                        </div>
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
            <div className="p-4 border-b flex flex-col gap-3">
              <div className="flex items-center justify-between">
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
              
              {/* Selection & Transfer Controls */}
              {linkedPartners.length > 0 && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={selectAllAvailable}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Select All Available
                    </button>
                    {selectedCodes.size > 0 && (
                      <button
                        onClick={clearSelection}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear Selection ({selectedCodes.size})
                      </button>
                    )}
                  </div>
                  {selectedCodes.size > 0 && (
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                    >
                      <Send className="h-4 w-4" />
                      Transfer {selectedCodes.size} Code{selectedCodes.size > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}
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
                    } ${selectedCodes.has(code.id) ? 'bg-primary-50' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox for available codes when transfer is possible */}
                      {linkedPartners.length > 0 && !code.is_used && (
                        <input
                          type="checkbox"
                          checked={selectedCodes.has(code.id)}
                          onChange={() => toggleCodeSelection(code.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      )}
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
                            ? <span>Used {formatDateOnly(code.used_at!)}, {formatTimeWithZone(code.used_at!)}</span>
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

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Transfer Referral Codes</h3>
                <button
                  onClick={() => {
                    setShowTransferModal(false)
                    setTransferResult(null)
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4">
                {transferResult ? (
                  <div className={`p-4 rounded-lg ${
                    transferResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <p className="font-medium">
                      {transferResult.success ? 'Transfer Complete!' : 'Transfer Failed'}
                    </p>
                    <p className="text-sm mt-1">{transferResult.message}</p>
                    {transferResult.success && (
                      <button
                        onClick={() => {
                          setShowTransferModal(false)
                          setTransferResult(null)
                          setSelectedCodes(new Set())
                          fetchReferrals()
                        }}
                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Done
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Transfer {selectedCodes.size} selected code{selectedCodes.size > 1 ? 's' : ''} to another business.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transfer to
                        </label>
                        <select
                          value={transferTargetId}
                          onChange={(e) => setTransferTargetId(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select a business...</option>
                          {linkedPartners.map(partner => (
                            <option key={partner.id} value={partner.id}>
                              {partner.partner_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          value={transferNotes}
                          onChange={(e) => setTransferNotes(e.target.value)}
                          placeholder="Add a note about this transfer..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowTransferModal(false)
                          setTransferTargetId('')
                          setTransferNotes('')
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleTransfer}
                        disabled={!transferTargetId || isTransferring}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isTransferring ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Transferring...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Transfer Codes
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
