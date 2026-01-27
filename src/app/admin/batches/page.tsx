'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Partner {
  id: string
  partner_name: string
  contact_email: string
}

interface Batch {
  id: string
  batch_number: string
  partner_id: string
  partner: Partner | null
  quantity: number
  product_type: string
  hosting_duration: number | null
  status: 'pending' | 'approved' | 'generated' | 'shipped' | 'cancelled'
  created_at: string
  approved_at: string | null
  generated_at: string | null
}

interface Summary {
  total: number
  pending: number
  approved: number
  generated: number
}

const PRODUCT_LABELS: Record<string, string> = {
  'nfc_only': 'NFC Only',
  'qr_only': 'QR Only',
  'both': 'NFC + QR',
}

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-blue-100 text-blue-800',
  'generated': 'bg-green-100 text-green-800',
  'shipped': 'bg-purple-100 text-purple-800',
  'cancelled': 'bg-red-100 text-red-800',
}

export default function AdminBatchesPage() {
  const router = useRouter()
  const [batches, setBatches] = useState<Batch[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, pending: 0, approved: 0, generated: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchBatches = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/batches?status=${statusFilter}`)
      if (res.status === 401) {
        router.push('/admin')
        return
      }
      const data = await res.json()
      setBatches(data.batches || [])
      setSummary(data.summary || { total: 0, pending: 0, approved: 0, generated: 0 })
    } catch (err) {
      console.error('Error fetching batches:', err)
      setError('Failed to load batches')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, router])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const handleAction = async (batchId: string, action: 'approve' | 'reject' | 'generate') => {
    setProcessingId(batchId)
    setError('')

    try {
      const res = await fetch(`/api/admin/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Action failed')
        return
      }

      // Refresh the list
      fetchBatches()
    } catch (err) {
      console.error('Error processing action:', err)
      setError('Failed to process action')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Batch Requests</h1>
            <p className="text-gray-600 mt-1">Approve and generate wholesale activation codes</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-stone-600 hover:text-stone-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-500">Total Batches</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{summary.pending}</div>
            <div className="text-sm text-yellow-600">Pending Approval</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{summary.approved}</div>
            <div className="text-sm text-blue-600">Approved</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-2xl font-bold text-green-700">{summary.generated}</div>
            <div className="text-sm text-green-600">Generated</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="generated">Generated</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Batches Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No batch requests found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batches.map((batch) => (
                  <tr key={batch.id} className={batch.status === 'pending' ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-medium text-gray-900">
                        {batch.batch_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {batch.partner?.partner_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {batch.partner?.contact_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {batch.quantity} × {PRODUCT_LABELS[batch.product_type] || batch.product_type}
                      </div>
                      <div className="text-xs text-gray-500">
                        {batch.hosting_duration || 10} year hosting
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[batch.status]}`}>
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(batch.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {batch.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(batch.id, 'approve')}
                            disabled={processingId === batch.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-xs font-medium"
                          >
                            {processingId === batch.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleAction(batch.id, 'reject')}
                            disabled={processingId === batch.id}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-xs font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {batch.status === 'approved' && (
                        <button
                          onClick={() => handleAction(batch.id, 'generate')}
                          disabled={processingId === batch.id}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs font-medium"
                        >
                          {processingId === batch.id ? 'Generating...' : 'Generate Codes'}
                        </button>
                      )}
                      {batch.status === 'generated' && (
                        <span className="text-green-600 text-xs">✓ Codes sent</span>
                      )}
                      {batch.status === 'cancelled' && (
                        <span className="text-gray-400 text-xs">Cancelled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
