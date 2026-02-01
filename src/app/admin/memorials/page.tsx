'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';

interface Customer {
  id: string;
  full_name: string;
  email: string;
}

interface Memorial {
  id: string;
  memorial_slug: string;
  deceased_name: string;
  deceased_type: string;
  birth_date: string | null;
  death_date: string | null;
  is_published: boolean;
  fulfillment_status: string;
  activation_code: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  customer: Customer | null;
}

interface Counts {
  all: number;
  published: number;
  draft: number;
  pending_fulfillment: number;
}

const FULFILLMENT_STYLES: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

const FULFILLMENT_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
};

export default function AdminMemorialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const initialFulfillment = searchParams.get('fulfillment') || 'all';
  
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, published: 0, draft: 0, pending_fulfillment: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [fulfillmentFilter, setFulfillmentFilter] = useState(initialFulfillment);
  const [search, setSearch] = useState('');

  const fetchMemorials = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (fulfillmentFilter !== 'all') params.set('fulfillment', fulfillmentFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/memorials?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch memorials');
      }
      const data = await res.json();
      setMemorials(data.memorials || []);
      setCounts(data.counts || { all: 0, published: 0, draft: 0, pending_fulfillment: 0 });
    } catch (err) {
      console.error('Error fetching memorials:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, fulfillmentFilter, search, router]);

  useEffect(() => {
    fetchMemorials();
  }, [fetchMemorials]);

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDeceasedTypeEmoji = (type: string) => {
    if (type === 'pet') return '🐾';
    return '🕊️';
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminNav onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Memorials</h2>
          <Link 
            href="/admin/dashboard" 
            className="text-stone-500 hover:text-stone-700 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                statusFilter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              All
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === 'all' ? 'bg-white/20' : 'bg-stone-200'
              }`}>
                {counts.all}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium ${
                statusFilter === 'published'
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              Published
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === 'published' ? 'bg-white/20' : 'bg-green-100 text-green-700'
              }`}>
                {counts.published}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium ${
                statusFilter === 'draft'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              Draft
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                statusFilter === 'draft' ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {counts.draft}
              </span>
            </button>
          </div>

          {/* Fulfillment Filter */}
          <div className="flex gap-2 ml-auto">
            <select
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-stone-300 bg-white text-stone-700"
            >
              <option value="all">All Fulfillment</option>
              <option value="pending">Pending Fulfillment ({counts.pending_fulfillment})</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, slug, activation code, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
          />
        </div>

        {/* Memorials List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="animate-pulse text-stone-500">Loading memorials...</div>
          </div>
        ) : memorials.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">No memorials found</h3>
            <p className="text-stone-500">No memorials match your current filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Memorial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Activation Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Fulfillment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {memorials.map((memorial) => (
                    <tr key={memorial.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{getDeceasedTypeEmoji(memorial.deceased_type)}</span>
                          <div>
                            <div className="font-medium text-stone-900">{memorial.deceased_name}</div>
                            <div className="text-sm text-stone-500">/{memorial.memorial_slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-stone-100 px-2 py-1 rounded">
                          {memorial.activation_code || '-'}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {memorial.customer ? (
                          <div>
                            <div className="text-sm text-stone-900">{memorial.customer.full_name}</div>
                            <div className="text-xs text-stone-500">{memorial.customer.email}</div>
                          </div>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          memorial.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {memorial.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          FULFILLMENT_STYLES[memorial.fulfillment_status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {FULFILLMENT_LABELS[memorial.fulfillment_status] || memorial.fulfillment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                        {memorial.view_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                        {formatDate(memorial.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/tools?tab=memorial&slug=${memorial.memorial_slug}`}
                            className="text-amber-700 hover:text-amber-900 font-medium"
                          >
                            View →
                          </Link>
                          {memorial.is_published && (
                            <a
                              href={`/memorial/${memorial.memorial_slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-500 hover:text-stone-700 text-xs"
                              title="Open public memorial page"
                            >
                              ↗
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
