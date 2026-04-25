'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/Avatar';

const tabs = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/travels', label: 'Travels' },
  { href: '/admin/reservations', label: 'Reservations' },
  { href: '/admin/feedback', label: 'Feedback' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'ADMIN') router.replace('/');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0a1.724 1.724 0 00-1.066-2.573c-.94-1.543-.826-3.31-1.538-1.118l-3.976-2.888c-.784-.57-1.838-.197-1.538 1.118l1.518 4.674c.3.922.755 1.688-1.538 1.118l3.976-2.888c.784.57 1.838.197 1.538-1.118z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Admin Panel
              </h1>
              <p className="text-blue-100 text-sm md:text-base">Manage your travel agency operations</p>
            </div>
            <div className="flex items-center space-x-3">
              <Avatar user={user} size="md" />
              <div className="text-right">
                <p className="text-white text-sm">{user.firstName} {user.lastName}</p>
                <p className="text-blue-200 text-xs">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((t) => {
              const active = path === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    active
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
