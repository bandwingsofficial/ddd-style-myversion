'use client';

import { useLogout } from '@/features/auth/hooks/useLogout';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Store, Users, Boxes, Settings, LogOut,
  Warehouse, Package, Layers
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Outlets', path: '/outlets', icon: Store },
  { label: 'Outlet Management', path: '/users', icon: Users },
  { label: 'Stock Items', path: '/stock-items', icon: Boxes },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: Layers },
  { label: 'Central Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const { logout } = useLogout();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? '280px' : '90px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'linear-gradient(180deg, #064e3b 0%, #022c22 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}
      >
        {/* LOGO SECTION - CENTERED & ZOOMED IN */}
        <div style={{ 
          padding: '0px 0', // Increased vertical padding
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', // Always center the logo like in the screenshot
          height: '140px', // Taller container for a bigger logo
          flexShrink: 0 
        }}>
          <motion.div
            // Animate width: Bigger when open (180px), smaller when closed (50px)
            animate={{ width: isOpen ? '180px' : '50px', height: isOpen ? '100px' : '50px' }}
            transition={{ duration: 0.2 }}
            style={{ 
              position: 'relative', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src="/4.png"
              alt="Logo"
              style={{ 
                height: '100%', 
                width: '100%', 
                objectFit: 'contain', // Keeps logo proportions correct
                objectPosition: 'center'
              }} 
            />
          </motion.div>
        </div>

        {/* NAVIGATION */}
        <nav 
          className="hide-scrollbar" 
          style={{ flex: 1, padding: '0 16px', overflowY: 'auto' }}
        >
          {menuItems.map((item) => {
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                onClick={() => router.push(item.path)}
                style={{
                  position: 'relative',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '8px',
                  transition: 'all 0.2s ease',
                  color: isActive ? 'white' : '#a7f3d0'
                }}
                onMouseEnter={(e) => {
                   if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                   if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '14px',
                      backgroundColor: 'rgba(52, 211, 153, 0.2)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      zIndex: 0
                    }}
                  />
                )}

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Icon size={22} color={isActive ? '#ffffff' : '#6ee7b7'} />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ fontSize: 15, fontWeight: isActive ? 600 : 400 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(220, 38, 38, 0.2)' }}
            onClick={logout}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#f87171',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: isOpen ? 'flex-start' : 'center', gap: '12px'
            }}
          >
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}