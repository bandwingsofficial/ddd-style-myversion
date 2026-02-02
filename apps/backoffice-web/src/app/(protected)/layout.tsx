'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';

export default function ProtectedLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { ready, authenticated } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      router.replace('/auth/login');
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-emerald-500 font-semibold text-lg">Loading Session...</div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    // 1. Main Wrapper: Flex row to put Sidebar next to Content
    <div className="flex min-h-screen w-full bg-slate-50 font-sans">
      
      {/* 2. Sidebar Wrapper: Prevent it from shrinking */}
      <div className="shrink-0">
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      
      {/* 3. Content Area Wrapper */}
      {/* flex-1: Fills remaining space */}
      {/* min-w-0: CRITICAL FIX. Prevents wide tables from expanding this div and breaking layout */}
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out">
        
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        {/* Page Content */}
        {/* overflow-x-hidden: Ensures scrollbars appear on the table, not the whole page */}
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}