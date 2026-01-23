'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout'; 
import { useRouter } from 'next/navigation';
import { 
  Menu, Bell, Search, CalendarDays, 
  ChevronDown, LogOut, User, Settings as SettingsIcon,
  LayoutDashboard, Store, Users, Boxes, Package, Layers, Warehouse, Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the searchable items
const SEARCH_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Outlets', path: '/outlets', icon: Store },
  { label: 'Outlet Management', path: '/users', icon: Users },
  { label: 'Stock Items', path: '/stock-items', icon: Boxes },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: Layers },
  { label: 'Central Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { actorType } = useAuth();
  const { logout } = useLogout();
  const router = useRouter();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(SEARCH_ITEMS);
  
  const [dateString, setDateString] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    setDateString(formatted);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredItems(SEARCH_ITEMS);
    } else {
      const filtered = SEARCH_ITEMS.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredItems.length > 0) {
      handleNavigate(filteredItems[0].path);
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md"
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-6">
        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Menu size={20} />
        </motion.button>

        {/* SEARCH BAR */}
        <div ref={searchContainerRef} className="relative hidden md:block">
          <div className="relative flex items-center">
            <Search 
              size={18} 
              className={`absolute left-3.5 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <input
              placeholder="Quick Search..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              className={`
                h-11 w-64 rounded-xl border bg-muted/50 py-2 pl-10 pr-12 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground
                focus:w-80 focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10
                ${isSearchFocused ? 'border-primary/50 bg-background' : 'border-transparent'}
              `}
            />
            <div className={`absolute right-3 flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground transition-opacity ${isSearchFocused ? 'opacity-0' : 'opacity-100'}`}>
              <Command size={10} /> K
            </div>
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          <AnimatePresence>
            {isSearchFocused && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 top-full mt-2 w-full min-w-[320px] overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl"
              >
                {filteredItems.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {filteredItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Icon size={16} />
                          </div>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-6">
        
        {/* Date Display */}
        {dateString && (
          <div className="hidden lg:flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2 text-xs font-bold text-primary border border-primary/10">
            <CalendarDays size={16} />
            <span>{dateString}</span>
          </div>
        )}

        {/* Notifications */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell size={22} />
          <span className="absolute right-0 top-0 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background"></span>
          </span>
        </motion.button>

        <div className="h-8 w-px bg-border" />

        {/* USER DROPDOWN */}
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 outline-none"
          >
            <div className="hidden text-right md:block">
              <div className="text-sm font-bold text-foreground">Super Admin</div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{actorType || 'ADMIN'}</div>
            </div>

            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-lg font-bold text-white shadow-lg shadow-primary/20"
              >
                S
              </motion.div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-green-500" />
            </div>
            
            <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl"
              >
                <div className="px-3 py-2.5 border-b border-border mb-1">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-bold text-foreground truncate">admin@example.com</p>
                </div>

                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <User size={16} /> My Profile
                </button>

                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <SettingsIcon size={16} /> Settings
                </button>

                <div className="my-1 h-px bg-border" />

                <button 
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}