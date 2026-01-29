'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminMemorialsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-stone-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://memoriqr.co.nz" target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-amber-200 hover:text-amber-100">MemoriQR</a>
            <span className="text-white/50 mx-2">|</span>
            <span className="text-lg font-semibold">Admin</span>
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
              <Link href="/admin/memorials" className="text-white/90 hover:text-white px-3 py-1 rounded bg-white/10">
                Memorials
              </Link>
              <Link href="/admin/tools" className="text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10">
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Memorials</h2>
          <Link 
            href="/admin/dashboard" 
            className="text-stone-500 hover:text-stone-700 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-6xl mb-4">🕊️</div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Memorial Management Coming Soon</h3>
          <p className="text-stone-500 max-w-md mx-auto">
            This page will allow you to view all memorials, check their status, view analytics, and manage content moderation.
          </p>
          <div className="mt-8">
            <Link 
              href="/admin/dashboard" 
              className="inline-block bg-stone-800 text-white px-6 py-3 rounded-lg hover:bg-stone-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
