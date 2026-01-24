'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  product_type: string;
  hosting_duration: number;
  total_amount: number;
  order_status: string;
  created_at: string;
  paid_at: string | null;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    shipping_address: Record<string, string> | null;
  } | null;
  memorial: {
    id: string;
    memorial_slug: string;
    deceased_name: string;
    deceased_type: string;
    is_published: boolean;
  } | null;
}

interface OrderDetails extends Order {
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  engraving_text: string | null;
  qr_code_url: string | null;
  nfc_tag_id: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
  shipped_at: string | null;
  completed_at: string | null;
}

interface ActivationResult {
  activationCode: string;
  productType: string;
  hostingDuration: number;
  usedAt: string | null;
  partner: {
    id: string;
    name: string;
    type: string;
  } | null;
  memorial: {
    id: string;
    slug: string;
    deceasedName: string;
    deceasedType: string;
    isPublished: boolean;
    expiresAt: string;
  } | null;
  customerEmail: string | null;
  customerName: string | null;
}

export default function AdminToolsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'search' | 'order' | 'resend'>('search');
  
  // Search by customer
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Order lookup
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Resend emails - Order based (for online orders)
  const [resendOrderNumber, setResendOrderNumber] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendResult, setResendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [resendError, setResendError] = useState('');

  // Activation search (for retail activations)
  const [activationBusinessName, setActivationBusinessName] = useState('');
  const [activationPartnerType, setActivationPartnerType] = useState('');
  const [activationCustomerEmail, setActivationCustomerEmail] = useState('');
  const [activationResults, setActivationResults] = useState<ActivationResult[]>([]);
  const [isSearchingActivations, setIsSearchingActivations] = useState(false);
  const [activationSearchError, setActivationSearchError] = useState('');
  const [selectedActivation, setSelectedActivation] = useState<ActivationResult | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/session');
    if (!res.ok) {
      router.push('/admin');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  // Search orders by customer name/email
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const res = await fetch(`/api/admin/tools/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.orders || []);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Get order details by order number
  const handleOrderLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsLoadingOrder(true);
    setOrderError('');
    setOrderDetails(null);

    try {
      const res = await fetch(`/api/admin/tools/order?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Order not found');
      }

      setOrderDetails(data.order);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Order lookup failed');
    } finally {
      setIsLoadingOrder(false);
    }
  };

  // Resend activation/memorial emails
  const handleResendEmails = async (emailType: 'activation' | 'memorial') => {
    if (!resendOrderNumber.trim()) return;

    setIsResending(true);
    setResendError('');
    setResendResult(null);

    try {
      const res = await fetch('/api/admin/tools/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: resendOrderNumber.trim(),
          emailType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend email');
      }

      setResendResult({ success: true, message: data.message });
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  // Search activations by partner info and customer email
  const handleActivationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationBusinessName.trim() && !activationPartnerType && !activationCustomerEmail.trim()) {
      setActivationSearchError('Please enter at least one search field');
      return;
    }

    setIsSearchingActivations(true);
    setActivationSearchError('');
    setActivationResults([]);
    setSelectedActivation(null);

    try {
      const res = await fetch('/api/admin/tools/search-activations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: activationBusinessName.trim(),
          partnerType: activationPartnerType || undefined,
          customerEmail: activationCustomerEmail.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setActivationResults(data.activations || []);
      if (data.activations?.length === 0) {
        setActivationSearchError('No activations found matching your search');
      }
    } catch (err) {
      setActivationSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearchingActivations(false);
    }
  };

  // Resend memorial creation email for activation
  const handleResendActivationEmail = async (activation: ActivationResult) => {
    if (!activation.memorial?.slug || !activation.customerEmail) {
      setActivationSearchError('Cannot resend - missing memorial or email');
      return;
    }

    setIsResending(true);
    setActivationSearchError('');
    setResendResult(null);

    try {
      const res = await fetch('/api/admin/tools/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialSlug: activation.memorial.slug,
          emailType: 'memorial_created',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend email');
      }

      setResendResult({ success: true, message: data.message });
    } catch (err) {
      setActivationSearchError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://memoriqr.co.nz';

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
              <Link href="/admin/partners" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Partners
              </Link>
              <Link href="/admin/orders" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Orders
              </Link>
              <Link href="/admin/tools" className="text-white/90 hover:text-white px-3 py-1 rounded bg-white/10">
                Tools
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
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Admin Tools</h2>
        <p className="text-stone-600 mb-8">Order lookup, customer search, and email management</p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'search'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Search Orders
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'order'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Order Lookup
          </button>
          <button
            onClick={() => setActiveTab('resend')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'resend'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Resend Emails
          </button>
        </div>

        {/* Search Orders Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Search Orders by Customer</h3>
            
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter customer name or email..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {searchError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                {searchError}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-3 px-2 font-medium text-stone-600">Order #</th>
                      <th className="text-left py-3 px-2 font-medium text-stone-600">Customer</th>
                      <th className="text-left py-3 px-2 font-medium text-stone-600">Email</th>
                      <th className="text-left py-3 px-2 font-medium text-stone-600">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-stone-600">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-stone-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((order) => (
                      <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-3 px-2 font-mono">{order.order_number}</td>
                        <td className="py-3 px-2">{order.customer?.full_name || '-'}</td>
                        <td className="py-3 px-2">{order.customer?.email || '-'}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.order_status === 'paid' ? 'bg-blue-100 text-blue-800' :
                            order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            'bg-stone-100 text-stone-800'
                          }`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td className="py-3 px-2">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => {
                              setOrderNumber(order.order_number);
                              setActiveTab('order');
                              setOrderDetails(null);
                            }}
                            className="text-stone-600 hover:text-stone-900 text-xs underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && !searchError && (
              <p className="text-stone-500 text-center py-8">No orders found</p>
            )}
          </div>
        )}

        {/* Order Lookup Tab */}
        {activeTab === 'order' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Order Lookup by Order Number</h3>
            
            <form onSubmit={handleOrderLookup} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter order number (e.g. MQR-ABC123)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoadingOrder || !orderNumber.trim()}
                  className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50"
                >
                  {isLoadingOrder ? 'Loading...' : 'Lookup'}
                </button>
              </div>
            </form>

            {orderError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                {orderError}
              </div>
            )}

            {orderDetails && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-stone-800 border-b pb-2">Order Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-stone-500">Order Number:</span>
                      <span className="font-mono">{orderDetails.order_number}</span>
                      <span className="text-stone-500">Status:</span>
                      <span className={`font-medium ${
                        orderDetails.order_status === 'completed' ? 'text-green-600' :
                        orderDetails.order_status === 'paid' ? 'text-blue-600' :
                        'text-stone-800'
                      }`}>{orderDetails.order_status}</span>
                      <span className="text-stone-500">Product:</span>
                      <span>{orderDetails.product_type?.replace('_', ' ')}</span>
                      <span className="text-stone-500">Duration:</span>
                      <span>{orderDetails.hosting_duration} years</span>
                      <span className="text-stone-500">Total:</span>
                      <span>${orderDetails.total_amount?.toFixed(2)}</span>
                      <span className="text-stone-500">Created:</span>
                      <span>{new Date(orderDetails.created_at).toLocaleString()}</span>
                      {orderDetails.paid_at && (
                        <>
                          <span className="text-stone-500">Paid:</span>
                          <span>{new Date(orderDetails.paid_at).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-stone-800 border-b pb-2">Customer</h4>
                    {orderDetails.customer ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-stone-500">Name:</span>
                        <span>{orderDetails.customer.full_name}</span>
                        <span className="text-stone-500">Email:</span>
                        <span>{orderDetails.customer.email}</span>
                        <span className="text-stone-500">Phone:</span>
                        <span>{orderDetails.customer.phone || '-'}</span>
                        {orderDetails.customer.shipping_address && (
                          <>
                            <span className="text-stone-500">Address:</span>
                            <span className="text-xs">
                              {orderDetails.customer.shipping_address.line1}<br />
                              {orderDetails.customer.shipping_address.city}, {orderDetails.customer.shipping_address.postal_code}
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-stone-500 text-sm">No customer data</p>
                    )}
                  </div>
                </div>

                {/* Memorial & URLs */}
                {orderDetails.memorial && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-stone-800 border-b pb-2">Memorial & URLs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-stone-500">Deceased Name:</span>
                        <span className="ml-2">{orderDetails.memorial.deceased_name}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Type:</span>
                        <span className="ml-2 capitalize">{orderDetails.memorial.deceased_type}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Published:</span>
                        <span className="ml-2">{orderDetails.memorial.is_published ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 block">QR Code / View URL</span>
                          <a
                            href={`${baseUrl}/qr/${orderDetails.memorial.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {baseUrl}/qr/{orderDetails.memorial.memorial_slug}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/qr/${orderDetails.memorial?.memorial_slug}`)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 block">Memorial View URL</span>
                          <a
                            href={`${baseUrl}/memorial/${orderDetails.memorial.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {baseUrl}/memorial/{orderDetails.memorial.memorial_slug}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/memorial/${orderDetails.memorial?.memorial_slug}`)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 block">Edit Memorial URL</span>
                          <a
                            href={`${baseUrl}/memorial/edit?slug=${orderDetails.memorial.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {baseUrl}/memorial/edit?slug={orderDetails.memorial.memorial_slug}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/memorial/edit?slug=${orderDetails.memorial?.memorial_slug}`)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => {
                      setResendOrderNumber(orderDetails.order_number);
                      setActiveTab('resend');
                      setResendResult(null);
                      setResendError('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Resend Emails
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resend Emails Tab */}
        {activeTab === 'resend' && (
          <div className="space-y-6">
            {/* Activation Email Search - Primary for retail */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-2">Search Retail Activations</h3>
              <p className="text-sm text-stone-600 mb-4">
                Search for retail activations by business name, partner type, or customer email to resend memorial creation emails.
              </p>
              
              <form onSubmit={handleActivationSearch} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={activationBusinessName}
                      onChange={(e) => setActivationBusinessName(e.target.value)}
                      placeholder="e.g. Pet Haven Vets"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Partner Type</label>
                    <select
                      value={activationPartnerType}
                      onChange={(e) => setActivationPartnerType(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="vet">Veterinarian</option>
                      <option value="crematorium">Crematorium</option>
                      <option value="funeral_home">Funeral Home</option>
                      <option value="pet_store">Pet Store</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Customer Email</label>
                    <input
                      type="text"
                      value={activationCustomerEmail}
                      onChange={(e) => setActivationCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSearchingActivations}
                    className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50"
                  >
                    {isSearchingActivations ? 'Searching...' : 'Search Activations'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivationBusinessName('');
                      setActivationPartnerType('');
                      setActivationCustomerEmail('');
                      setActivationResults([]);
                      setActivationSearchError('');
                      setSelectedActivation(null);
                      setResendResult(null);
                    }}
                    className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {activationSearchError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {activationSearchError}
                </div>
              )}

              {resendResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  resendResult.success 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {resendResult.message}
                </div>
              )}

              {/* Activation Results */}
              {activationResults.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-stone-800 mb-3">Found {activationResults.length} Activation(s)</h4>
                  <div className="space-y-3">
                    {activationResults.map((activation) => (
                      <div 
                        key={activation.activationCode}
                        className={`p-4 border rounded-lg ${
                          selectedActivation?.activationCode === activation.activationCode
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-sm bg-stone-100 px-2 py-1 rounded">
                                {activation.activationCode}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                activation.memorial?.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {activation.memorial?.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                              <div>
                                <span className="text-stone-500">Partner:</span>{' '}
                                <span className="font-medium">{activation.partner?.name || 'N/A'}</span>
                                {activation.partner?.type && (
                                  <span className="text-stone-500 ml-1">({activation.partner.type})</span>
                                )}
                              </div>
                              <div>
                                <span className="text-stone-500">Customer:</span>{' '}
                                <span className="font-medium">{activation.customerEmail || 'No email'}</span>
                              </div>
                              <div>
                                <span className="text-stone-500">Memorial:</span>{' '}
                                <span className="font-medium">
                                  {activation.memorial?.deceasedName || 'Not created'}
                                  {activation.memorial?.deceasedType && (
                                    <span className="text-stone-500 ml-1">
                                      ({activation.memorial.deceasedType})
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-stone-500">Activated:</span>{' '}
                                <span className="font-medium">
                                  {activation.usedAt 
                                    ? new Date(activation.usedAt).toLocaleDateString('en-NZ', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                            </div>

                            {activation.memorial && (
                              <div className="mt-2 flex gap-2 text-xs">
                                <a
                                  href={`${baseUrl}/memorial/${activation.memorial.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Memorial →
                                </a>
                                <a
                                  href={`${baseUrl}/memorial/edit?slug=${activation.memorial.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Edit Memorial →
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            <button
                              onClick={() => handleResendActivationEmail(activation)}
                              disabled={isResending || !activation.memorial?.slug || !activation.customerEmail}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
                              title={!activation.customerEmail ? 'No email available' : !activation.memorial?.slug ? 'No memorial' : 'Resend email'}
                            >
                              {isResending ? 'Sending...' : 'Resend Email'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order-based Email Resend - Secondary for online orders */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-2">Resend Order Emails</h3>
              <p className="text-sm text-stone-600 mb-4">
                For online orders (not retail activations), resend emails by order number.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">Order Number</label>
                <input
                  type="text"
                  value={resendOrderNumber}
                  onChange={(e) => setResendOrderNumber(e.target.value)}
                  placeholder="Enter order number (e.g. MQR-ABC123)"
                  className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent font-mono"
                />
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleResendEmails('activation')}
                  disabled={isResending || !resendOrderNumber.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {isResending ? 'Sending...' : 'Resend Order Confirmation'}
                </button>
                <button
                  onClick={() => handleResendEmails('memorial')}
                  disabled={isResending || !resendOrderNumber.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {isResending ? 'Sending...' : 'Resend Memorial Email'}
                </button>
              </div>

              {resendError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {resendError}
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-stone-50 rounded-xl p-6">
              <h4 className="font-medium text-stone-800 mb-2">Email Types</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-600">
                <div>
                  <strong className="text-stone-800">Retail Activations:</strong>
                  <p className="mt-1">Search by partner/customer, then resend the memorial creation email with edit link and QR code.</p>
                </div>
                <div>
                  <strong className="text-stone-800">Online Orders:</strong>
                  <p className="mt-1">Use order number to resend order confirmation or memorial edit instructions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <Link href="/admin/dashboard" className="py-2 text-stone-600">Dashboard</Link>
            <Link href="/admin/partners" className="py-2 text-stone-600">Partners</Link>
            <Link href="/admin/orders" className="py-2 text-stone-600">Orders</Link>
            <Link href="/admin/tools" className="py-2 text-stone-800 font-bold">Tools</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
