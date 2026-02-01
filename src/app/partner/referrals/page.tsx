'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PartnerHeader } from '@/components/layout/PartnerHeader'
import { formatDateOnly, formatTimeWithZone } from '@/lib/utils'
import { useSessionExtension } from '@/lib/useSessionExtension'
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
  X,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestQuantity, setRequestQuantity] = useState(5)
  const [requestReason, setRequestReason] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestResult, setRequestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Sorting state for individual codes
  const [sortField, setSortField] = useState<'created_at' | 'used_at' | 'code'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Extend session while user is active
  useSessionExtension()

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

  // Sort codes based on current sort settings
  const sortedCodes = [...codes].sort((a, b) => {
    let comparison = 0
    if (sortField === 'code') {
      comparison = a.code.localeCompare(b.code)
    } else if (sortField === 'created_at') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortField === 'used_at') {
      // Put unused codes at the end when sorting by used_at
      if (!a.used_at && !b.used_at) comparison = 0
      else if (!a.used_at) comparison = 1
      else if (!b.used_at) comparison = -1
      else comparison = new Date(a.used_at).getTime() - new Date(b.used_at).getTime()
    }
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const toggleSort = (field: 'created_at' | 'used_at' | 'code') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: 'created_at' | 'used_at' | 'code' }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-primary-600" />
      : <ArrowDown className="h-3 w-3 text-primary-600" />
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
      <PartnerHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link href="/partner/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Referral Codes</h1>
          <p className="text-gray-600">Referral codes for your customers</p>
        </div>
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
              <div>
                {/* Sortable Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">
                    <button 
                      onClick={() => toggleSort('code')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Code <SortIcon field="code" />
                    </button>
                  </div>
                  <div className="col-span-2">Details</div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => toggleSort('created_at')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Created <SortIcon field="created_at" />
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => toggleSort('used_at')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Used <SortIcon field="used_at" />
                    </button>
                  </div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                
                <div className="divide-y">
                {sortedCodes.map(code => (
                  <div 
                    key={code.id} 
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center ${
                      code.is_used ? 'bg-gray-50' : ''
                    } ${selectedCodes.has(code.id) ? 'bg-primary-50' : ''}`}
                  >
                    {/* Checkbox & Status */}
                    <div className="col-span-1 flex items-center gap-2">
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
                    </div>
                    
                    {/* Code */}
                    <div className="col-span-3">
                      <p className={`font-mono font-medium ${code.is_used ? 'text-gray-400' : ''}`}>
                        {code.code}
                      </p>
                    </div>
                    
                    {/* Details */}
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">
                        {code.discount_percent}% discount<br />
                        {code.commission_percent}% commission
                      </p>
                    </div>
                    
                    {/* Created Date */}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{formatDateOnly(code.created_at)}</p>
                    </div>
                    
                    {/* Used Date */}
                    <div className="col-span-2">
                      {code.is_used && code.used_at ? (
                        <p className="text-sm text-gray-600">{formatDateOnly(code.used_at)}</p>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1">
                    {!code.is_used && (
                      <>
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
                      </>
                    )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Request More Codes CTA */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
          <h3 className="font-semibold mb-2">Need more referral codes?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Request additional codes for your business. Up to 10 codes are generated instantly!
          </p>
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Request More Codes
          </button>
        </div>

        {/* Request Modal */}
        {showRequestModal && (
          <RequestCodesModal
            onClose={() => {
              setShowRequestModal(false)
              setRequestResult(null)
              setRequestQuantity(5)
              setRequestReason('')
            }}
            onSuccess={() => {
              setShowRequestModal(false)
              setRequestResult(null)
              setRequestQuantity(5)
              setRequestReason('')
              fetchReferrals()
            }}
            quantity={requestQuantity}
            setQuantity={setRequestQuantity}
            reason={requestReason}
            setReason={setRequestReason}
            isRequesting={isRequesting}
            setIsRequesting={setIsRequesting}
            result={requestResult}
            setResult={setRequestResult}
          />
        )}

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

// Request Codes Modal Component
function RequestCodesModal({
  onClose,
  onSuccess,
  quantity,
  setQuantity,
  reason,
  setReason,
  isRequesting,
  setIsRequesting,
  result,
  setResult
}: {
  onClose: () => void
  onSuccess: () => void
  quantity: number
  setQuantity: (q: number) => void
  reason: string
  setReason: (r: string) => void
  isRequesting: boolean
  setIsRequesting: (b: boolean) => void
  result: { success: boolean; message: string } | null
  setResult: (r: { success: boolean; message: string } | null) => void
}) {
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (quantity < 1 || quantity > 100) {
      setError('Quantity must be between 1 and 100')
      return
    }
    
    if (quantity > 10 && reason.trim().length < 10) {
      setError('Please provide a reason when requesting more than 10 codes (minimum 10 characters)')
      return
    }

    setIsRequesting(true)

    try {
      const response = await fetch('/api/partner/referrals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, reason: reason.trim() || null })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setResult({
        success: true,
        message: data.message
      })

      // Auto-close after success if auto-approved
      if (data.autoApproved) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Request Referral Codes</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {result ? (
            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <p className="font-medium">
                {result.success ? '✓ Request Submitted!' : 'Request Failed'}
              </p>
              <p className="text-sm mt-1">{result.message}</p>
              <button
                onClick={result.success ? onSuccess : onClose}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                {result.success ? 'Done' : 'Close'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Codes
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter number of codes (1-100)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {quantity <= 10 
                      ? '✓ Up to 10 codes are generated instantly!' 
                      : '⏳ Requests for more than 10 codes require admin approval'}
                  </p>
                </div>

                {quantity > 10 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Request <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., We have a trade show coming up and need more cards to hand out..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Please explain why you need this many codes
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRequesting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {quantity <= 10 ? 'Generate Codes' : 'Submit Request'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
