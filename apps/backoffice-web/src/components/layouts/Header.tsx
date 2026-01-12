'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Menu, Bell, Search } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { actorType, actorId } = useAuth();

  return (
    <header style={{
      height: '80px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      borderBottom: '1px solid #f1f5f9',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button 
          onClick={onToggleSidebar} 
          style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <Menu size={20} />
        </button>

        {/* Global Search Simulation */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
           <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
           <input 
            placeholder="Quick Search..." 
            style={{ 
                padding: '10px 10px 10px 40px', 
                borderRadius: '12px', 
                border: '1px solid #f1f5f9', 
                backgroundColor: '#f8fafc',
                fontSize: '14px',
                width: '240px',
                outline: 'none'
            }} 
           />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', position: 'relative' }}>
            <Bell size={22} />
            <div style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '24px', borderLeft: '1px solid #f1f5f9' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}>
                {actorType?.replace('_', ' ').toLowerCase()}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                {actorId?.slice(0, 8)}...
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 700,
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              {actorType?.[0] || 'U'}
            </div>
            {/* Online Status Dot */}
            <div style={{ 
                position: 'absolute', 
                bottom: -2, 
                right: -2, 
                width: 14, 
                height: 14, 
                background: '#22c55e', 
                borderRadius: '50%', 
                border: '3px solid white' 
            }} />
          </div>
        </div>
      </div>
    </header>
  );
}