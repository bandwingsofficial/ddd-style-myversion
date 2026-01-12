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
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ color: '#10b981', fontWeight: 600 }}>Loading Session...</div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* PERSISTENT SIDEBAR */}
      <Sidebar isOpen={isSidebarOpen} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* PERSISTENT HEADER */}
        <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        
        {/* PAGE CONTENT */}
        <main style={{ padding: '30px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}