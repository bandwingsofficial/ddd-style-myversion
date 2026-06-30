'use client';

import { useLogout } from '@/features/auth/hooks/useLogout';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Store, Users, Boxes, LogOut,
  Warehouse, Package, Layers
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Outlets', path: '/outlets', icon: Store },
  { label: 'Outlet Management', path: '/users', icon: Users },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Central Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Stock Items', path: '/stock-items', icon: Boxes },
  { label: 'Categories', path: '/categories', icon: Layers },
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
      // UPDATED: Deeper gradient and darker base to match Cane Tender image
      className="sticky top-0 z-50 flex h-screen flex-col overflow-hidden bg-[#042d1a] text-white shadow-[10px_0_30px_rgba(0,0,0,0.5)] border-r border-emerald-500/10"
    >
      
      {/* --- LOGO SECTION --- */}
      <div className="flex h-[140px] shrink-0 items-center justify-center py-6 relative z-20">
        <motion.div
          animate={{ 
            width: isOpen ? 180 : 60, 
            height: isOpen ? 100 : 60 
          }}
          transition={{ duration: 0.2 }}
          className="relative flex items-center justify-center p-2"
        >
          {/* Logo with specific gold/green drop shadow glow */}
          <img 
            src="/canten1.png"
            alt="Logo"
            className="h-full w-full object-contain object-center drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          />
        </motion.div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col gap-3">
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
                  group relative flex cursor-pointer items-center rounded-xl px-4 py-3.5 transition-all duration-300 outline-none
                  ${isActive ? 'text-white' : 'text-emerald-100/50 hover:text-white'}
                `}
              >
                {/* Active Background Indicator - MATCHES CANE TENDER GLOW */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Glow bar indicator on the far left */}
                {isActive && (
                  <motion.div 
                    layoutId="active-bar"
                    className="absolute left-0 w-1 h-6 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
                  />
                )}

                {/* Icon & Label Container */}
                <div className="relative z-10 flex items-center gap-4 overflow-hidden w-full">
                  <Icon 
                    size={22} 
                    className={`shrink-0 transition-all duration-300 ${isActive ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-emerald-100/60 group-hover:text-emerald-300'}`} 
                  />
                  
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`text-[15px] whitespace-nowrap tracking-wide ${isActive ? 'font-bold text-emerald-50' : 'font-medium'}`}
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
      <div className="shrink-0 p-6 z-20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          // UPDATED: Logout styled with the same glow/border logic but in red
          className={`
            flex w-full items-center rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-red-400/80
            transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]
            ${isOpen ? 'justify-start gap-3 px-5' : 'justify-center'}
          `}
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-[14px] uppercase tracking-widest whitespace-nowrap overflow-hidden"
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