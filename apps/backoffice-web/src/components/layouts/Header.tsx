'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout'; 
import { useRouter } from 'next/navigation'; // Added for navigation
import { 
  Menu, Bell, Search, CalendarDays, 
  ChevronDown, LogOut, User, Settings as SettingsIcon,
  // Imported icons for the search results
  LayoutDashboard, Store, Users, Boxes, Package, Layers, Warehouse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the searchable items (Same as Sidebar)
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
  const { actorType } = useAuth(); // Removed actorId if not used to save space
  const { logout } = useLogout();
  const router = useRouter(); // Hook for navigation
  
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
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    setDateString(formatted);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Close search results if clicking outside
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Search Input
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

  // Handle Navigation
  const handleNavigate = (path: string) => {
    router.push(path);
    setIsSearchFocused(false);
    setSearchQuery(''); // Optional: Clear search after navigation
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
      style={{
        height: '80px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* LEFT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <Menu size={20} />
        </motion.button>

        {/* SEARCH BAR SECTION */}
        <div 
            ref={searchContainerRef}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
        >
          <Search 
            size={18} 
            color={isSearchFocused ? '#10b981' : '#94a3b8'} 
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none', transition: 'color 0.3s' }} 
          />
          <input
            placeholder="Quick Search..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsSearchFocused(true)}
            // Note: We handle blur via click outside ref, otherwise clicking the result triggers blur first
            style={{
              padding: '10px 10px 10px 40px',
              borderRadius: '12px',
              border: `1px solid ${isSearchFocused ? '#10b981' : '#f1f5f9'}`,
              backgroundColor: isSearchFocused ? '#ffffff' : '#f8fafc',
              fontSize: '14px',
              width: isSearchFocused ? '270px' : '240px',
              outline: 'none',
              transition: 'all 0.3s ease',
              color: '#334155'
            }}
          />
          
          <div style={{ 
            position: 'absolute', right: '12px', opacity: isSearchFocused ? 0 : 0.5, 
            fontSize: '12px', pointerEvents: 'none', transition: 'opacity 0.2s' 
          }}>
            ⌘K
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          <AnimatePresence>
            {isSearchFocused && searchQuery && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                        position: 'absolute',
                        top: '50px',
                        left: 0,
                        width: '300px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #f1f5f9',
                        overflow: 'hidden',
                        zIndex: 50
                    }}
                >
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.path}
                                    onClick={() => handleNavigate(item.path)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom: index !== filteredItems.length - 1 ? '1px solid #f8fafc' : 'none',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <div style={{ 
                                        padding: '6px', borderRadius: '8px', 
                                        backgroundColor: '#ecfdf5', color: '#10b981' 
                                    }}>
                                        <Icon size={16} />
                                    </div>
                                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                            No results found.
                        </div>
                    )}
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {dateString && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '10px', 
            padding: '8px 16px', 
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #bbf7d0', 
            borderRadius: '12px', 
            color: '#166534', 
            fontSize: '13px', 
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <CalendarDays size={16} color="#15803d" />
            <span>{dateString}</span>
          </div>
        )}

        <motion.button 
          whileHover={{ rotate: 15 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#94a3b8' }}
        >
          <Bell size={22} />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px' }}>
            <span style={{ 
              position: 'absolute', width: '100%', height: '100%', 
              borderRadius: '50%', background: '#f87171', opacity: 0.75, 
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' 
            }}></span>
            <span style={{ 
              position: 'relative', display: 'block', width: '10px', height: '10px', 
              borderRadius: '50%', background: '#ef4444', border: '2px solid white' 
            }}></span>
          </span>
        </motion.button>

        <div style={{ height: '32px', width: '1px', background: '#e2e8f0' }} />

        {/* DROPDOWN USER PROFILE */}
        <div 
          ref={dropdownRef}
          style={{ position: 'relative' }}
        >
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                Super Admin
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold', fontSize: '18px',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                }}
              >
                S
              </motion.div>
              <div style={{ 
                position: 'absolute', bottom: -2, right: -2, width: '14px', height: '14px', 
                background: '#22c55e', borderRadius: '50%', border: '2px solid white' 
              }} />
            </div>
            
            <ChevronDown size={16} color="#94a3b8" />
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '60px',
                  right: 0,
                  width: '220px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                  border: '1px solid #f1f5f9',
                  padding: '8px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                   <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Signed in as</p>
                   <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Super Admin</p>
                </div>

                <div 
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px', color: '#475569', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </div>

                <div 
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px', color: '#475569', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <SettingsIcon size={16} />
                  <span>Settings</span>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                <div 
                  onClick={logout}
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px', color: '#ef4444', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}