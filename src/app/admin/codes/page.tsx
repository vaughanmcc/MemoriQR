'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Card variant options with readable labels
const CARD_VARIANTS = [
  { code: '5N', label: '5-Year NFC Only', duration: 5, product: 'nfc_only', price: 89 },
  { code: '5Q', label: '5-Year QR Only', duration: 5, product: 'qr_only', price: 79 },
  { code: '5B', label: '5-Year Both', duration: 5, product: 'both', price: 129 },
  { code: '10N', label: '10-Year NFC Only', duration: 10, product: 'nfc_only', price: 149 },
  { code: '10Q', label: '10-Year QR Only', duration: 10, product: 'qr_only', price: 129 },
  { code: '10B', label: '10-Year Both', duration: 10, product: 'both', price: 199 },
  { code: '25N', label: '25-Year NFC Only', duration: 25, product: 'nfc_only', price: 249 },
  { code: '25Q', label: '25-Year QR Only', duration: 25, product: 'qr_only', price: 199 },
  { code: '25B', label: '25-Year Both', duration: 25, product: 'both', price: 299 },
];

interface GeneratedCode {
  code: string;
  variant: string;
}

interface RecentBatch {
  id: string;
  variant: string;
  quantity: number;
  createdAt: string;
  codes: string[];
}

export default function AdminCodesPage() {
  const [selectedVariant, setSelectedVariant] = useState(CARD_VARIANTS[0].code);
  const [quantity, setQuantity] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([]);
  const [recentBatches, setRecentBatches] = useState<RecentBatch[]>([]);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const res = await fetch('/api/admin/session');
    if (!res.ok) {
      router.push('/admin');
    }
  };

  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 100) {
      setError('Quantity must be between 1 and 100');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedCodes([]);

    try {
      const res = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant: selectedVariant,
          quantity,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate codes');
      }

      const data = await res.json();
      setGeneratedCodes(data.codes.map((code: string) => ({ code, variant: selectedVariant })));
      
      // Add to recent batches
      setRecentBatches(prev => [{
        id: crypto.randomUUID(),
        variant: selectedVariant,
        quantity: data.codes.length,
        createdAt: new Date().toISOString(),
        codes: data.codes
      }, ...prev.slice(0, 4)]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (codes: GeneratedCode[] | string[]) => {
    const codeList = codes.map(c => typeof c === 'string' ? c : c.code).join('\n');
    navigator.clipboard.writeText(codeList);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadCSV = (codes: GeneratedCode[] | string[], variant?: string) => {
    const variantInfo = CARD_VARIANTS.find(v => v.code === (variant || selectedVariant));
    const csvContent = [
      ['Activation Code', 'Variant', 'Duration (Years)', 'Product Type', 'Retail Price'],
      ...codes.map(c => {
        const code = typeof c === 'string' ? c : c.code;
        return [
          code,
          variantInfo?.code || '',
          variantInfo?.duration || '',
          variantInfo?.product || '',
          `$${variantInfo?.price || ''}`,
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoriqr-codes-${variant || selectedVariant}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  const selectedVariantInfo = CARD_VARIANTS.find(v => v.code === selectedVariant);

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
              <Link href="/admin/codes" className="text-white/90 hover:text-white px-3 py-1 rounded bg-white/10">
                Generate Codes
              </Link>
              <Link href="/admin/partners" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
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
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Retail Activation Code Generator</h2>
          <span className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
            Scratch Cards
          </span>
        </div>

        {/* Generator Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-semibold text-stone-800 mb-4">Generate New Codes</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Variant Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">
                Card Variant
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {CARD_VARIANTS.map(variant => (
                  <option key={variant.code} value={variant.code}>
                    {variant.label} (${variant.price})
                  </option>
                ))}
              </select>
              <p className="text-sm text-stone-500 mt-1">
                Code format: MQR-{selectedVariant}-XXXXXX
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">
                Quantity (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              <p className="text-sm text-stone-500 mt-1">
                Max 100 codes per batch
              </p>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  `Generate ${quantity} Codes`
                )}
              </button>
            </div>
          </div>

          {/* Selected Variant Summary */}
          {selectedVariantInfo && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-purple-600 font-medium">Duration:</span>{' '}
                  <span className="text-stone-700">{selectedVariantInfo.duration} years</span>
                </div>
                <div>
                  <span className="text-purple-600 font-medium">Product:</span>{' '}
                  <span className="text-stone-700">
                    {selectedVariantInfo.product === 'nfc_only' ? 'NFC Tag Only' : 
                     selectedVariantInfo.product === 'qr_only' ? 'QR Plate Only' : 'QR Plate + NFC Tag'}
                  </span>
                </div>
                <div>
                  <span className="text-purple-600 font-medium">Retail Price:</span>{' '}
                  <span className="text-stone-700">${selectedVariantInfo.price} NZD</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Generated Codes Display */}
        {generatedCodes.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">
                Generated Codes ({generatedCodes.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generatedCodes)}
                  className="bg-stone-100 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-200 transition-colors text-sm"
                >
                  {copySuccess ? '✓ Copied!' : 'Copy All'}
                </button>
                <button
                  onClick={() => downloadCSV(generatedCodes)}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  Download CSV
                </button>
              </div>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-4 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {generatedCodes.map((item, index) => (
                  <code
                    key={index}
                    className="bg-white px-3 py-2 rounded border border-stone-200 text-sm font-mono text-stone-700 text-center"
                  >
                    {item.code}
                  </code>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                ✓ <strong>{generatedCodes.length}</strong> codes generated successfully and saved to the database. 
                These codes are ready to print on scratch cards.
              </p>
            </div>
          </div>
        )}

        {/* Recent Batches */}
        {recentBatches.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Recent Batches (This Session)</h3>
            <div className="space-y-3">
              {recentBatches.map(batch => (
                <div key={batch.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                  <div>
                    <span className="font-mono text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {batch.variant}
                    </span>
                    <span className="text-stone-600 ml-3">
                      {batch.quantity} codes
                    </span>
                    <span className="text-stone-400 ml-3 text-sm">
                      {new Date(batch.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(batch.codes)}
                      className="text-stone-500 hover:text-stone-700 text-sm"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => downloadCSV(batch.codes.map(c => ({ code: c, variant: batch.variant })), batch.variant)}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-stone-50 rounded-xl p-6">
          <h3 className="font-semibold text-stone-800 mb-3">Code Format Reference</h3>
          <p className="text-stone-600 text-sm mb-4">
            All codes follow the format: <code className="bg-white px-2 py-1 rounded border">MQR-[VARIANT]-[RANDOM]</code>
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-stone-700 mb-2">5-Year Cards</h4>
              <ul className="space-y-1 text-stone-600">
                <li><code className="bg-white px-1 rounded">5N</code> = NFC Only ($89)</li>
                <li><code className="bg-white px-1 rounded">5Q</code> = QR Only ($79)</li>
                <li><code className="bg-white px-1 rounded">5B</code> = Both ($129)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-stone-700 mb-2">10-Year Cards</h4>
              <ul className="space-y-1 text-stone-600">
                <li><code className="bg-white px-1 rounded">10N</code> = NFC Only ($149)</li>
                <li><code className="bg-white px-1 rounded">10Q</code> = QR Only ($129)</li>
                <li><code className="bg-white px-1 rounded">10B</code> = Both ($199)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-stone-700 mb-2">25-Year Cards</h4>
              <ul className="space-y-1 text-stone-600">
                <li><code className="bg-white px-1 rounded">25N</code> = NFC Only ($249)</li>
                <li><code className="bg-white px-1 rounded">25Q</code> = QR Only ($199)</li>
                <li><code className="bg-white px-1 rounded">25B</code> = Both ($299)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
