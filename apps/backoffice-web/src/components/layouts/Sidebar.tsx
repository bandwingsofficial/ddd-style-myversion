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
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 90 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 flex h-screen flex-col overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 text-white shadow-2xl border-r border-emerald-800/50"
    >
      
      {/* --- LOGO SECTION --- */}
      <div className="flex h-[140px] shrink-0 items-center justify-center py-6 relative z-20">
        <motion.div
          animate={{ 
            width: isOpen ? 160 : 50, 
            height: isOpen ? 90 : 50 
          }}
          transition={{ duration: 0.2 }}
          className="relative flex items-center justify-center"
        >
          <img 
            src="/4.png"
            alt="Logo"
            className="h-full w-full object-contain object-center drop-shadow-lg"
          />
        </motion.div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = item.path === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.path);
            
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`
                  group relative flex cursor-pointer items-center rounded-xl px-4 py-3.5 transition-all duration-200 outline-none
                  ${isActive ? 'text-white' : 'text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white'}
                `}
              >
                {/* Active Background Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl bg-emerald-600/30 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon & Label Container */}
                <div className="relative z-10 flex items-center gap-4 overflow-hidden">
                  <Icon 
                    size={22} 
                    className={`shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-emerald-100/70 group-hover:text-emerald-300'}`} 
                  />
                  
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`text-[15px] whitespace-nowrap ${isActive ? 'font-bold tracking-wide' : 'font-medium'}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* --- LOGOUT SECTION --- */}
      <div className="shrink-0 border-t border-emerald-800/50 p-6 z-20 bg-gradient-to-t from-emerald-950 to-transparent">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className={`
            flex w-full items-center rounded-xl bg-red-500/10 p-3.5 text-red-400 
            transition-colors hover:bg-red-500/20 hover:text-red-300
            ${isOpen ? 'justify-start gap-3' : 'justify-center'}
          `}
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

    </motion.aside>
  );
}