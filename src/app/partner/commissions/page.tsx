'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface Commission {
  id: string
  partner_id: string
  memorial_id: string
  code_id: string
  order_value: number
  commission_amount: number
  status: 'pending' | 'approved' | 'paid'
  earned_at: string
  approved_at: string | null
  paid_at: string | null
  payout_id: string | null
  memorial?: {
    deceased_name: string
    deceased_type: 'human' | 'pet'
    species: string | null
  }
}

interface Payout {
  id: string
  partner_id: string
  amount: number
  period_start: string
  period_end: string
  commission_count: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  payment_method: string | null
  payment_reference: string | null
  created_at: string
  processed_at: string | null
}

interface MonthlyBreakdown {
  month: string
  label: string
  activations: number
  commission: number
  orderValue: number
}

interface CommissionSummary {
  totalEarned: number
  pending: number
  approved: number
  paid: number
  totalActivations: number
}

export default function PartnerCommissionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [summary, setSummary] = useState<CommissionSummary | null>(null)
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>([])
  const [commissionRate, setCommissionRate] = useState<number>(10)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all')
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'year'>('all')
  const [activeTab, setActiveTab] = useState<'commissions' | 'payouts' | 'reports'>('commissions')

  const fetchCommissions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (periodFilter !== 'all') params.set('period', periodFilter)

      const response = await fetch(`/api/partner/commissions?${params}`)

      if (response.status === 401) {
        router.push('/partner')
        return
      }

      if (!response.ok) throw new Error('Failed to fetch commissions')

      const data = await response.json()
      setCommissions(data.commissions)
      setPayouts(data.payouts)
      setSummary(data.summary)
      setMonthlyBreakdown(data.monthlyBreakdown)
      setCommissionRate(data.commissionRate)
    } catch (error) {
      console.error('Failed to fetch commissions:', error)
    } finally {
      setLoading(false)
    }
  }, [router, statusFilter, periodFilter])

  useEffect(() => {
    fetchCommissions()
  }, [fetchCommissions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      processing: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const exportCSV = () => {
    const headers = ['Date', 'Memorial', 'Type', 'Order Value', 'Commission', 'Status']
    const rows = commissions.map(c => [
      formatDate(c.earned_at),
      c.memorial?.deceased_name || 'Unknown',
      c.memorial?.deceased_type === 'pet' ? `Pet (${c.memorial.species || 'Unknown'})` : 'Human',
      c.order_value.toFixed(2),
      c.commission_amount.toFixed(2),
      c.status
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <nav className="text-sm mb-4">
              <Link href="/partner/dashboard" className="text-emerald-600 hover:text-emerald-700">
                ← Back to Dashboard
              </Link>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Commission Tracking</h1>
                <p className="text-gray-600">Your commission rate: {commissionRate}%</p>
              </div>
              <button
                onClick={exportCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary?.totalEarned || 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary?.pending || 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary?.approved || 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.paid || 0)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'commissions', label: 'Commission History' },
                  { id: 'payouts', label: 'Payouts' },
                  { id: 'reports', label: 'Monthly Reports' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Commissions Tab */}
              {activeTab === 'commissions' && (
                <>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex gap-2">
                      {(['all', 'pending', 'approved', 'paid'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1 text-sm rounded-full ${
                            statusFilter === status
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {(['all', 'month', 'year'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setPeriodFilter(period)}
                          className={`px-3 py-1 text-sm rounded-full ${
                            periodFilter === period
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {period === 'all' ? 'All Time' : period === 'month' ? 'Last Month' : 'Last Year'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commission Table */}
                  {commissions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No commissions found</p>
                      <p className="text-sm">Commissions are earned when customers activate memorials using your codes</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memorial</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Order Value</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {commissions.map((commission) => (
                            <tr key={commission.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(commission.earned_at)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {commission.memorial?.deceased_name || 'Unknown'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {commission.memorial?.deceased_type === 'pet' 
                                  ? `Pet (${commission.memorial.species || 'Unknown'})`
                                  : 'Human'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(commission.order_value)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">
                                {formatCurrency(commission.commission_amount)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(commission.status)}`}>
                                  {commission.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Payouts Tab */}
              {activeTab === 'payouts' && (
                <>
                  {payouts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <p>No payouts yet</p>
                      <p className="text-sm">Payouts are processed monthly for approved commissions</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commissions</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {payouts.map((payout) => (
                            <tr key={payout.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(payout.created_at)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(payout.period_start)} - {formatDate(payout.period_end)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {payout.commission_count}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">
                                {formatCurrency(payout.amount)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payout.status)}`}>
                                  {payout.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payout.payment_reference || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Payout Information</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Commissions are approved at the end of each month</li>
                      <li>• Payouts are processed within the first week of the following month</li>
                      <li>• Minimum payout threshold: $50 NZD</li>
                      <li>• Payment is made via bank transfer to your registered account</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <>
                  {monthlyBreakdown.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p>No data available yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Activations</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Order Value</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Earned</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {monthlyBreakdown.map((month) => (
                            <tr key={month.month} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {month.label}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {month.activations}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(month.orderValue)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">
                                {formatCurrency(month.commission)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {formatCurrency(month.orderValue / month.activations)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Total
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {monthlyBreakdown.reduce((sum, m) => sum + m.activations, 0)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(monthlyBreakdown.reduce((sum, m) => sum + m.orderValue, 0))}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">
                              {formatCurrency(monthlyBreakdown.reduce((sum, m) => sum + m.commission, 0))}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              -
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
