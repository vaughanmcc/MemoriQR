'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavStats {
  pendingApplications: number;
  pendingCommissions: number;
  pendingFulfillment: number;
  pendingReferralRequests: number;
  renewalsDue: number;
}

interface AdminNavProps {
  onLogout: () => void;
}

export function AdminNav({ onLogout }: AdminNavProps) {
  const [stats, setStats] = useState<NavStats | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          pendingApplications: data.pendingApplications ?? 0,
          pendingCommissions: data.pendingCommissions ?? 0,
          pendingFulfillment: data.pendingFulfillment ?? 0,
          pendingReferralRequests: data.pendingReferralRequests ?? 0,
          renewalsDue: data.renewalsDue ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch nav stats:', err);
    }
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navLinkClass = (path: string) =>
    isActive(path)
      ? 'text-white/90 hover:text-white px-3 py-1 rounded bg-white/10 relative'
      : 'text-white/70 hover:text-white px-3 py-1 rounded hover:bg-white/10 relative';

  return (
    <header className="bg-stone-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a 
            href={process.env.NEXT_PUBLIC_BASE_URL || 'https://memoriqr.co.nz'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xl font-bold text-amber-200 hover:text-amber-100"
          >
            MemoriQR
          </a>
          <span className="text-white/50 mx-2">|</span>
          <span className="text-lg font-semibold">Admin</span>
          <nav className="hidden md:flex gap-4 ml-8">
            <Link href="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
              Dashboard
            </Link>
            <Link href="/admin/codes" className={navLinkClass('/admin/codes')}>
              Activation Codes
            </Link>
            <Link href="/admin/referrals" className={navLinkClass('/admin/referrals')}>
              Referral Codes
              {(stats?.pendingReferralRequests ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.pendingReferralRequests}
                </span>
              )}
            </Link>
            <Link href="/admin/batches" className={navLinkClass('/admin/batches')}>
              Partner Batches
            </Link>
            <Link href="/admin/partners" className={navLinkClass('/admin/partners')}>
              Partners
              {(stats?.pendingApplications ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.pendingApplications}
                </span>
              )}
            </Link>
            <Link href="/admin/commissions" className={navLinkClass('/admin/commissions')}>
              Commissions
              {(stats?.pendingCommissions ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.pendingCommissions}
                </span>
              )}
            </Link>
            <Link href="/admin/orders" className={navLinkClass('/admin/orders')}>
              Orders
              {(stats?.pendingFulfillment ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.pendingFulfillment}
                </span>
              )}
            </Link>
            <Link href="/admin/memorials" className={navLinkClass('/admin/memorials')}>
              Memorials
              {(stats?.renewalsDue ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.renewalsDue}
                </span>
              )}
            </Link>
            <Link href="/admin/tools" className={navLinkClass('/admin/tools')}>
              Tools
            </Link>
          </nav>
        </div>
        <button onClick={onLogout} className="text-white/70 hover:text-white text-sm">
          Log Out
        </button>
      </div>
    </header>
  );
}
