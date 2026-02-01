'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
}

interface Memorial {
  id: string;
  memorial_slug: string;
  deceased_name: string;
  deceased_type: string;
  is_published?: boolean;
}

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  product_type: string;
  hosting_duration: number;
  total_amount: number;
  order_status: string;
  tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  customer: Customer | null;
  memorial: Memorial | null;
}

interface Counts {
  all: number;
  needs_fulfillment: number;
  shipped: number;
  completed: number;
}

const PRODUCT_LABELS: Record<string, string> = {
  'nfc_only': 'NFC Tag Only',
  'qr_only': 'QR Plate Only',
  'both': 'QR Plate + NFC Tag',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  paid: 'bg-orange-100 text-orange-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Payment',
  paid: 'Needs Fulfillment',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, needs_fulfillment: 0, shipped: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('needs_fulfillment');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(data.orders);
      setCounts(data.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filter, search, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAction = async (orderId: string, action: string, extraData?: Record<string, string>) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extraData }),
      });

      if (!res.ok) {
        throw new Error('Failed to update order');
      }

      // Refresh orders
      await fetchOrders();
      
      // If we have a selected order, refresh it
      if (selectedOrder?.id === orderId) {
        const orderRes = await fetch(`/api/admin/orders/${orderId}`);
        if (orderRes.ok) {
          const data = await orderRes.json();
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  const formatAddress = (address: Customer['shipping_address']) => {
    if (!address) return 'No address provided';
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.postal_code,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getBaseUrl = () => {
    return (typeof window !== 'undefined' && window.location.origin) || 'https://memoriqr.co.nz';
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminNav onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-800">Order Fulfillment</h2>
          <Link href="/admin/dashboard" className="text-stone-500 hover:text-stone-700 text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('needs_fulfillment')}
            className={`px-4 py-2 rounded-lg font-medium relative ${
              filter === 'needs_fulfillment'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Needs Fulfillment
            {counts.needs_fulfillment > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === 'needs_fulfillment' ? 'bg-white/20' : 'bg-orange-100 text-orange-800'
              }`}>
                {counts.needs_fulfillment}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'shipped'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Shipped
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === 'shipped' ? 'bg-white/20' : 'bg-purple-100 text-purple-800'
            }`}>
              {counts.shipped}
            </span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Completed
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === 'completed' ? 'bg-white/20' : 'bg-green-100 text-green-800'
            }`}>
              {counts.completed}
            </span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            All Orders
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === 'all' ? 'bg-white/20' : 'bg-stone-200'
            }`}>
              {counts.all}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by order number, activation code, customer, or memorial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          />
          {search.toUpperCase().startsWith('MQR-') && (
            <p className="mt-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg inline-block">
              💡 Looking for activation code <strong>{search.toUpperCase()}</strong>? Check the{' '}
              <Link href={`/admin/codes?search=${encodeURIComponent(search)}`} className="text-amber-800 underline font-medium">Activation Codes</Link> page.
            </p>
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="animate-pulse text-stone-500">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">No orders found</h3>
            <p className="text-stone-500">
              {filter === 'needs_fulfillment' 
                ? 'All orders have been fulfilled!' 
                : 'No orders match your current filter.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-500">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-500">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-500">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-500">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50">
                    <td className="px-4 py-4">
                      <div className="font-mono font-medium text-stone-800">{order.order_number}</div>
                      <div className="text-sm text-stone-500">{order.memorial?.deceased_name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-stone-800">{order.customer?.full_name}</div>
                      <div className="text-sm text-stone-500">{order.customer?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-stone-800">{PRODUCT_LABELS[order.product_type] || order.product_type}</div>
                      <div className="text-sm text-stone-500">{order.hosting_duration} years</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[order.order_status]}`}>
                        {STATUS_LABELS[order.order_status] || order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-stone-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingNumber(order.tracking_number || '');
                          setShippingCarrier(order.shipping_carrier || '');
                        }}
                        className="text-stone-600 hover:text-stone-800 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-stone-800 text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selectedOrder.order_number}</h3>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[selectedOrder.order_status]}`}>
                      {STATUS_LABELS[selectedOrder.order_status]}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white/70 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-3">Order Details</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-stone-500">Product:</dt>
                        <dd className="font-medium">{PRODUCT_LABELS[selectedOrder.product_type]}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-stone-500">Hosting:</dt>
                        <dd className="font-medium">{selectedOrder.hosting_duration} years</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-stone-500">Amount:</dt>
                        <dd className="font-medium text-green-700">${selectedOrder.total_amount} NZD</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-stone-500">Memorial For:</dt>
                        <dd className="font-medium">{selectedOrder.memorial?.deceased_name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-stone-500">Order Date:</dt>
                        <dd className="font-medium">{formatDate(selectedOrder.created_at)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-semibold text-stone-800 mb-3">Customer</h4>
                    <div className="bg-stone-50 rounded-lg p-3">
                      <p className="font-medium">{selectedOrder.customer?.full_name}</p>
                      <p className="text-sm text-stone-600">{selectedOrder.customer?.email}</p>
                      {selectedOrder.customer?.phone && (
                        <p className="text-sm text-stone-600">{selectedOrder.customer.phone}</p>
                      )}
                    </div>

                    <h4 className="font-semibold text-stone-800 mt-4 mb-3">Ship To</h4>
                    <div className="bg-stone-50 rounded-lg p-3">
                      <p className="text-sm">{formatAddress(selectedOrder.customer?.shipping_address || null)}</p>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Details */}
                <div className="border-2 border-amber-600 rounded-lg overflow-hidden">
                  <div className="bg-amber-600 text-white px-4 py-2 font-semibold">
                    ⚙️ Fulfillment Details
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-stone-700">NFC URL (program to tag):</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm bg-stone-100 px-3 py-2 rounded font-mono break-all">
                          {getBaseUrl()}/memorial/{selectedOrder.memorial?.memorial_slug}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${getBaseUrl()}/memorial/${selectedOrder.memorial?.memorial_slug}`)}
                          className="px-3 py-2 bg-stone-200 hover:bg-stone-300 rounded text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Memorial Page:</label>
                      <a
                        href={`${getBaseUrl()}/memorial/${selectedOrder.memorial?.memorial_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-sm text-amber-700 hover:underline"
                      >
                        {getBaseUrl()}/memorial/{selectedOrder.memorial?.memorial_slug}
                      </a>
                    </div>
                    {(selectedOrder.product_type === 'qr_only' || selectedOrder.product_type === 'both') && (
                      <div>
                        <label className="text-sm font-medium text-stone-700">QR Code:</label>
                        <div className="mt-2 flex items-center gap-4">
                          <img 
                            src={`${getBaseUrl()}/api/qr/${selectedOrder.memorial?.memorial_slug}`}
                            alt="QR Code"
                            className="w-24 h-24 border rounded"
                          />
                          <a
                            href={`${getBaseUrl()}/api/qr/${selectedOrder.memorial?.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-amber-700 hover:underline"
                          >
                            Download QR Code →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Checklist */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">📋 Action Checklist</h4>
                  <div className="space-y-2">
                    {(selectedOrder.product_type === 'nfc_only' || selectedOrder.product_type === 'both') && (
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checklist[`${selectedOrder.id}-nfc`] || false}
                          onChange={(e) => setChecklist({ ...checklist, [`${selectedOrder.id}-nfc`]: e.target.checked })}
                          className="sr-only"
                        />
                        <span className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          checklist[`${selectedOrder.id}-nfc`]
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-blue-300 bg-white group-hover:border-blue-400'
                        }`}>
                          {checklist[`${selectedOrder.id}-nfc`] && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-sm ${checklist[`${selectedOrder.id}-nfc`] ? 'text-green-700 line-through' : 'text-blue-800'}`}>
                          Program NFC tag with memorial URL
                        </span>
                      </label>
                    )}
                    {(selectedOrder.product_type === 'qr_only' || selectedOrder.product_type === 'both') && (
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checklist[`${selectedOrder.id}-qr`] || false}
                          onChange={(e) => setChecklist({ ...checklist, [`${selectedOrder.id}-qr`]: e.target.checked })}
                          className="sr-only"
                        />
                        <span className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          checklist[`${selectedOrder.id}-qr`]
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-blue-300 bg-white group-hover:border-blue-400'
                        }`}>
                          {checklist[`${selectedOrder.id}-qr`] && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-sm ${checklist[`${selectedOrder.id}-qr`] ? 'text-green-700 line-through' : 'text-blue-800'}`}>
                          Print QR code for plate
                        </span>
                      </label>
                    )}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checklist[`${selectedOrder.id}-ship`] || false}
                        onChange={(e) => setChecklist({ ...checklist, [`${selectedOrder.id}-ship`]: e.target.checked })}
                        className="sr-only"
                      />
                      <span className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        checklist[`${selectedOrder.id}-ship`]
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-blue-300 bg-white group-hover:border-blue-400'
                      }`}>
                        {checklist[`${selectedOrder.id}-ship`] && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-sm ${checklist[`${selectedOrder.id}-ship`] ? 'text-green-700 line-through' : 'text-blue-800'}`}>
                        Pack and ship to customer address
                      </span>
                    </label>
                  </div>
                </div>

                {/* Shipping/Tracking (for shipped orders or to add) */}
                {(selectedOrder.order_status === 'paid' || selectedOrder.order_status === 'shipped') && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-stone-800 mb-3">Shipping Details</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Carrier</label>
                        <input
                          type="text"
                          value={shippingCarrier}
                          onChange={(e) => setShippingCarrier(e.target.value)}
                          placeholder="e.g., NZ Post, CourierPost"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Tracking number"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {selectedOrder.order_status === 'paid' && (
                    <button
                      onClick={() => handleAction(selectedOrder.id, 'mark_shipped', { 
                        tracking_number: trackingNumber, 
                        shipping_carrier: shippingCarrier 
                      })}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : '📦 Mark as Shipped'}
                    </button>
                  )}
                  {selectedOrder.order_status === 'shipped' && (
                    <>
                      <button
                        onClick={() => handleAction(selectedOrder.id, 'update_tracking', { 
                          tracking_number: trackingNumber, 
                          shipping_carrier: shippingCarrier 
                        })}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50"
                      >
                        Update Tracking
                      </button>
                      <button
                        onClick={() => handleAction(selectedOrder.id, 'mark_completed')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        ✓ Mark as Completed
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
