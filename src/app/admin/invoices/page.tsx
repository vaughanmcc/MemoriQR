'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  billing_name: string;
  billing_email: string;
  subtotal: string;
  discount_amount: string;
  total_amount: string;
  currency: string;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
  customer: { full_name: string; email: string } | null;
  order: { order_number: string; product_type: string } | null;
}

interface Stats {
  total: number;
  totalRevenue: number;
  thisMonth: number;
  thisMonthRevenue: number;
}

const TYPE_LABELS: Record<string, string> = {
  order: 'Order',
  renewal: 'Renewal',
  partner_batch: 'Partner Batch',
  refund: 'Refund',
};

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  refunded: 'bg-red-100 text-red-800',
  partial_refund: 'bg-orange-100 text-orange-800',
};

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, totalRevenue: 0, thisMonth: 0, thisMonthRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchInvoices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/invoices?${params}`);
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setInvoices(data.invoices || []);
      setStats(data.stats || { total: 0, totalRevenue: 0, thisMonth: 0, thisMonthRevenue: 0 });
    } catch (err) {
      setError('Failed to load invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, router]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const formatCurrency = (amount: string | number, currency: string = 'NZD') => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const openInvoice = (invoice: Invoice) => {
    const url = `/api/invoice?number=${encodeURIComponent(invoice.invoice_number)}&email=${encodeURIComponent(invoice.billing_email)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminNav onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Invoices</h1>
          <p className="text-stone-600">View and manage all invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-stone-500">Total Invoices</p>
            <p className="text-2xl font-bold text-stone-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-stone-500">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-stone-500">This Month</p>
            <p className="text-2xl font-bold text-stone-800">{stats.thisMonth}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-stone-500">This Month Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.thisMonthRevenue)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Search invoice #, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="order">Orders</option>
              <option value="renewal">Renewals</option>
              <option value="partner_batch">Partner Batches</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12 text-stone-500">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-stone-500">No invoices found</p>
          </div>
        ) : (
          /* Invoices Table */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Invoice #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Customer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Order</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-stone-600">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-stone-600">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-sm">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm">{TYPE_LABELS[invoice.invoice_type] || invoice.invoice_type}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-stone-800">{invoice.billing_name}</div>
                      <div className="text-xs text-stone-500">{invoice.billing_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {invoice.order?.order_number || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-right">
                      {parseFloat(invoice.discount_amount) > 0 && (
                        <span className="text-xs text-green-600 block">
                          -{formatCurrency(invoice.discount_amount, invoice.currency)}
                        </span>
                      )}
                      {formatCurrency(invoice.total_amount, invoice.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[invoice.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                        {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">{formatDate(invoice.paid_at || invoice.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openInvoice(invoice)}
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
      </main>
    </div>
  );
}
