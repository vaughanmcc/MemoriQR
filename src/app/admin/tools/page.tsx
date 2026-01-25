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

interface MemorialResult {
  id: string;
  memorial_slug: string;
  deceased_name: string;
  deceased_type: 'pet' | 'human';
  species: string | null;
  is_published: boolean;
  hosting_expires_at: string;
  renewal_status: 'active' | 'expired' | 'renewed';
  views_count: number;
  created_at: string;
  customer: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

interface MemorialDetails extends MemorialResult {
  birth_date: string | null;
  death_date: string | null;
  memorial_text: string | null;
  photos_json: unknown[];
  videos_json: unknown[];
  hosting_duration: number;
  product_type: string;
  theme: string;
  frame: string;
  edit_token: string;
  updated_at: string;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
}

type SortDirection = 'asc' | 'desc';
type OrderSortField = 'order_number' | 'customer' | 'order_type' | 'order_status' | 'created_at';
type MemorialSortField = 'deceased_name' | 'deceased_type' | 'customer' | 'is_published' | 'hosting_expires_at' | 'views_count';

export default function AdminToolsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'search' | 'order' | 'resend' | 'memorials'>('search');
  
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
  const [resendingType, setResendingType] = useState<'activation' | 'memorial' | null>(null);
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
  const [resendingActivationCode, setResendingActivationCode] = useState<string | null>(null);

  // Memorial management
  const [memorialSearchQuery, setMemorialSearchQuery] = useState('');
  const [memorialResults, setMemorialResults] = useState<MemorialResult[]>([]);
  const [isSearchingMemorials, setIsSearchingMemorials] = useState(false);
  const [memorialSearchError, setMemorialSearchError] = useState('');
  const [selectedMemorial, setSelectedMemorial] = useState<MemorialDetails | null>(null);
  const [isLoadingMemorial, setIsLoadingMemorial] = useState(false);
  const [memorialAction, setMemorialAction] = useState<string | null>(null);
  const [memorialActionResult, setMemorialActionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sorting state
  const [orderSortField, setOrderSortField] = useState<OrderSortField>('created_at');
  const [orderSortDirection, setOrderSortDirection] = useState<SortDirection>('desc');
  const [memorialSortField, setMemorialSortField] = useState<MemorialSortField>('hosting_expires_at');
  const [memorialSortDirection, setMemorialSortDirection] = useState<SortDirection>('desc');

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

  // Sort toggle handlers
  const handleOrderSort = (field: OrderSortField) => {
    if (orderSortField === field) {
      setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderSortField(field);
      setOrderSortDirection('asc');
    }
  };

  const handleMemorialSort = (field: MemorialSortField) => {
    if (memorialSortField === field) {
      setMemorialSortDirection(memorialSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setMemorialSortField(field);
      setMemorialSortDirection('asc');
    }
  };

  // Sort indicator component
  const SortIndicator = ({ active, direction }: { active: boolean; direction: SortDirection }) => (
    <span className="ml-1 inline-block">
      {active ? (direction === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  // Sorted results - Orders
  const sortedSearchResults = [...searchResults].sort((a, b) => {
    const dir = orderSortDirection === 'asc' ? 1 : -1;
    switch (orderSortField) {
      case 'order_number':
        return dir * a.order_number.localeCompare(b.order_number);
      case 'customer':
        return dir * (a.customer?.full_name || '').localeCompare(b.customer?.full_name || '');
      case 'order_type':
        return dir * a.order_type.localeCompare(b.order_type);
      case 'order_status':
        return dir * a.order_status.localeCompare(b.order_status);
      case 'created_at':
        return dir * new Date(a.created_at).getTime() - dir * new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });

  // Sorted results - Memorials
  const sortedMemorialResults = [...memorialResults].sort((a, b) => {
    const dir = memorialSortDirection === 'asc' ? 1 : -1;
    switch (memorialSortField) {
      case 'deceased_name':
        return dir * a.deceased_name.localeCompare(b.deceased_name);
      case 'deceased_type':
        return dir * a.deceased_type.localeCompare(b.deceased_type);
      case 'customer':
        return dir * (a.customer?.full_name || '').localeCompare(b.customer?.full_name || '');
      case 'is_published':
        return dir * (a.is_published === b.is_published ? 0 : a.is_published ? -1 : 1);
      case 'hosting_expires_at':
        return dir * new Date(a.hosting_expires_at).getTime() - dir * new Date(b.hosting_expires_at).getTime();
      case 'views_count':
        return dir * (a.views_count - b.views_count);
      default:
        return 0;
    }
  });

  // Search orders by customer name/email
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError('Please enter a customer name or email');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const res = await fetch(`/api/admin/tools/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data.orders || []);
      if (data.orders?.length === 0) {
        setSearchError('No orders found for this customer');
      }
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

    setResendingType(emailType);
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
      setResendingType(null);
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

    setResendingActivationCode(activation.activationCode);
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
      setResendingActivationCode(null);
    }
  };

  // Search memorials
  const handleMemorialSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memorialSearchQuery.trim()) {
      setMemorialSearchError('Please enter a search term');
      return;
    }

    setIsSearchingMemorials(true);
    setMemorialSearchError('');
    setMemorialResults([]);
    setSelectedMemorial(null);

    try {
      const res = await fetch(`/api/admin/tools/memorials?q=${encodeURIComponent(memorialSearchQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setMemorialResults(data.memorials || []);
      if (data.memorials?.length === 0) {
        setMemorialSearchError('No memorials found');
      }
    } catch (err) {
      setMemorialSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearchingMemorials(false);
    }
  };

  // Load memorial details
  const handleSelectMemorial = async (slug: string) => {
    setIsLoadingMemorial(true);
    setMemorialActionResult(null);

    try {
      const res = await fetch(`/api/admin/tools/memorials?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load memorial');
      }

      setSelectedMemorial(data.memorial);
    } catch (err) {
      setMemorialSearchError(err instanceof Error ? err.message : 'Failed to load memorial');
    } finally {
      setIsLoadingMemorial(false);
    }
  };

  // Perform memorial action (toggle publish, extend, reset views)
  const handleMemorialAction = async (action: string, value?: number) => {
    if (!selectedMemorial) return;

    setMemorialAction(action);
    setMemorialActionResult(null);

    try {
      const res = await fetch('/api/admin/tools/memorials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memorialId: selectedMemorial.id,
          action,
          value,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      setMemorialActionResult({ success: true, message: data.message });
      // Refresh memorial details
      await handleSelectMemorial(selectedMemorial.memorial_slug);
    } catch (err) {
      setMemorialActionResult({ success: false, message: err instanceof Error ? err.message : 'Action failed' });
    } finally {
      setMemorialAction(null);
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-stone-800">Admin Tools</h2>
          <Link 
            href="/admin/dashboard" 
            className="text-stone-600 hover:text-stone-800 text-sm flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p className="text-stone-600 mb-8">Order lookup, customer search, memorial management, and email tools</p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
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
            onClick={() => setActiveTab('memorials')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'memorials'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Memorials
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
            <h3 className="text-lg font-bold text-stone-800 mb-2">Search Orders by Customer</h3>
            <p className="text-sm text-stone-600 mb-4">
              Search for online orders by customer name or email. For retail activations, use the Resend Emails tab.
            </p>
            
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter customer name or email..."
                  className="flex-1 max-w-lg px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchError('');
                  }}
                  className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
                >
                  Clear
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
                <p className="text-sm text-stone-600 mb-2">Found {searchResults.length} order(s)</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th 
                        className="text-left py-3 px-2 font-medium text-stone-600 cursor-pointer hover:text-stone-900 select-none"
                        onClick={() => handleOrderSort('order_number')}
                      >
                        Order #<SortIndicator active={orderSortField === 'order_number'} direction={orderSortDirection} />
                      </th>
                      <th 
                        className="text-left py-3 px-2 font-medium text-stone-600 cursor-pointer hover:text-stone-900 select-none"
                        onClick={() => handleOrderSort('customer')}
                      >
                        Customer<SortIndicator active={orderSortField === 'customer'} direction={orderSortDirection} />
                      </th>
                      <th 
                        className="text-left py-3 px-2 font-medium text-stone-600 cursor-pointer hover:text-stone-900 select-none"
                        onClick={() => handleOrderSort('order_type')}
                      >
                        Type<SortIndicator active={orderSortField === 'order_type'} direction={orderSortDirection} />
                      </th>
                      <th 
                        className="text-left py-3 px-2 font-medium text-stone-600 cursor-pointer hover:text-stone-900 select-none"
                        onClick={() => handleOrderSort('order_status')}
                      >
                        Status<SortIndicator active={orderSortField === 'order_status'} direction={orderSortDirection} />
                      </th>
                      <th 
                        className="text-left py-3 px-2 font-medium text-stone-600 cursor-pointer hover:text-stone-900 select-none"
                        onClick={() => handleOrderSort('created_at')}
                      >
                        Date<SortIndicator active={orderSortField === 'created_at'} direction={orderSortDirection} />
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-stone-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSearchResults.map((order) => (
                      <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-3 px-2 font-mono text-xs">{order.order_number}</td>
                        <td className="py-3 px-2">
                          <div>{order.customer?.full_name || '-'}</div>
                          <div className="text-xs text-stone-500">{order.customer?.email || ''}</div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs">{order.order_type}</span>
                        </td>
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
                {/* Back button and title */}
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-stone-800">
                    Order: {orderDetails.order_number}
                  </h4>
                  <button
                    onClick={() => {
                      setOrderDetails(null);
                      setOrderNumber('');
                    }}
                    className="text-stone-500 hover:text-stone-700 text-sm"
                  >
                    ← Back to Lookup
                  </button>
                </div>

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
                          <span className="text-xs text-stone-500 block">QR Code Image URL</span>
                          <a
                            href={`${baseUrl}/api/qr/${orderDetails.memorial.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {baseUrl}/api/qr/{orderDetails.memorial.memorial_slug}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/api/qr/${orderDetails.memorial?.memorial_slug}`)}
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

        {/* Memorials Tab */}
        {activeTab === 'memorials' && (
          <div className="space-y-6">
            {/* Search Memorials */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-2">Search Memorials</h3>
              <p className="text-sm text-stone-600 mb-4">
                Search by deceased name, memorial slug, or customer email
              </p>
              
              <form onSubmit={handleMemorialSearch} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={memorialSearchQuery}
                    onChange={(e) => setMemorialSearchQuery(e.target.value)}
                    placeholder="Enter deceased name, slug, or customer email..."
                    className="flex-1 max-w-lg px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingMemorials}
                    className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50"
                  >
                    {isSearchingMemorials ? 'Searching...' : 'Search'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMemorialSearchQuery('');
                      setMemorialResults([]);
                      setMemorialSearchError('');
                      setSelectedMemorial(null);
                    }}
                    className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {memorialSearchError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
                  {memorialSearchError}
                </div>
              )}

              {/* Search Results */}
              {memorialResults.length > 0 && !selectedMemorial && (
                <div className="overflow-x-auto">
                  <p className="text-sm text-stone-600 mb-2">Found {memorialResults.length} memorial(s)</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-stone-500">
                        <th 
                          className="pb-2 pr-4 cursor-pointer hover:text-stone-900 select-none"
                          onClick={() => handleMemorialSort('deceased_name')}
                        >
                          Deceased Name<SortIndicator active={memorialSortField === 'deceased_name'} direction={memorialSortDirection} />
                        </th>
                        <th 
                          className="pb-2 pr-4 cursor-pointer hover:text-stone-900 select-none"
                          onClick={() => handleMemorialSort('deceased_type')}
                        >
                          Type<SortIndicator active={memorialSortField === 'deceased_type'} direction={memorialSortDirection} />
                        </th>
                        <th 
                          className="pb-2 pr-4 cursor-pointer hover:text-stone-900 select-none"
                          onClick={() => handleMemorialSort('customer')}
                        >
                          Customer<SortIndicator active={memorialSortField === 'customer'} direction={memorialSortDirection} />
                        </th>
                        <th 
                          className="pb-2 pr-4 cursor-pointer hover:text-stone-900 select-none"
                          onClick={() => handleMemorialSort('is_published')}
                        >
                          Status<SortIndicator active={memorialSortField === 'is_published'} direction={memorialSortDirection} />
                        </th>
                        <th 
                          className="pb-2 pr-4 cursor-pointer hover:text-stone-900 select-none"
                          onClick={() => handleMemorialSort('hosting_expires_at')}
                        >
                          Expires<SortIndicator active={memorialSortField === 'hosting_expires_at'} direction={memorialSortDirection} />
                        </th>
                        <th 
                          className="pb-2 pr-4 cursor-pointer hover:text-stone-900 select-none"
                          onClick={() => handleMemorialSort('views_count')}
                        >
                          Views<SortIndicator active={memorialSortField === 'views_count'} direction={memorialSortDirection} />
                        </th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMemorialResults.map((m) => (
                        <tr key={m.id} className="border-b hover:bg-stone-50">
                          <td className="py-3 pr-4 font-medium">{m.deceased_name}</td>
                          <td className="py-3 pr-4 capitalize">
                            {m.deceased_type}
                            {m.species && ` (${m.species})`}
                          </td>
                          <td className="py-3 pr-4">
                            {m.customer?.full_name || 'N/A'}
                            {m.customer?.email && (
                              <span className="block text-xs text-stone-500">{m.customer.email}</span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              m.is_published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {m.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-xs">
                            {new Date(m.hosting_expires_at).toLocaleDateString()}
                            <span className={`block ${
                              new Date(m.hosting_expires_at) < new Date() 
                                ? 'text-red-600' 
                                : 'text-stone-500'
                            }`}>
                              {new Date(m.hosting_expires_at) < new Date() ? 'Expired' : m.renewal_status}
                            </span>
                          </td>
                          <td className="py-3 pr-4">{m.views_count}</td>
                          <td className="py-3">
                            <button
                              onClick={() => handleSelectMemorial(m.memorial_slug)}
                              className="px-3 py-1 bg-stone-800 text-white rounded text-xs hover:bg-stone-700"
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

              {/* Memorial Details */}
              {isLoadingMemorial && (
                <div className="text-center py-8">
                  <p className="text-stone-600">Loading memorial details...</p>
                </div>
              )}

              {selectedMemorial && !isLoadingMemorial && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-stone-800">
                      Memorial: {selectedMemorial.deceased_name}
                    </h4>
                    <button
                      onClick={() => setSelectedMemorial(null)}
                      className="text-stone-500 hover:text-stone-700 text-sm"
                    >
                      ← Back to Results
                    </button>
                  </div>

                  {memorialActionResult && (
                    <div className={`p-4 rounded-lg ${
                      memorialActionResult.success 
                        ? 'bg-green-50 border border-green-200 text-green-700' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {memorialActionResult.message}
                    </div>
                  )}

                  {/* Memorial Info Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="bg-stone-50 p-4 rounded-lg space-y-2">
                      <h5 className="font-medium text-stone-800 mb-3">Memorial Info</h5>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Type:</span>
                        <span className="capitalize">{selectedMemorial.deceased_type}{selectedMemorial.species && ` (${selectedMemorial.species})`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Birth Date:</span>
                        <span>{selectedMemorial.birth_date || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Death Date:</span>
                        <span>{selectedMemorial.death_date || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Product:</span>
                        <span className="capitalize">{selectedMemorial.product_type?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Theme:</span>
                        <span className="capitalize">{selectedMemorial.theme}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Frame:</span>
                        <span className="capitalize">{selectedMemorial.frame}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Photos:</span>
                        <span>{Array.isArray(selectedMemorial.photos_json) ? selectedMemorial.photos_json.length : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Videos:</span>
                        <span>{Array.isArray(selectedMemorial.videos_json) ? selectedMemorial.videos_json.length : 0}</span>
                      </div>
                    </div>

                    {/* Status & Hosting */}
                    <div className="bg-stone-50 p-4 rounded-lg space-y-2">
                      <h5 className="font-medium text-stone-800 mb-3">Status & Hosting</h5>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Published:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          selectedMemorial.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedMemorial.is_published ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Hosting Duration:</span>
                        <span>{selectedMemorial.hosting_duration} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Expires:</span>
                        <span className={new Date(selectedMemorial.hosting_expires_at) < new Date() ? 'text-red-600 font-medium' : ''}>
                          {new Date(selectedMemorial.hosting_expires_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Renewal Status:</span>
                        <span className="capitalize">{selectedMemorial.renewal_status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Views:</span>
                        <span>{selectedMemorial.views_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Created:</span>
                        <span>{new Date(selectedMemorial.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Updated:</span>
                        <span>{new Date(selectedMemorial.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-stone-50 p-4 rounded-lg space-y-2">
                      <h5 className="font-medium text-stone-800 mb-3">Customer</h5>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Name:</span>
                        <span>{selectedMemorial.customer?.full_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Email:</span>
                        <span className="font-mono text-xs">{selectedMemorial.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Phone:</span>
                        <span>{selectedMemorial.customer?.phone || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                      <h5 className="font-medium text-stone-800 mb-3">Actions</h5>
                      <button
                        onClick={() => handleMemorialAction('toggle_publish')}
                        disabled={memorialAction !== null}
                        className={`w-full px-4 py-2 rounded-lg text-sm ${
                          selectedMemorial.is_published
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        } disabled:opacity-50`}
                      >
                        {memorialAction === 'toggle_publish' 
                          ? 'Processing...' 
                          : selectedMemorial.is_published ? 'Unpublish Memorial' : 'Publish Memorial'}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMemorialAction('extend_expiry', 12)}
                          disabled={memorialAction !== null}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                        >
                          {memorialAction === 'extend_expiry' ? 'Extending...' : '+12 Months'}
                        </button>
                        <button
                          onClick={() => handleMemorialAction('extend_expiry', 60)}
                          disabled={memorialAction !== null}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                        >
                          +5 Years
                        </button>
                      </div>
                      <button
                        onClick={() => handleMemorialAction('reset_views')}
                        disabled={memorialAction !== null}
                        className="w-full px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 text-sm disabled:opacity-50"
                      >
                        {memorialAction === 'reset_views' ? 'Resetting...' : 'Reset View Count'}
                      </button>
                    </div>
                  </div>

                  {/* URLs */}
                  <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                    <h5 className="font-medium text-stone-800 mb-3">URLs</h5>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 block">Memorial View URL</span>
                          <a
                            href={`${baseUrl}/memorial/${selectedMemorial.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {baseUrl}/memorial/{selectedMemorial.memorial_slug}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/memorial/${selectedMemorial.memorial_slug}`)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 block">Edit Memorial URL</span>
                          <a
                            href={`${baseUrl}/memorial/edit?slug=${selectedMemorial.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {baseUrl}/memorial/edit?slug={selectedMemorial.memorial_slug}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/memorial/edit?slug=${selectedMemorial.memorial_slug}`)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 block">QR Code Image URL</span>
                          <a
                            href={`${baseUrl}/api/qr/${selectedMemorial.memorial_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {baseUrl}/api/qr/{selectedMemorial.memorial_slug}
                          </a>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/api/qr/${selectedMemorial.memorial_slug}`)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 block">Edit Token (for direct edit access)</span>
                          <span className="text-sm font-mono text-stone-600">{selectedMemorial.edit_token}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedMemorial.edit_token)}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-xs"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Memorial Text Preview */}
                  {selectedMemorial.memorial_text && (
                    <div className="bg-stone-50 p-4 rounded-lg">
                      <h5 className="font-medium text-stone-800 mb-3">Memorial Text</h5>
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">
                        {selectedMemorial.memorial_text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                              disabled={resendingActivationCode !== null || !activation.memorial?.slug || !activation.customerEmail}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
                              title={!activation.customerEmail ? 'No email available' : !activation.memorial?.slug ? 'No memorial' : 'Resend email'}
                            >
                              {resendingActivationCode === activation.activationCode ? 'Sending...' : 'Resend Email'}
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
                  disabled={resendingType !== null || !resendOrderNumber.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {resendingType === 'activation' ? 'Sending...' : 'Resend Order Confirmation'}
                </button>
                <button
                  onClick={() => handleResendEmails('memorial')}
                  disabled={resendingType !== null || !resendOrderNumber.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {resendingType === 'memorial' ? 'Sending...' : 'Resend Memorial Email'}
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
