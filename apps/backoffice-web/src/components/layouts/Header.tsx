'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout'; 
import { useRouter } from 'next/navigation';
import { 
  Menu, Bell, Search, CalendarDays, 
  ChevronDown, LogOut, User, Settings as SettingsIcon,
  LayoutDashboard, Store, Users, Boxes, Package, Layers, Warehouse, Command,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Import your API and types
import { SuperAdminApi } from '../../features/super-admin/api/use-profile';
import { ProfileData } from '../../features/super-admin/types';

/**
 * HELPER: Construct the full image URL.
 * Updated to port 4000 based on your browser console logs.
 */
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  
  // MATCH THIS TO YOUR BACKEND LOGS: https://api.dev.local:4000
  const API_URL = "https://api.dev.local:4000"; 
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(SEARCH_ITEMS);
  
  const [dateString, setDateString] = useState('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Memoized fetch function so it can be used in the event listener safely
  const fetchProfile = useCallback(async () => {
    try {
      const data = await SuperAdminApi.getProfile();
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to load header profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  // Initial Fetch + Event Listener for real-time updates
  useEffect(() => {
    fetchProfile();

    // Listen for custom event 'profile-updated' from the ProfileForm
    window.addEventListener('profile-updated', fetchProfile);
    
    return () => {
      window.removeEventListener('profile-updated', fetchProfile);
    };
  }, [fetchProfile]);

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
    setIsDropdownOpen(false); 
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredItems.length > 0) {
      handleNavigate(filteredItems[0].path);
    }
  };

  const userInitial = profile?.fullName?.charAt(0).toUpperCase() || "A";

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-emerald-500/10 bg-white/70 px-10 backdrop-blur-xl shadow-sm"
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-white text-emerald-600 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-500/40"
        >
          <Menu size={20} />
        </motion.button>

        {/* SEARCH BAR */}
        <div ref={searchContainerRef} className="relative hidden md:block">
          <div className="relative flex items-center">
            <Search 
              size={18} 
              className={`absolute left-4 transition-colors duration-300 ${isSearchFocused ? 'text-emerald-500' : 'text-gray-400'}`}
            />
            <input
              placeholder="Quick Search..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsSearchFocused(true)}
              className={`
                h-11 w-64 rounded-2xl border bg-gray-50/50 py-2 pl-12 pr-12 text-sm text-gray-700 outline-none transition-all duration-300
                placeholder:text-gray-400
                ${isSearchFocused 
                  ? 'w-75 border-emerald-400/50 bg-white ring-8 ring-emerald-500/5 shadow-lg shadow-emerald-500/5' 
                  : 'border-emerald-500/10 hover:border-emerald-500/20'}
              `}
            />
            <div className={`absolute right-4 flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-400 transition-opacity duration-300 ${isSearchFocused ? 'opacity-0' : 'opacity-100'}`}>
              <Command size={10} /> K
            </div>
          </div>

          <AnimatePresence>
            {isSearchFocused && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute left-0 top-full mt-3 w-full min-w-[320px] overflow-hidden rounded-2xl border border-emerald-500/10 bg-white p-2 shadow-2xl shadow-emerald-900/10"
              >
                {filteredItems.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          className="flex items-center gap-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-emerald-50 hover:text-emerald-700 group"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Icon size={16} />
                          </div>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No results for <span className="font-bold text-gray-600">"{searchQuery}"</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-5">
        {dateString && (
          <div className="hidden lg:flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-600 border border-emerald-500/10 shadow-sm shadow-emerald-500/5">
            <CalendarDays size={16} />
            <span className="tracking-tight">{dateString}</span>
          </div>
        )}

        {/* Notifications */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50/50 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
          </span>
        </motion.button>

        <div className="h-8 w-px bg-gray-100" />

        {/* USER DROPDOWN */}
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group flex items-center gap-3 outline-none"
          >
            <div className="hidden text-right md:block">
              {isProfileLoading ? (
                <div className="h-4 w-20 animate-pulse bg-gray-200 rounded mb-1" />
              ) : (
                <div className="text-sm font-black text-gray-800 leading-tight">
                  {profile?.fullName || 'Super Admin'}
                </div>
              )}
              <div className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">
                {actorType || 'SUPER ADMIN'}
              </div>
            </div>

            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#10a353] text-lg font-black text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:rotate-3"
              >
                {profile?.avatarUrl ? (
                  <img 
                    key={profile.avatarUrl}
                    src={getImageUrl(profile.avatarUrl)!} 
                    alt="Avatar" 
                    className="h-full w-full object-cover" 
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  userInitial
                )}
              </motion.div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
            </div>
            
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                // REDUCED BORDER RADIUS: from rounded-[2rem] to rounded-2xl
                className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-emerald-500/10 bg-white p-2 shadow-2xl shadow-emerald-900/10"
              >
                <div className="px-5 py-3 border-b border-gray-50 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account</p>
                  <p className="text-sm font-black text-gray-800 truncate mt-0.5">
                    {profile?.title || 'Administrator'}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <button 
                    onClick={() => handleNavigate('/profile')}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <User size={16} /> My Profile
                  </button>
                  <div className="mx-4 my-1.5 h-px bg-gray-50" />

                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-black text-red-500 transition-all hover:bg-red-50"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}