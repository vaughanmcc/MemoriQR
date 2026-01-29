'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Partner {
  id: string;
  business_name?: string;
  partner_name?: string;
  is_active: boolean;
  default_discount_percent?: number;
  default_commission_percent?: number;
  default_free_shipping?: boolean;
}

interface ReferralBatch {
  id: string;
  name: string;
  partnerId: string;
  partnerName: string;
  discountPercent: number;
  commissionPercent: number;
  freeShipping: boolean;
  totalCodes: number;
  usedCodes: number;
  createdAt: string;
}

interface ReferralCode {
  id: string;
  code: string;
  partner_id: string;
  partner_name?: string;
  discount_percent: number;
  commission_percent: number;
  free_shipping: boolean;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  batch_id: string | null;
  batch_name: string | null;
}

export default function AdminReferralsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'generate' | 'batches'>('generate');
  
  // Generate tab state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [quantity, setQuantity] = useState(25);
  const [batchName, setBatchName] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [commissionPercent, setCommissionPercent] = useState(15);
  const [freeShipping, setFreeShipping] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(365);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Batches tab state
  const [batches, setBatches] = useState<ReferralBatch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [expandedBatchCodes, setExpandedBatchCodes] = useState<ReferralCode[]>([]);
  const [isLoadingBatchCodes, setIsLoadingBatchCodes] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchPartners();
  }, []);

  useEffect(() => {
    if (activeTab === 'batches') {
      fetchBatches();
    }
  }, [activeTab]);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/session');
    if (!res.ok) {
      router.push('/admin');
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/admin/partners?status=active');
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
        if (data.partners?.length > 0) {
          const firstPartner = data.partners[0];
          setSelectedPartnerId(firstPartner.id);
          // Set defaults from partner
          if (firstPartner.default_discount_percent) {
            setDiscountPercent(firstPartner.default_discount_percent);
          }
          if (firstPartner.default_commission_percent) {
            setCommissionPercent(firstPartner.default_commission_percent);
          }
          if (firstPartner.default_free_shipping !== undefined) {
            setFreeShipping(firstPartner.default_free_shipping);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    }
  };

  const fetchBatches = async () => {
    setIsLoadingBatches(true);
    try {
      const res = await fetch('/api/admin/referrals/generate');
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const handlePartnerChange = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      if (partner.default_discount_percent !== undefined) {
        setDiscountPercent(partner.default_discount_percent);
      }
      if (partner.default_commission_percent !== undefined) {
        setCommissionPercent(partner.default_commission_percent);
      }
      if (partner.default_free_shipping !== undefined) {
        setFreeShipping(partner.default_free_shipping);
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedPartnerId) {
      setError('Please select a partner');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedCodes([]);

    try {
      const res = await fetch('/api/admin/referrals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
          quantity,
          batchName: batchName || undefined,
          discountPercent,
          commissionPercent,
          freeShipping,
          expiresInDays: expiresInDays > 0 ? expiresInDays : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate codes');
      }

      setGeneratedCodes(data.codes || []);
      setBatchName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = generatedCodes.join('\n');
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadCSV = () => {
    const partner = partners.find(p => p.id === selectedPartnerId);
    const csv = [
      'Referral Code,Order Link,Discount,Commission,Free Shipping',
      ...generatedCodes.map(code => 
        `${code},${window.location.origin}/order?ref=${code},${discountPercent}%,${commissionPercent}%,${freeShipping ? 'Yes' : 'No'}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-codes-${partner?.business_name || partner?.partner_name || 'batch'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const expandBatch = async (batchId: string) => {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null);
      setExpandedBatchCodes([]);
      return;
    }

    setExpandedBatchId(batchId);
    setIsLoadingBatchCodes(true);

    try {
      const res = await fetch(`/api/admin/referrals/batch/${batchId}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedBatchCodes(data.codes || []);
      }
    } catch (err) {
      console.error('Failed to fetch batch codes:', err);
    } finally {
      setIsLoadingBatchCodes(false);
    }
  };

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
              <Link href="/admin/dashboard" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Dashboard
              </Link>
              <Link href="/admin/codes" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Activation Codes
              </Link>
              <Link href="/admin/referrals" className="text-white/90 hover:text-white px-3 py-1 rounded bg-white/10">
                Referral Codes
              </Link>
              <Link href="/admin/partners" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Partners
              </Link>
              <Link href="/admin/orders" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
                Orders
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Referral Codes</h2>
        <p className="text-stone-600 mb-8">Generate referral codes for partners</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Generate Codes
          </button>
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'batches'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            Manage Batches
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generation Form */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-stone-800 mb-4">Generate Referral Codes</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Partner Selection */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Partner *</label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => handlePartnerChange(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select a partner...</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.business_name || partner.partner_name || 'Unnamed Partner'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Batch Name (Optional)</label>
                  <input
                    type="text"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g. January 2026 Cards"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={500}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Discount & Commission */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Customer Discount %</label>
                    <input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      min={0}
                      max={100}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Partner Commission %</label>
                    <input
                      type="number"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      min={0}
                      max={100}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Margin Warning */}
                {discountPercent + commissionPercent > 30 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                    ⚠️ Combined discount ({discountPercent}%) + commission ({commissionPercent}%) = {discountPercent + commissionPercent}% may impact margins.
                  </div>
                )}

                {/* Free Shipping */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="freeShipping"
                    checked={freeShipping}
                    onChange={(e) => setFreeShipping(e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  <label htmlFor="freeShipping" className="text-sm text-stone-700">Include free shipping</label>
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Expires In (Days)</label>
                  <input
                    type="number"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2"
                  />
                  <p className="text-xs text-stone-500 mt-1">Set to 0 for no expiry</p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedPartnerId}
                  className="w-full py-3 px-4 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : `Generate ${quantity} Codes`}
                </button>
              </div>
            </div>

            {/* Generated Codes */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-800">Generated Codes</h3>
                {generatedCodes.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1.5 text-sm bg-stone-100 hover:bg-stone-200 rounded-lg"
                    >
                      {copySuccess ? '✓ Copied!' : 'Copy All'}
                    </button>
                    <button
                      onClick={downloadCSV}
                      className="px-3 py-1.5 text-sm bg-stone-800 text-white hover:bg-stone-700 rounded-lg"
                    >
                      Download CSV
                    </button>
                  </div>
                )}
              </div>

              {generatedCodes.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <p>No codes generated yet</p>
                  <p className="text-sm mt-1">Use the form to generate referral codes</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {generatedCodes.map((code) => (
                      <div
                        key={code}
                        className="font-mono text-sm bg-stone-50 px-3 py-2 rounded border text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="bg-white rounded-xl shadow">
            {isLoadingBatches ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 mx-auto"></div>
              </div>
            ) : batches.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <p>No referral code batches found</p>
                <p className="text-sm mt-1">Generate codes to create a batch</p>
              </div>
            ) : (
              <div className="divide-y">
                {batches.map((batch) => (
                  <div key={batch.id} className="p-6">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => expandBatch(batch.id)}
                    >
                      <div>
                        <h4 className="font-medium text-stone-800">
                          {batch.name || `Batch ${batch.id.slice(0, 8)}`}
                        </h4>
                        <p className="text-sm text-stone-500">
                          {batch.partnerName} • Created {new Date(batch.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-semibold">{batch.totalCodes}</p>
                          <p className="text-xs text-stone-500">Total Codes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">{batch.totalCodes - batch.usedCodes}</p>
                          <p className="text-xs text-stone-500">Available</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">{batch.usedCodes}</p>
                          <p className="text-xs text-stone-500">Used</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {batch.totalCodes > 0 ? Math.round((batch.usedCodes / batch.totalCodes) * 100) : 0}%
                          </p>
                          <p className="text-xs text-stone-500">Conversion</p>
                        </div>
                        <span className="text-stone-400">
                          {expandedBatchId === batch.id ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-4 flex gap-4 text-sm">
                      <span className="bg-stone-100 px-2 py-1 rounded">
                        Discount: {batch.discountPercent}%
                      </span>
                      <span className="bg-stone-100 px-2 py-1 rounded">
                        Commission: {batch.commissionPercent}%
                      </span>
                      {batch.freeShipping && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Free Shipping
                        </span>
                      )}
                    </div>

                    {/* Expanded Codes */}
                    {expandedBatchId === batch.id && (
                      <div className="mt-4 border-t pt-4">
                        {isLoadingBatchCodes ? (
                          <div className="py-4 text-center text-stone-500">Loading codes...</div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                            {expandedBatchCodes.map((code) => (
                              <div
                                key={code.id}
                                className={`font-mono text-xs px-2 py-1.5 rounded border text-center ${
                                  code.is_used
                                    ? 'bg-stone-100 text-stone-400 line-through'
                                    : 'bg-white'
                                }`}
                              >
                                {code.code}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
