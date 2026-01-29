'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  totalPartners: number;
  activePartners: number;
  pendingApplications: number;
  pendingBatchRequests: number;
  pendingCommissions: number;
  pendingFulfillment: number;
  totalMemorials: number;
  totalOrders: number;
  totalRevenue: number;
  recentActivations: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/session');
    if (!res.ok) {
      router.push('/admin');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch stats');
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-stone-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-amber-200 hover:text-amber-100">MemoriQR</a>
            <span className="text-white/50 mx-2">|</span>
            <span className="text-lg font-semibold">Admin</span>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link href="/admin/dashboard" className="text-white/90 hover:text-white px-3 py-1 rounded bg-white/10">
                Dashboard
              </Link>
              <Link href="/admin/codes" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Activation Codes
              </Link>
              <Link href="/admin/referrals" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Referral Codes
              </Link>
              <Link href="/admin/batches" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Partner Batches
              </Link>
              <Link href="/admin/partners" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10 relative">
                Partners
                {(stats?.pendingApplications ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingApplications}
                  </span>
                )}
              </Link>
              <Link href="/admin/commissions" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10 relative">
                Commissions
                {(stats?.pendingCommissions ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingCommissions}
                  </span>
                )}
              </Link>
              <Link href="/admin/orders" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10 relative">
                Orders
                {(stats?.pendingFulfillment ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingFulfillment}
                  </span>
                )}
              </Link>
              <Link href="/admin/memorials" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Memorials
              </Link>
              <Link href="/admin/tools" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Tools
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/70 hover:text-white text-sm"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-8">Dashboard Overview</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Applications */}
          <Link href="/admin/partners?status=pending" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-500 text-sm">Pending Applications</span>
              {(stats?.pendingApplications ?? 0) > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-stone-800">{stats?.pendingApplications ?? 0}</p>
          </Link>

          {/* Partner Code Batches */}
          <Link href="/admin/batches" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-500 text-sm">Partner Batches</span>
            </div>
            <p className="text-3xl font-bold text-stone-800">{stats?.pendingBatchRequests ?? 0}</p>
            <p className="text-sm text-stone-400 mt-1">via Stripe checkout</p>
          </Link>

          {/* Active Partners */}
          <div className="bg-white rounded-xl shadow p-6">
            <span className="text-stone-500 text-sm">Active Partners</span>
            <p className="text-3xl font-bold text-stone-800">{stats?.activePartners ?? 0}</p>
            <p className="text-sm text-stone-400 mt-1">of {stats?.totalPartners ?? 0} total</p>
          </div>

          {/* Pending Fulfillment */}
          <Link href="/admin/orders?status=needs_fulfillment" className="bg-white rounded-xl shadow p-6 block hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-500 text-sm">Pending Fulfillment</span>
              {(stats?.pendingFulfillment ?? 0) > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-stone-800">{stats?.pendingFulfillment ?? 0}</p>
            <p className="text-sm text-stone-400 mt-1">memorials awaiting shipping</p>
          </Link>

          {/* Total Memorials */}
          <Link href="/admin/memorials" className="bg-white rounded-xl shadow p-6 block hover:shadow-lg transition-shadow cursor-pointer">
            <span className="text-stone-500 text-sm">Total Memorials</span>
            <p className="text-3xl font-bold text-stone-800">{stats?.totalMemorials ?? 0}</p>
            <p className="text-sm text-green-600 mt-1">+{stats?.recentActivations ?? 0} this month</p>
          </Link>

          {/* Revenue */}
          <div className="bg-white rounded-xl shadow p-6">
            <span className="text-stone-500 text-sm">Total Revenue</span>
            <p className="text-3xl font-bold text-stone-800">
              ${(stats?.totalRevenue ?? 0).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-stone-400 mt-1">{stats?.totalOrders ?? 0} orders</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-semibold text-stone-800 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/partners?status=pending"
              className="bg-black text-white px-5 py-2.5 rounded-lg hover:bg-black/90 transition-colors shadow-md font-semibold relative"
            >
              Review Applications
              {(stats?.pendingApplications ?? 0) > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.pendingApplications}
                </span>
              )}
            </Link>
            <Link
              href="/admin/batches"
              className="bg-stone-600 text-white px-5 py-2.5 rounded-lg hover:bg-stone-700 transition-colors shadow-md font-semibold"
            >
              View Partner Batches
            </Link>
            <Link
              href="/admin/commissions?status=pending"
              className="bg-emerald-700 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-800 transition-colors shadow-md font-semibold relative"
            >
              Review Commissions
              {(stats?.pendingCommissions ?? 0) > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.pendingCommissions}
                </span>
              )}
            </Link>
            <Link
              href="/admin/codes"
              className="bg-purple-700 text-white px-5 py-2.5 rounded-lg hover:bg-purple-800 transition-colors shadow-md font-semibold"
            >
              Generate Activation Codes
            </Link>
            <Link
              href="/admin/partners"
              className="bg-stone-800 text-white px-5 py-2.5 rounded-lg hover:bg-stone-900 transition-colors shadow-md font-semibold"
            >
              Manage Partners
            </Link>
            <Link
              href="/admin/orders"
              className="bg-stone-700 text-white px-5 py-2.5 rounded-lg hover:bg-stone-800 transition-colors shadow-md font-semibold"
            >
              View Orders
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-stone-800 mb-3">Navigation</h3>
          <div className="space-y-2">
            <Link href="/admin/dashboard" className="block px-4 py-2 bg-stone-100 rounded-lg text-stone-800">
              Dashboard
            </Link>
            <Link href="/admin/codes" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Generate Codes
            </Link>
            <Link href="/admin/partners" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Partners
            </Link>
            <Link href="/admin/commissions" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Commissions
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Orders
            </Link>
            <Link href="/admin/memorials" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Memorials
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
