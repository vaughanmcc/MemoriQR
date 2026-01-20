'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Partner {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  partner_type: string;
  commission_rate: number;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  website?: string;
  application_message?: string;
  created_at: string;
}

const PARTNER_TYPE_LABELS: Record<string, string> = {
  funeral_director: 'Funeral Director',
  cemetery: 'Cemetery',
  pet_cremation: 'Pet Cremation',
  retailer: 'Retailer',
  other: 'Other',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-stone-100 text-stone-600',
};

// Wrapper component to handle Suspense for useSearchParams
export default function AdminPartnersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    }>
      <AdminPartnersContent />
    </Suspense>
  );
}

function AdminPartnersContent() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    partnerType: 'funeral_director',
    website: '',
    commissionRate: 15,
    status: 'active' as 'active' | 'pending' | 'suspended' | 'rejected',
    defaultDiscountPercent: 10,
    defaultCommissionPercent: 15,
    defaultFreeShipping: false,
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const fetchPartners = useCallback(async () => {
    try {
      const url = statusFilter !== 'all' 
        ? `/api/admin/partners?status=${statusFilter}`
        : '/api/admin/partners';
      
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch partners');
      }
      const data = await res.json();
      setPartners(data.partners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleAction = async (partnerId: string, action: 'approve' | 'reject' | 'suspend' | 'activate') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error('Failed to update partner');
      }

      // Refresh the list
      await fetchPartners();
      setSelectedPartner(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  const handleCreatePartner = async () => {
    setCreateLoading(true);
    setCreateError('');

    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: createForm.businessName,
          contactName: createForm.contactName,
          email: createForm.email,
          phone: createForm.phone,
          partnerType: createForm.partnerType,
          website: createForm.website || null,
          commissionRate: createForm.commissionRate,
          status: createForm.status,
          defaultDiscountPercent: createForm.defaultDiscountPercent,
          defaultCommissionPercent: createForm.defaultCommissionPercent,
          defaultFreeShipping: createForm.defaultFreeShipping,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create partner');
      }

      setShowCreateModal(false);
      setCreateForm({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        partnerType: 'funeral_director',
        website: '',
        commissionRate: 15,
        status: 'active',
        defaultDiscountPercent: 10,
        defaultCommissionPercent: 15,
        defaultFreeShipping: false,
      });
      await fetchPartners();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create partner');
    } finally {
      setCreateLoading(false);
    }
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
            <h1 className="text-xl font-bold">MemoriQR Admin</h1>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link href="/admin/dashboard" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Dashboard
              </Link>
              <Link href="/admin/partners" className="text-white/90 hover:text-white px-3 py-1 rounded bg-white/10">
                Partners
              </Link>
              <Link href="/admin/orders" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Orders
              </Link>
              <Link href="/admin/memorials" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Memorials
              </Link>
            </nav>
          </div>
          <button onClick={handleLogout} className="text-white/70 hover:text-white text-sm">
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Partner Management</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700"
          >
            Add Partner
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'active', 'suspended', 'rejected'].map((status) => (
              <Link
                key={status}
                href={status === 'all' ? '/admin/partners' : `/admin/partners?status=${status}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && partners.filter(p => p.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {partners.filter(p => p.status === 'pending').length}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-500">Business</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-500">Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-500">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-stone-500">Commission</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-stone-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    No partners found
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-800">{partner.business_name}</p>
                      <p className="text-sm text-stone-500">{partner.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {PARTNER_TYPE_LABELS[partner.partner_type] || partner.partner_type}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-stone-800">{partner.contact_name}</p>
                      <p className="text-sm text-stone-500">{partner.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[partner.status || 'pending']}`}>
                        {(partner.status || 'pending').charAt(0).toUpperCase() + (partner.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {partner.commission_rate}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPartner(partner)}
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-stone-800">{selectedPartner.business_name}</h3>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[selectedPartner.status || 'pending']}`}>
                {(selectedPartner.status || 'pending').charAt(0).toUpperCase() + (selectedPartner.status || 'pending').slice(1)}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-stone-500">Business Type</label>
                <p className="font-medium">{PARTNER_TYPE_LABELS[selectedPartner.partner_type]}</p>
              </div>
              <div>
                <label className="text-sm text-stone-500">Contact</label>
                <p className="font-medium">{selectedPartner.contact_name}</p>
                <p className="text-sm text-stone-600">{selectedPartner.email}</p>
                <p className="text-sm text-stone-600">{selectedPartner.phone}</p>
              </div>
              {selectedPartner.website && (
                <div>
                  <label className="text-sm text-stone-500">Website</label>
                  <p>
                    <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {selectedPartner.website}
                    </a>
                  </p>
                </div>
              )}
              {selectedPartner.application_message && (
                <div>
                  <label className="text-sm text-stone-500">Application Message</label>
                  <p className="text-stone-700 bg-stone-50 p-3 rounded-lg mt-1">
                    {selectedPartner.application_message}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-stone-500">Commission Rate</label>
                <p className="font-medium">{selectedPartner.commission_rate}%</p>
              </div>
              <div>
                <label className="text-sm text-stone-500">Applied</label>
                <p className="text-stone-600">
                  {new Date(selectedPartner.created_at).toLocaleDateString('en-NZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-stone-50 flex flex-wrap gap-3">
              {selectedPartner.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction(selectedPartner.id, 'approve')}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(selectedPartner.id, 'reject')}
                    disabled={actionLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              {selectedPartner.status === 'active' && (
                <button
                  onClick={() => handleAction(selectedPartner.id, 'suspend')}
                  disabled={actionLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Suspend
                </button>
              )}
              {selectedPartner.status === 'suspended' && (
                <button
                  onClick={() => handleAction(selectedPartner.id, 'activate')}
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Reactivate
                </button>
              )}
              <button
                onClick={() => setSelectedPartner(null)}
                className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">Create Partner</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}

              <div>
                <label className="text-sm text-stone-500">Business Name *</label>
                <input
                  className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                  value={createForm.businessName}
                  onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-stone-500">Contact Name *</label>
                  <input
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.contactName}
                    onChange={(e) => setCreateForm({ ...createForm, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-stone-500">Email *</label>
                  <input
                    type="email"
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-stone-500">Phone *</label>
                  <input
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-stone-500">Partner Type *</label>
                  <select
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.partnerType}
                    onChange={(e) => setCreateForm({ ...createForm, partnerType: e.target.value })}
                  >
                    {Object.entries(PARTNER_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-stone-500">Website</label>
                <input
                  className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                  value={createForm.website}
                  onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-stone-500">Commission Rate %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.commissionRate}
                    onChange={(e) => setCreateForm({ ...createForm, commissionRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm text-stone-500">Status</label>
                  <select
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as 'active' | 'pending' | 'suspended' | 'rejected' })}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={createForm.defaultFreeShipping}
                    onChange={(e) => setCreateForm({ ...createForm, defaultFreeShipping: e.target.checked })}
                  />
                  <span className="text-sm text-stone-600">Free Shipping</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-stone-500">Default Discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.defaultDiscountPercent}
                    onChange={(e) => setCreateForm({ ...createForm, defaultDiscountPercent: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm text-stone-500">Default Commission %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2"
                    value={createForm.defaultCommissionPercent}
                    onChange={(e) => setCreateForm({ ...createForm, defaultCommissionPercent: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePartner}
                disabled={createLoading}
                className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700 disabled:opacity-50"
              >
                {createLoading ? 'Creating...' : 'Create Partner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
