'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';

interface Purchase {
  id: string;
  purchase_number: string;
  purchase_type: string;
  description: string | null;
  supplier_name: string;
  supplier_contact: string | null;
  supplier_email: string | null;
  supplier_website: string | null;
  quantity: number;
  unit_cost: number | null;
  total_cost: number;
  currency: string;
  status: string;
  ordered_at: string | null;
  expected_delivery: string | null;
  received_at: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  invoice_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Counts {
  all: number;
  pending: number;
  ordered: number;
  shipped: number;
  received: number;
}

const PURCHASE_TYPES: Record<string, string> = {
  qr_tags: 'QR Tags',
  nfc_tags: 'NFC Tags',
  supplies: 'Supplies',
  equipment: 'Equipment',
  services: 'Services',
  other: 'Other',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  ordered: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  ordered: 'Ordered',
  shipped: 'In Transit',
  received: 'Received',
  cancelled: 'Cancelled',
};

export default function AdminPurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, pending: 0, ordered: 0, shipped: 0, received: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  // New purchase form state
  const [newPurchase, setNewPurchase] = useState({
    purchase_type: 'qr_tags',
    description: '',
    supplier_name: '',
    supplier_contact: '',
    supplier_email: '',
    supplier_website: '',
    quantity: 1,
    unit_cost: '',
    total_cost: '',
    currency: 'NZD',
    expected_delivery: '',
    payment_method: '',
    notes: '',
  });

  const fetchPurchases = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/purchases?${params}`);
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setPurchases(data.purchases || []);
      setCounts(data.counts || { all: 0, pending: 0, ordered: 0, shipped: 0, received: 0 });
    } catch (err) {
      setError('Failed to load purchases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter, search, router]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/purchases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchPurchases();
      setSelectedPurchase(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPurchase,
          unit_cost: newPurchase.unit_cost ? parseFloat(newPurchase.unit_cost) : null,
          total_cost: parseFloat(newPurchase.total_cost),
          expected_delivery: newPurchase.expected_delivery || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      await fetchPurchases();
      setShowNewForm(false);
      setNewPurchase({
        purchase_type: 'qr_tags',
        description: '',
        supplier_name: '',
        supplier_contact: '',
        supplier_email: '',
        supplier_website: '',
        quantity: 1,
        unit_cost: '',
        total_cost: '',
        currency: 'NZD',
        expected_delivery: '',
        payment_method: '',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to create purchase');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTracking = async (id: string, tracking_number: string, shipping_carrier: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/purchases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tracking_number, shipping_carrier, status: 'shipped' }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await fetchPurchases();
      setSelectedPurchase(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update tracking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this purchase record?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/purchases?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchPurchases();
      setSelectedPurchase(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'NZD') => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminNav onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Business Purchases</h1>
            <p className="text-stone-600">Track QR tag orders, supplies, and other business purchases</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Purchase
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: counts.all },
                { key: 'pending', label: 'Pending', count: counts.pending },
                { key: 'ordered', label: 'Ordered', count: counts.ordered },
                { key: 'shipped', label: 'In Transit', count: counts.shipped },
                { key: 'received', label: 'Received', count: counts.received },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All Types</option>
              {Object.entries(PURCHASE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search supplier, PO#..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-stone-500">Loading purchases...</div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-stone-500 mb-4">No purchases found</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="text-stone-800 underline hover:no-underline"
            >
              Create your first purchase order
            </button>
          </div>
        ) : (
          /* Purchases Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">PO #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Supplier</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Qty</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Total</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-sm">{purchase.purchase_number}</td>
                    <td className="px-4 py-3 text-sm">{PURCHASE_TYPES[purchase.purchase_type] || purchase.purchase_type}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-stone-800">{purchase.supplier_name}</div>
                      {purchase.description && (
                        <div className="text-xs text-stone-500 truncate max-w-[200px]">{purchase.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{purchase.quantity}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatCurrency(purchase.total_cost, purchase.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[purchase.status]}`}>
                        {STATUS_LABELS[purchase.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">{formatDate(purchase.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedPurchase(purchase)}
                        className="text-stone-600 hover:text-stone-800 text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* New Purchase Modal */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-bold text-stone-800">New Purchase Order</h2>
              </div>
              <form onSubmit={handleCreatePurchase} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Type *</label>
                    <select
                      value={newPurchase.purchase_type}
                      onChange={(e) => setNewPurchase({ ...newPurchase, purchase_type: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      required
                    >
                      {Object.entries(PURCHASE_TYPES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Supplier Name *</label>
                    <input
                      type="text"
                      value={newPurchase.supplier_name}
                      onChange={(e) => setNewPurchase({ ...newPurchase, supplier_name: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newPurchase.description}
                    onChange={(e) => setNewPurchase({ ...newPurchase, description: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    placeholder="e.g., 100x Black QR plates, 30mm round"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Supplier Email</label>
                    <input
                      type="email"
                      value={newPurchase.supplier_email}
                      onChange={(e) => setNewPurchase({ ...newPurchase, supplier_email: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Supplier Website</label>
                    <input
                      type="url"
                      value={newPurchase.supplier_website}
                      onChange={(e) => setNewPurchase({ ...newPurchase, supplier_website: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={newPurchase.quantity}
                      onChange={(e) => setNewPurchase({ ...newPurchase, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Unit Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPurchase.unit_cost}
                      onChange={(e) => setNewPurchase({ ...newPurchase, unit_cost: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Total Cost *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPurchase.total_cost}
                      onChange={(e) => setNewPurchase({ ...newPurchase, total_cost: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Expected Delivery</label>
                    <input
                      type="date"
                      value={newPurchase.expected_delivery}
                      onChange={(e) => setNewPurchase({ ...newPurchase, expected_delivery: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Payment Method</label>
                    <input
                      type="text"
                      value={newPurchase.payment_method}
                      onChange={(e) => setNewPurchase({ ...newPurchase, payment_method: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      placeholder="e.g., Credit Card, Bank Transfer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                  <textarea
                    value={newPurchase.notes}
                    onChange={(e) => setNewPurchase({ ...newPurchase, notes: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="px-4 py-2 text-stone-600 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Creating...' : 'Create Purchase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Purchase Detail Modal */}
        {selectedPurchase && (
          <PurchaseDetailModal
            purchase={selectedPurchase}
            onClose={() => setSelectedPurchase(null)}
            onStatusUpdate={handleStatusUpdate}
            onUpdateTracking={handleUpdateTracking}
            onDelete={handleDelete}
            onInvoiceUploaded={() => {
              fetchPurchases();
              // Refresh the selected purchase
              setSelectedPurchase(null);
            }}
            loading={actionLoading}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        )}
      </main>
    </div>
  );
}

interface PurchaseDetailModalProps {
  purchase: Purchase;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string) => void;
  onUpdateTracking: (id: string, tracking: string, carrier: string) => void;
  onDelete: (id: string) => void;
  onInvoiceUploaded: () => void;
  loading: boolean;
  formatDate: (date: string | null) => string;
  formatCurrency: (amount: number, currency?: string) => string;
}

function PurchaseDetailModal({
  purchase,
  onClose,
  onStatusUpdate,
  onUpdateTracking,
  onDelete,
  onInvoiceUploaded,
  loading,
  formatDate,
  formatCurrency,
}: PurchaseDetailModalProps) {
  const [tracking, setTracking] = useState(purchase.tracking_number || '');
  const [carrier, setCarrier] = useState(purchase.shipping_carrier || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purchaseId', purchase.id);

      const res = await fetch('/api/admin/purchases/invoice', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      onInvoiceUploaded();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-stone-800">{purchase.purchase_number}</h2>
            <p className="text-stone-500">{PURCHASE_TYPES[purchase.purchase_type]}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[purchase.status]}`}>
            {STATUS_LABELS[purchase.status]}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Supplier Info */}
          <div>
            <h3 className="text-sm font-semibold text-stone-500 uppercase mb-2">Supplier</h3>
            <p className="font-medium text-stone-800">{purchase.supplier_name}</p>
            {purchase.supplier_email && (
              <p className="text-sm text-stone-600">{purchase.supplier_email}</p>
            )}
            {purchase.supplier_website && (
              <a href={purchase.supplier_website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                {purchase.supplier_website}
              </a>
            )}
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-500 uppercase mb-2">Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-stone-500">Quantity:</span> {purchase.quantity}</p>
                {purchase.unit_cost && (
                  <p><span className="text-stone-500">Unit Cost:</span> {formatCurrency(purchase.unit_cost, purchase.currency)}</p>
                )}
                <p><span className="text-stone-500">Total:</span> <strong>{formatCurrency(purchase.total_cost, purchase.currency)}</strong></p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-500 uppercase mb-2">Dates</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-stone-500">Created:</span> {formatDate(purchase.created_at)}</p>
                {purchase.ordered_at && (
                  <p><span className="text-stone-500">Ordered:</span> {formatDate(purchase.ordered_at)}</p>
                )}
                {purchase.expected_delivery && (
                  <p><span className="text-stone-500">Expected:</span> {formatDate(purchase.expected_delivery)}</p>
                )}
                {purchase.received_at && (
                  <p><span className="text-stone-500">Received:</span> {formatDate(purchase.received_at)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {purchase.description && (
            <div>
              <h3 className="text-sm font-semibold text-stone-500 uppercase mb-2">Description</h3>
              <p className="text-stone-700">{purchase.description}</p>
            </div>
          )}

          {/* Tracking */}
          {(purchase.status === 'ordered' || purchase.status === 'shipped') && (
            <div>
              <h3 className="text-sm font-semibold text-stone-500 uppercase mb-2">Shipping Tracking</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Tracking number"
                  className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm"
                />
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Carrier</option>
                  <option value="NZ Post">NZ Post</option>
                  <option value="CourierPost">CourierPost</option>
                  <option value="DHL">DHL</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="AliExpress">AliExpress</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  onClick={() => onUpdateTracking(purchase.id, tracking, carrier)}
                  disabled={loading || !tracking}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          {purchase.notes && (
            <div>
              <h3 className="text-sm font-semibold text-stone-500 uppercase mb-2">Notes</h3>
              <p className="text-stone-700 text-sm whitespace-pre-wrap">{purchase.notes}</p>
            </div>
          )}

          {/* Invoice */}
          <div>
            <h3 className="text-sm font-semibold text-stone-500 uppercase mb-2">Supplier Invoice</h3>
            {purchase.invoice_url ? (
              <div className="flex items-center gap-3">
                <a
                  href={purchase.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Invoice
                </a>
                <span className="text-stone-400">|</span>
                <label className="text-stone-500 hover:text-stone-700 cursor-pointer text-sm">
                  Replace
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleInvoiceUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            ) : (
              <div>
                <label className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {uploading ? 'Uploading...' : 'Upload Invoice'}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleInvoiceUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-stone-400 mt-1">PDF or image, max 10MB</p>
              </div>
            )}
            {uploadError && (
              <p className="text-red-600 text-sm mt-2">{uploadError}</p>
            )}
          </div>

          {/* Status Actions */}
          <div className="border-t border-stone-200 pt-4">
            <h3 className="text-sm font-semibold text-stone-500 uppercase mb-3">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {purchase.status === 'pending' && (
                <button
                  onClick={() => onStatusUpdate(purchase.id, 'ordered')}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark as Ordered
                </button>
              )}
              {purchase.status === 'shipped' && (
                <button
                  onClick={() => onStatusUpdate(purchase.id, 'received')}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Mark as Received
                </button>
              )}
              {purchase.status !== 'cancelled' && purchase.status !== 'received' && (
                <button
                  onClick={() => onStatusUpdate(purchase.id, 'cancelled')}
                  disabled={loading}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => onDelete(purchase.id)}
                disabled={loading}
                className="text-red-600 hover:text-red-800 px-4 py-2 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
