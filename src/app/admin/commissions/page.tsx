'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Commission {
  id: string;
  partner_id: string;
  order_id: string | null;
  referral_code_id: string | null;
  order_total: number | null;
  order_value: number;
  discount_amount: number | null;
  commission_percent: number | null;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  earned_at: string;
  approved_at: string | null;
  paid_at: string | null;
  payout_reference: string | null;
  partner?: {
    id: string;
    partner_name: string | null;
    contact_email: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
    bank_name: string | null;
  };
  order?: {
    order_number: string;
    customer_id: string | null;
  };
}

interface PartnerOption {
  id: string;
  partner_name: string | null;
  contact_email: string | null;
}

interface Summary {
  totalCommissions: number;
  totalAmount: number;
  pending: number;
  pendingCount: number;
  approved: number;
  approvedCount: number;
  paid: number;
  paidCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminCommissionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    }>
      <AdminCommissionsContent />
    </Suspense>
  );
}

function AdminCommissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [partnerFilter, setPartnerFilter] = useState(searchParams.get('partner_id') || 'all');
  const [periodFilter, setPeriodFilter] = useState(searchParams.get('period') || 'all');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Payout modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutPartnerId, setPayoutPartnerId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (partnerFilter !== 'all') params.set('partner_id', partnerFilter);
      if (periodFilter !== 'all') params.set('period', periodFilter);

      const res = await fetch(`/api/admin/commissions?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        let message = 'Failed to fetch commissions';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const data = await res.json();
      setCommissions(data.commissions);
      setPartners(data.partners);
      setSummary(data.summary);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, partnerFilter, periodFilter, router]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Select all pending
  const selectAllPending = () => {
    const pendingIds = commissions
      .filter(c => c.status === 'pending')
      .map(c => c.id);
    setSelectedIds(new Set(pendingIds));
  };

  // Approve single commission
  const approveCommission = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/commissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!res.ok) throw new Error('Failed to approve commission');

      await fetchCommissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk approve selected
  const bulkApprove = async () => {
    if (selectedIds.size === 0) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/commissions/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionIds: Array.from(selectedIds) }),
      });

      if (!res.ok) throw new Error('Failed to approve commissions');

      const data = await res.json();
      alert(`${data.approved} commission(s) approved`);
      await fetchCommissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk approve failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Open payout modal for a partner
  const openPayoutModal = (partnerId: string) => {
    setPayoutPartnerId(partnerId);
    setPaymentReference('');
    setPayoutNotes('');
    setShowPayoutModal(true);
  };

  // Create payout
  const createPayout = async () => {
    if (!payoutPartnerId) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/commissions/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: payoutPartnerId,
          paymentReference,
          notes: payoutNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create payout');
      }

      const data = await res.json();
      alert(`Payout ${data.payout.payout_number} created for ${formatCurrency(data.payout.total_commission)}`);
      setShowPayoutModal(false);
      await fetchCommissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payout failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Get partners with approved commissions for payout
  const partnersWithApproved = commissions
    .filter(c => c.status === 'approved')
    .reduce((acc, c) => {
      const partnerId = c.partner_id;
      if (!acc[partnerId]) {
        acc[partnerId] = {
          partner: c.partner,
          count: 0,
          total: 0,
        };
      }
      acc[partnerId].count++;
      acc[partnerId].total += Number(c.commission_amount);
      return acc;
    }, {} as Record<string, { partner: Commission['partner']; count: number; total: number }>);

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
            <a href="https://memoriqr.co.nz" target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-amber-200 hover:text-amber-100">MemoriQR</a>
            <span className="text-white/50 mx-2">|</span>
            <span className="text-lg font-semibold">Admin</span>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link href="/admin/dashboard" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Dashboard
              </Link>
              <Link href="/admin/codes" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Activation Codes
              </Link>
              <Link href="/admin/referrals" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Referral Codes
              </Link>
              <Link href="/admin/partners" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Partners
              </Link>
              <Link href="/admin/commissions" className="text-white/90 hover:text-white px-3 py-1 rounded bg-white/10">
                Commissions
              </Link>
              <Link href="/admin/orders" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Orders
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Commission Management</h2>
            <p className="text-stone-600">Review, approve, and process partner payouts</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 underline text-sm">Dismiss</button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-stone-500">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary?.pending || 0)}</p>
            <p className="text-xs text-stone-400">{summary?.pendingCount || 0} commissions</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-stone-500">Ready to Pay</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary?.approved || 0)}</p>
            <p className="text-xs text-stone-400">{summary?.approvedCount || 0} commissions</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-stone-500">Paid Out</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary?.paid || 0)}</p>
            <p className="text-xs text-stone-400">{summary?.paidCount || 0} commissions</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-stone-500">Total Commissions</p>
            <p className="text-2xl font-bold text-stone-800">{formatCurrency(summary?.totalAmount || 0)}</p>
            <p className="text-xs text-stone-400">{summary?.totalCommissions || 0} total</p>
          </div>
        </div>

        {/* Ready for Payout Section */}
        {Object.keys(partnersWithApproved).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Partners Ready for Payout
            </h3>
            <div className="grid gap-3">
              {Object.entries(partnersWithApproved).map(([partnerId, data]) => (
                <div key={partnerId} className="flex items-center justify-between bg-white rounded-lg p-4">
                  <div>
                    <p className="font-medium text-stone-800">
                      {data.partner?.partner_name || 'Unknown Partner'}
                    </p>
                    <p className="text-sm text-stone-500">
                      {data.count} commission{data.count !== 1 ? 's' : ''} • {formatCurrency(data.total)}
                    </p>
                    {!data.partner?.bank_account_number && (
                      <p className="text-xs text-orange-600 mt-1">⚠️ No banking details on file</p>
                    )}
                  </div>
                  <button
                    onClick={() => openPayoutModal(partnerId)}
                    disabled={actionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Process Payout
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-xs text-stone-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Partner</label>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Partners</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.partner_name || p.contact_email || p.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Period</label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Bulk actions */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={selectAllPending}
                className="text-sm text-stone-600 hover:text-stone-800 px-3 py-2"
              >
                Select All Pending
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={bulkApprove}
                  disabled={actionLoading}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  Approve Selected ({selectedIds.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {commissions.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No commissions found</p>
              <p className="text-sm">Commissions are created when orders use partner referral codes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === commissions.filter(c => c.status === 'pending').length && selectedIds.size > 0}
                        onChange={() => selectedIds.size > 0 ? setSelectedIds(new Set()) : selectAllPending()}
                        className="rounded border-stone-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Order Value</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Commission</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-stone-50">
                      <td className="px-4 py-4">
                        {commission.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(commission.id)}
                            onChange={() => toggleSelection(commission.id)}
                            className="rounded border-stone-300"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-stone-900">
                        {formatDate(commission.earned_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">
                          {commission.partner?.partner_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-stone-500">
                          {commission.partner?.contact_email}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-stone-600">
                        {commission.order?.order_number || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-stone-900 text-right">
                        {formatCurrency(commission.order_total || commission.order_value)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 text-right">
                        {formatCurrency(commission.commission_amount)}
                        <span className="text-xs text-stone-400 ml-1">
                          ({commission.commission_percent || commission.commission_rate}%)
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[commission.status]}`}>
                          {commission.status}
                        </span>
                        {commission.payout_reference && (
                          <p className="text-xs text-stone-400 mt-1">{commission.payout_reference}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {commission.status === 'pending' && (
                          <button
                            onClick={() => approveCommission(commission.id)}
                            disabled={actionLoading}
                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden mt-8 bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-stone-800 mb-3">Navigation</h3>
          <div className="space-y-2">
            <Link href="/admin/dashboard" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Dashboard
            </Link>
            <Link href="/admin/codes" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Activation Codes
            </Link>
            <Link href="/admin/referrals" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Referral Codes
            </Link>
            <Link href="/admin/partners" className="block px-4 py-2 hover:bg-stone-50 rounded-lg text-stone-600">
              Partners
            </Link>
            <Link href="/admin/commissions" className="block px-4 py-2 bg-stone-100 rounded-lg text-stone-800">
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

      {/* Payout Modal */}
      {showPayoutModal && payoutPartnerId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Process Payout</h3>
            
            {partnersWithApproved[payoutPartnerId] && (
              <div className="bg-stone-50 rounded-lg p-4 mb-4">
                <p className="font-medium">{partnersWithApproved[payoutPartnerId].partner?.partner_name}</p>
                <p className="text-sm text-stone-600">
                  {partnersWithApproved[payoutPartnerId].count} commission(s)
                </p>
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  {formatCurrency(partnersWithApproved[payoutPartnerId].total)}
                </p>
                
                {partnersWithApproved[payoutPartnerId].partner?.bank_account_number ? (
                  <div className="mt-3 pt-3 border-t border-stone-200 text-sm">
                    <p className="text-stone-500">Bank Details:</p>
                    <p>{partnersWithApproved[payoutPartnerId].partner?.bank_name}</p>
                    <p>{partnersWithApproved[payoutPartnerId].partner?.bank_account_name}</p>
                    <p className="font-mono">
                      ****{partnersWithApproved[payoutPartnerId].partner?.bank_account_number?.slice(-4)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                    ⚠️ No banking details on file. Contact partner before processing.
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Payment Reference (e.g., bank transfer ref)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g., TRF-20260122-001"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  rows={2}
                  placeholder="Any notes about this payout..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={createPayout}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
