'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PartnerHeader } from '@/components/layout/PartnerHeader'
import { formatDateOnly, formatTimeWithZone } from '@/lib/utils'
import { useSessionExtension } from '@/lib/useSessionExtension'
import { 
  LayoutDashboard, 
  QrCode, 
  DollarSign, 
  Download, 
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  ChevronRight,
  Tag,
  Settings,
  HelpCircle,
  AlertTriangle
} from 'lucide-react'

interface DashboardData {
  partner: {
    id: string
    name: string
    type: string
    email: string
    commissionRate: number
    discountPercent: number
    freeShipping: boolean
    hasBankingDetails: boolean
  }
  stats: {
    totalCodes: number
    usedCodes: number
    availableCodes: number
    totalEarned: number
    pendingCommission: number
    paidCommission: number
    recentActivations: number
  }
  recentBatches: any[]
  recentCommissions: any[]
  monthlyStats: { month: string; label: string; activations: number; commission: number }[]
}

export default function PartnerDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Extend session while user is active
  useSessionExtension()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/partner/stats')
      
      if (response.status === 401) {
        router.push('/partner')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/partner/session', { method: 'DELETE' })
    router.push('/partner')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
          <button onClick={fetchDashboard} className="text-primary-600 hover:underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { partner, stats, recentCommissions, monthlyStats } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PartnerHeader partnerName={partner.name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {partner.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600">
            <span>
              Commission: <strong>{partner.commissionRate}%</strong>
            </span>
            {partner.discountPercent > 0 && (
              <span>
                Product Discount: <strong>{partner.discountPercent}%</strong>
              </span>
            )}
            {partner.freeShipping && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Package className="h-4 w-4" />
                <strong>Free Shipping</strong>
              </span>
            )}
          </div>
        </div>

        {/* Banking Details Reminder */}
        {!partner.hasBankingDetails && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">Banking Details Required</h3>
                <p className="text-sm text-amber-700 mt-1">
                  To receive commission payouts, please add your banking details in Settings. 
                  We need your bank name, account name, and account number.
                </p>
                <Link
                  href="/partner/settings"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-800 hover:text-amber-900"
                >
                  <Settings className="h-4 w-4" />
                  Go to Settings
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Available Codes"
            value={stats.availableCodes}
            subtitle={`${stats.usedCodes} used of ${stats.totalCodes} total`}
            icon={<QrCode className="h-6 w-6 text-primary-600" />}
            color="primary"
            href="/partner/codes"
          />
          <StatCard
            title="Referrals (30 days)"
            value={stats.recentActivations}
            subtitle="Recent referral redemptions"
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            color="green"
            href="/partner/referrals"
          />
          <StatCard
            title="Pending Commission"
            value={`$${stats.pendingCommission.toFixed(2)}`}
            subtitle="Awaiting payout"
            icon={<Clock className="h-6 w-6 text-yellow-600" />}
            color="yellow"
          />
          <StatCard
            title="Total Earned"
            value={`$${stats.totalEarned.toFixed(2)}`}
            subtitle={`$${stats.paidCommission.toFixed(2)} paid out`}
            icon={<DollarSign className="h-6 w-6 text-blue-600" />}
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/partner/codes"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 rounded-lg p-3">
                <QrCode className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Activation Codes</h3>
                <p className="text-sm text-gray-500">Pre-paid codes</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>

          <Link
            href="/partner/referrals"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Referral Codes</h3>
                <p className="text-sm text-gray-500">Referral codes</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>

          <Link
            href="/partner/commissions"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Commissions</h3>
                <p className="text-sm text-gray-500">Earnings & payouts</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>

          <Link
            href="/partner/materials"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Materials</h3>
                <p className="text-sm text-gray-500">Download assets</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>

          <Link
            href="/partner/settings"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <Settings className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Banking & payouts</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>

          <Link
            href="/partner/faq"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 rounded-lg p-3">
                <HelpCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">FAQ</h3>
                <p className="text-sm text-gray-500">Common questions</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Activations & Earnings</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyStats.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">${month.commission.toFixed(0)}</span>
                  <div
                    className="w-full bg-primary-200 rounded-t"
                    style={{
                      height: `${Math.max(20, (month.commission / Math.max(...monthlyStats.map(m => m.commission || 1))) * 150)}px`
                    }}
                  />
                  <div
                    className="w-full bg-green-400 rounded-t -mt-1"
                    style={{
                      height: `${Math.max(4, month.activations * 10)}px`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{month.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-200 rounded" />
              <span className="text-sm text-gray-600">Commission ($)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded" />
              <span className="text-sm text-gray-600">Activations</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activations</h2>
          {recentCommissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activations yet</p>
          ) : (
            <div className="divide-y">
              {recentCommissions.map((commission: any) => (
                <div key={commission.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {commission.memorial?.deceased_name || 'Memorial'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Code: {commission.activation_code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +${Number(commission.commission_amount).toFixed(2)}
                    </p>
                    <div className="text-xs text-gray-500">
                      <div>{formatDateOnly(commission.earned_at)}</div>
                      <div>{formatTimeWithZone(commission.earned_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  href
}: { 
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: 'primary' | 'green' | 'yellow' | 'blue'
  href?: string
}) {
  const bgColors = {
    primary: 'bg-primary-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    blue: 'bg-blue-50'
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`${bgColors[color]} rounded-lg p-2`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </>
  )

  if (href) {
    return (
      <Link href={href} className="bg-white rounded-xl shadow-sm p-6 block hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer group">
        {content}
        <div className="flex items-center justify-end mt-2 text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View details <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {content}
    </div>
  )
}
