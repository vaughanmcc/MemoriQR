'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PartnerHeader } from '@/components/layout/PartnerHeader'
import { 
  ArrowLeft, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Plus,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  Square,
  CheckSquare
} from 'lucide-react'

interface Code {
  activation_code: string
  product_type: string
  hosting_duration: number
  is_used: boolean
  used_at: string | null
  created_at: string
  expires_at: string | null
}

interface Batch {
  id: string
  batch_number: string
  quantity: number
  product_type: string
  hosting_duration: number
  status: string
  created_at: string
  generated_at: string | null
}

interface LinkedPartner {
  id: string
  partner_name: string
  partner_type: string
  contact_email: string
}

export default function PartnerCodesPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<Code[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [hasBankingDetails, setHasBankingDetails] = useState(true) // Default to true to avoid flash
  const [linkedPartners, setLinkedPartners] = useState<LinkedPartner[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  useEffect(() => {
    fetchCodes()
    fetchLinkedPartners()
  }, [filter])

  const fetchLinkedPartners = async () => {
    try {
      const response = await fetch('/api/partner/codes/transfer')
      if (response.ok) {
        const data = await response.json()
        setLinkedPartners(data.linkedPartners || [])
      }
    } catch (err) {
      console.error('Failed to fetch linked partners:', err)
    }
  }

  const fetchCodes = async () => {
    try {
      const response = await fetch(`/api/partner/codes?status=${filter}`)
      
      if (response.status === 401) {
        router.push('/partner')
        return
      }

      const data = await response.json()
      setCodes(data.codes || [])
      setBatches(data.batches || [])
      setHasBankingDetails(data.hasBankingDetails ?? true)
    } catch (err) {
      console.error('Failed to fetch codes:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleCodeSelection = (code: string) => {
    const newSelected = new Set(selectedCodes)
    if (newSelected.has(code)) {
      newSelected.delete(code)
    } else {
      newSelected.add(code)
    }
    setSelectedCodes(newSelected)
  }

  const toggleSelectAll = () => {
    const availableCodes = codes.filter(c => !c.is_used)
    if (selectedCodes.size === availableCodes.length) {
      setSelectedCodes(new Set())
    } else {
      setSelectedCodes(new Set(availableCodes.map(c => c.activation_code)))
    }
  }

  const cancelSelection = () => {
    setSelectionMode(false)
    setSelectedCodes(new Set())
  }

  const downloadCodes = () => {
    const availableCodes = codes.filter(c => !c.is_used)
    const csv = [
      'Activation Code,Product Type,Hosting Duration,Created,Expires',
      ...availableCodes.map(c => 
        `${c.activation_code},${c.product_type},${c.hosting_duration} years,${new Date(c.created_at).toLocaleDateString()},${c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'N/A'}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memoriqr-codes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getProductLabel = (type: string) => {
    switch (type) {
      case 'nfc_only': return 'NFC Tag'
      case 'qr_only': return 'QR Plate'
      case 'both': return 'NFC + QR'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Awaiting Payment</span>
      case 'approved':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Paid - Processing</span>
      case 'generated':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Ready</span>
      case 'shipped':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Shipped</span>
      case 'cancelled':
        return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Cancelled</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const availableCount = codes.filter(c => !c.is_used).length
  const usedCount = codes.filter(c => c.is_used).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PartnerHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link href="/partner/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activation Codes</h1>
            <p className="text-gray-600">
              {availableCount} available • {usedCount} used
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {linkedPartners.length > 0 && !selectionMode && (
              <button
                onClick={() => setSelectionMode(true)}
                disabled={availableCount === 0}
                className="flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Transfer Codes
              </button>
            )}
            {selectionMode && (
              <>
                <button
                  onClick={cancelSelection}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={() => setShowTransferModal(true)}
                  disabled={selectedCodes.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer {selectedCodes.size} Code{selectedCodes.size !== 1 ? 's' : ''}
                </button>
              </>
            )}
            <button
              onClick={downloadCodes}
              disabled={availableCount === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Purchase Codes
            </button>
          </div>
        </div>

        {/* Recent Purchases */}
        {batches.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Purchases</h2>
            <div className="divide-y">
              {batches.slice(0, 5).map((batch) => (
                <div key={batch.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 rounded-lg p-2">
                      <Package className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{batch.batch_number}</p>
                      <p className="text-sm text-gray-500">
                        {batch.quantity} codes • {getProductLabel(batch.product_type)} • {batch.hosting_duration ? `${batch.hosting_duration} years` : 'Customer selects'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(batch.status)}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(batch.created_at).toLocaleDateString('en-NZ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'available', 'used'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'All Codes' : f === 'available' ? 'Available' : 'Used'}
            </button>
          ))}
        </div>

        {/* Codes Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {codes.length === 0 ? (
            <div className="p-12 text-center">
              <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activation codes found</p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="mt-4 text-primary-600 hover:underline"
              >
                Request your first batch
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {selectionMode && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1 hover:text-gray-700"
                        title="Select all available codes"
                      >
                        {selectedCodes.size === codes.filter(c => !c.is_used).length && codes.filter(c => !c.is_used).length > 0 ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {codes.map((code) => (
                  <tr 
                    key={code.activation_code} 
                    className={`${code.is_used ? 'bg-gray-50' : ''} ${selectionMode && selectedCodes.has(code.activation_code) ? 'bg-blue-50' : ''}`}
                  >
                    {selectionMode && (
                      <td className="px-4 py-4 whitespace-nowrap">
                        {!code.is_used ? (
                          <button
                            onClick={() => toggleCodeSelection(code.activation_code)}
                            className="flex items-center"
                          >
                            {selectedCodes.has(code.activation_code) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-300">
                            <Square className="h-5 w-5" />
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code 
                        className="font-mono text-sm bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                        onClick={() => copyCode(code.activation_code)}
                        title="Click to copy"
                      >
                        {code.activation_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getProductLabel(code.product_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {code.hosting_duration ? `${code.hosting_duration} years` : <span className="text-gray-400 italic">At activation</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {code.is_used ? (
                        <span className="flex items-center gap-1 text-gray-500">
                          <CheckCircle className="h-4 w-4" />
                          Used {code.used_at && `on ${new Date(code.used_at).toLocaleDateString('en-NZ')}`}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600">
                          <Clock className="h-4 w-4" />
                          Available
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(code.created_at).toLocaleDateString('en-NZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!code.is_used && (
                        <button
                          onClick={() => copyCode(code.activation_code)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {copiedCode === code.activation_code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestCodesModal 
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false)
            fetchCodes()
          }}
          hasBankingDetails={hasBankingDetails}
        />
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferCodesModal
          selectedCodes={Array.from(selectedCodes)}
          linkedPartners={linkedPartners}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            setShowTransferModal(false)
            setSelectionMode(false)
            setSelectedCodes(new Set())
            fetchCodes()
          }}
        />
      )}
    </div>
  )
}

function RequestCodesModal({ 
  onClose, 
  onSuccess,
  hasBankingDetails
}: { 
  onClose: () => void
  onSuccess: () => void
  hasBankingDetails: boolean
}) {
  const [quantity, setQuantity] = useState(50)
  const [productType, setProductType] = useState('both')
  const [hostingDuration, setHostingDuration] = useState<number>(10)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          productType,
          hostingDuration,
          notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Calculate pricing - use base product price if no duration selected
  const retailPricing: { [key: string]: { [key: number]: number } } = {
    'nfc_only': { 5: 99, 10: 149, 25: 199 },
    'qr_only': { 5: 149, 10: 199, 25: 279 },
    'both': { 5: 199, 10: 249, 25: 349 }
  }

  const retailPrice = retailPricing[productType][hostingDuration]
  const partnerPrice = retailPrice * 0.6
  const totalCost = partnerPrice * quantity
  const potentialRevenue = retailPrice * quantity
  const potentialProfit = potentialRevenue - totalCost

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Activation Codes</h2>

          {!hasBankingDetails && (
            <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-medium text-amber-800">Banking Details Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    To receive payouts when your codes are used, please add your banking details in{' '}
                    <a href="/partner/settings" className="underline font-medium hover:text-amber-900">Settings</a>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 500</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="nfc_only">NFC Tag Only</option>
                  <option value="qr_only">QR Plate Only</option>
                  <option value="both">NFC Tag + QR Plate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hosting Duration
                </label>
                <select
                  value={hostingDuration}
                  onChange={(e) => setHostingDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                  <option value={25}>25 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Any special requirements..."
                />
              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Retail price per code:</span>
                  <span className="font-medium">${retailPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your cost per code (40% off):</span>
                  <span className="font-medium text-green-600">${partnerPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total cost ({quantity} codes):</span>
                    <span className="font-bold">${totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Potential profit:</span>
                    <span className="font-bold">${potentialProfit.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Redirecting...' : `Pay $${totalCost.toFixed(2)} NZD`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function TransferCodesModal({
  selectedCodes,
  linkedPartners,
  onClose,
  onSuccess
}: {
  selectedCodes: string[]
  linkedPartners: LinkedPartner[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [targetPartnerId, setTargetPartnerId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetPartnerId) {
      setError('Please select a business to transfer to')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/partner/codes/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codes: selectedCodes,
          toPartnerId: targetPartnerId,
          notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transfer codes')
      }

      setSuccess(`Successfully transferred ${data.transferred} code${data.transferred !== 1 ? 's' : ''} to ${data.toPartnerName}`)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
      setLoading(false)
    }
  }

  const targetPartner = linkedPartners.find(p => p.id === targetPartnerId)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-full p-2">
              <ArrowRightLeft className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Transfer Activation Codes</h2>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">{success}</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Transfer <strong>{selectedCodes.length} activation code{selectedCodes.length !== 1 ? 's' : ''}</strong> to another business you own.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  The codes will be moved and no longer visible in this business.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transfer to
                    </label>
                    <select
                      value={targetPartnerId}
                      onChange={(e) => setTargetPartnerId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a business...</option>
                      {linkedPartners.map(partner => (
                        <option key={partner.id} value={partner.id}>
                          {partner.partner_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {targetPartner && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">{targetPartner.partner_name}</p>
                      <p className="text-xs text-gray-500">{targetPartner.partner_type} • {targetPartner.contact_email}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Reason for transfer..."
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Codes to transfer:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCodes.slice(0, 5).map(code => (
                        <code key={code} className="text-xs bg-white px-2 py-1 rounded border">
                          {code}
                        </code>
                      ))}
                      {selectedCodes.length > 5 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{selectedCodes.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !targetPartnerId}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Transferring...' : `Transfer ${selectedCodes.length} Code${selectedCodes.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
