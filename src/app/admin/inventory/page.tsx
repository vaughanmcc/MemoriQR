'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';

interface InventoryItem {
  id: string;
  product_type: string;
  variant: string | null;
  description: string | null;
  sku: string | null;
  quantity_in_stock: number;
  quantity_reserved: number;
  quantity_available: number;
  low_stock_threshold: number;
  reorder_quantity: number | null;
  unit_cost: number | null;
  currency: string;
  purchase_id: string | null;
  supplier_name: string | null;
  location: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  purchase?: {
    purchase_number: string;
    supplier_name: string;
  };
}

interface Summary {
  [key: string]: {
    total_in_stock: number;
    total_reserved: number;
    total_available: number;
    avg_unit_cost: number;
    batch_count: number;
    is_low_stock: boolean;
    low_stock_threshold: number;
  };
}

interface Movement {
  id: string;
  inventory_id: string;
  movement_type: string;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reason: string | null;
  created_at: string;
  inventory?: {
    product_type: string;
    variant: string | null;
  };
}

const PRODUCT_TYPES: Record<string, string> = {
  qr_tags: 'QR Tags',
  plates: 'QR Plates',
  frames: 'Frames',
  packaging: 'Packaging',
  other: 'Other',
};

const MOVEMENT_TYPES: Record<string, { label: string; color: string }> = {
  received: { label: 'Received', color: 'bg-green-100 text-green-800' },
  shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-800' },
  adjustment: { label: 'Adjustment', color: 'bg-yellow-100 text-yellow-800' },
  reserved: { label: 'Reserved', color: 'bg-purple-100 text-purple-800' },
  unreserved: { label: 'Unreserved', color: 'bg-gray-100 text-gray-800' },
  returned: { label: 'Returned', color: 'bg-orange-100 text-orange-800' },
  damaged: { label: 'Damaged', color: 'bg-red-100 text-red-800' },
  transferred: { label: 'Transferred', color: 'bg-indigo-100 text-indigo-800' },
};

export default function AdminInventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ totalItems: 0, lowStockCount: 0, totalValue: 0 });

  // New inventory form
  const [newItem, setNewItem] = useState({
    product_type: 'qr_tags',
    variant: '',
    description: '',
    sku: '',
    quantity_in_stock: 0,
    low_stock_threshold: 10,
    reorder_quantity: 50,
    unit_cost: '',
    currency: 'NZD',
    supplier_name: '',
    notes: '',
  });

  // Adjustment form
  const [adjustment, setAdjustment] = useState({
    quantity: 0,
    reason: '',
  });

  const fetchInventory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (productFilter !== 'all') params.set('productType', productFilter);
      if (showLowStockOnly) params.set('lowStockOnly', 'true');

      const res = await fetch(`/api/admin/inventory?${params}`);
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setInventory(data.inventory || []);
      setSummary(data.summary || {});
      setLowStockItems(data.lowStockItems || []);
      setStats(data.stats || { totalItems: 0, lowStockCount: 0, totalValue: 0 });
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [router, productFilter, showLowStockOnly]);

  const fetchMovements = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inventory/movements?limit=50');
      if (res.ok) {
        const data = await res.json();
        setMovements(data.movements || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, [fetchInventory, fetchMovements]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          unit_cost: newItem.unit_cost ? parseFloat(newItem.unit_cost) : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to add');
      await fetchInventory();
      await fetchMovements();
      setShowAddForm(false);
      setNewItem({
        product_type: 'qr_tags',
        variant: '',
        description: '',
        sku: '',
        quantity_in_stock: 0,
        low_stock_threshold: 10,
        reorder_quantity: 50,
        unit_cost: '',
        currency: 'NZD',
        supplier_name: '',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to add stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          adjustment: adjustment.quantity,
          reason: adjustment.reason,
        }),
      });
      if (!res.ok) throw new Error('Failed to adjust');
      await fetchInventory();
      await fetchMovements();
      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustment({ quantity: 0, reason: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to adjust stock');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'NZD') => {
    return new Intl.NumberFormat('en-NZ', { style: 'currency', currency }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNav onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Inventory</h1>
            <p className="text-stone-600">Track stock levels and movements</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#8B7355] text-white px-4 py-2 rounded-lg hover:bg-[#6B5745] transition-colors"
          >
            + Add Stock
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-stone-500">Total SKUs</p>
            <p className="text-2xl font-bold text-stone-800">{stats.totalItems}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-stone-500">Low Stock Items</p>
            <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.lowStockCount}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-stone-500">Total Inventory Value</p>
            <p className="text-2xl font-bold text-stone-800">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-stone-500">Product Types</p>
            <p className="text-2xl font-bold text-stone-800">{Object.keys(summary).length}</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {lowStockItems.slice(0, 5).map(item => (
                <li key={item.id}>
                  {PRODUCT_TYPES[item.product_type] || item.product_type}
                  {item.variant && ` - ${item.variant}`}: 
                  <strong className="ml-1">{item.quantity_in_stock - (item.quantity_reserved || 0)} available</strong>
                  <span className="text-red-500 ml-1">(threshold: {item.low_stock_threshold})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary by Product Type */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Stock Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-stone-500 border-b">
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-right">In Stock</th>
                  <th className="pb-3 text-right">Reserved</th>
                  <th className="pb-3 text-right">Available</th>
                  <th className="pb-3 text-right">Avg Cost</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary).map(([key, data]) => {
                  const [productType, variant] = key.split(':');
                  return (
                    <tr key={key} className="border-b border-stone-100">
                      <td className="py-3">
                        <span className="font-medium">{PRODUCT_TYPES[productType] || productType}</span>
                        {variant && <span className="text-stone-500 ml-1">({variant})</span>}
                      </td>
                      <td className="py-3 text-right">{data.total_in_stock}</td>
                      <td className="py-3 text-right text-stone-500">{data.total_reserved}</td>
                      <td className="py-3 text-right font-medium">{data.total_available}</td>
                      <td className="py-3 text-right text-stone-600">
                        {data.avg_unit_cost ? formatCurrency(data.avg_unit_cost) : '-'}
                      </td>
                      <td className="py-3 text-center">
                        {data.is_low_stock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {Object.keys(summary).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500">
                      No inventory yet. Add stock to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Products</option>
            {Object.entries(PRODUCT_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded"
            />
            Low stock only
          </label>
        </div>

        {/* Inventory Detail Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-sm text-stone-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{PRODUCT_TYPES[item.product_type] || item.product_type}</div>
                    {item.variant && <div className="text-sm text-stone-500">{item.variant}</div>}
                    {item.description && <div className="text-xs text-stone-400">{item.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-600">
                    {item.purchase?.purchase_number || item.supplier_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity_in_stock}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${
                      item.quantity_available <= item.low_stock_threshold ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.quantity_available}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-stone-600">
                    {item.unit_cost ? formatCurrency(item.unit_cost, item.currency) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-500">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowAdjustModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Recent Movements</h2>
          <div className="space-y-2">
            {movements.slice(0, 10).map(movement => (
              <div key={movement.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${MOVEMENT_TYPES[movement.movement_type]?.color || 'bg-gray-100'}`}>
                    {MOVEMENT_TYPES[movement.movement_type]?.label || movement.movement_type}
                  </span>
                  <span className="text-stone-600">
                    {movement.inventory?.product_type && (PRODUCT_TYPES[movement.inventory.product_type] || movement.inventory.product_type)}
                    {movement.inventory?.variant && ` - ${movement.inventory.variant}`}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </span>
                  <span className="text-sm text-stone-400">
                    {movement.quantity_before} → {movement.quantity_after}
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatDate(movement.created_at)}
                  </span>
                </div>
              </div>
            ))}
            {movements.length === 0 && (
              <p className="text-stone-500 text-center py-4">No movements recorded yet</p>
            )}
          </div>
        </div>

        {/* Add Stock Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-bold text-stone-800">Add Stock</h2>
              </div>
              <form onSubmit={handleAddStock} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Product Type *</label>
                    <select
                      value={newItem.product_type}
                      onChange={(e) => setNewItem({ ...newItem, product_type: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      required
                    >
                      {Object.entries(PRODUCT_TYPES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Variant</label>
                    <input
                      type="text"
                      value={newItem.variant}
                      onChange={(e) => setNewItem({ ...newItem, variant: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      placeholder="e.g., Small, Oak"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={newItem.quantity_in_stock}
                      onChange={(e) => setNewItem({ ...newItem, quantity_in_stock: parseInt(e.target.value) || 0 })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={newItem.low_stock_threshold}
                      onChange={(e) => setNewItem({ ...newItem, low_stock_threshold: parseInt(e.target.value) || 10 })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Unit Cost</label>
                    <input
                      type="number"
                      value={newItem.unit_cost}
                      onChange={(e) => setNewItem({ ...newItem, unit_cost: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newItem.supplier_name}
                    onChange={(e) => setNewItem({ ...newItem, supplier_name: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-stone-600 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-[#8B7355] text-white px-6 py-2 rounded-lg hover:bg-[#6B5745] disabled:opacity-50"
                  >
                    {actionLoading ? 'Adding...' : 'Add Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Adjust Stock Modal */}
        {showAdjustModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-bold text-stone-800">Adjust Stock</h2>
                <p className="text-stone-500">{PRODUCT_TYPES[selectedItem.product_type]} {selectedItem.variant && `- ${selectedItem.variant}`}</p>
              </div>
              <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
                <div className="bg-stone-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Current Stock:</span>
                    <span className="font-medium">{selectedItem.quantity_in_stock}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Reserved:</span>
                    <span>{selectedItem.quantity_reserved}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t border-stone-200 pt-2 mt-2">
                    <span>Available:</span>
                    <span>{selectedItem.quantity_available}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Adjustment (use negative for reduction)
                  </label>
                  <input
                    type="number"
                    value={adjustment.quantity}
                    onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    required
                  />
                  <p className="text-sm text-stone-500 mt-1">
                    New stock: {selectedItem.quantity_in_stock + adjustment.quantity}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Reason *</label>
                  <input
                    type="text"
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Stock count correction, Damaged items"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustModal(false);
                      setSelectedItem(null);
                      setAdjustment({ quantity: 0, reason: '' });
                    }}
                    className="px-4 py-2 text-stone-600 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || adjustment.quantity === 0}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Adjusting...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
