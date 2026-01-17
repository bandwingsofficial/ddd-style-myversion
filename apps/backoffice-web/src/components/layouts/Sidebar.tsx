'use client';

import { useLogout } from '@/features/auth/hooks/useLogout';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Users,
  Boxes,
  Settings,
  LogOut,
   Warehouse,
   Package,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Outlets', path: '/outlets', icon: Store },
  { label: 'Users', path: '/users', icon: Users }, // alias route
  { label: 'Stock Items', path: '/stock-items', icon: Boxes },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Central Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const { logout } = useLogout();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? '280px' : '90px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}
    >
      {/* LOGO */}
      <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: 42,
            height: 42,
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Store size={22} color="white" />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}
            >
              ADMIN.IO
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* NAVIGATION */}
      <nav style={{ flex: 1, padding: '0 16px' }}>
        {menuItems.map((item) => {
          const active =
            item.label === 'Outlets'
              ? pathname === '/outlets'
              : item.label === 'Users'
              ? pathname.startsWith('/outlets/') // only outlet detail pages
              : item.path === '/'
              ? pathname === '/'
              : pathname.startsWith(item.path);

          const Icon = item.icon;

          return (
            <div
              key={item.label}
              onClick={() => router.push(item.path)}
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '10px',
                transition: 'all 0.2s ease',
                backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: active ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}
              onMouseEnter={(e) =>
                !active && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')
              }
              onMouseLeave={(e) =>
                !active && (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <Icon size={22} color={active ? '#6ee7b7' : '#9ca3af'} />

              {isOpen && (
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#ffffff' : '#d1d5db',
                  }}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div style={{ padding: '24px' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            color: '#f87171',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'flex-start' : 'center',
            gap: '12px',
            transition: 'all 0.2s ease',
          }}
        >
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
