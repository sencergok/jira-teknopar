'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    redirect('/');
  }

  // Dashboard layout component with navigation and user profile dropdown menu
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                  Jira Teknopar
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Projeler
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-gray-700">{user.email}</span>
                      <button
                        onClick={signOut}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                    {user.user_metadata?.avatar_url && (
                      <Image
                        className="h-8 w-8 rounded-full"
                        src={user.user_metadata.avatar_url}
                        alt={user.email || ''}
                        width={32}
                        height={32}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}