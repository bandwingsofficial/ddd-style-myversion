'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Store,
  Package, // New Icon for Products
} from 'lucide-react';

// Sidebar menu configuration
const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'My Outlet', 
    href: '/my-outlet',
    icon: <Store size={20} />,
  },
  {
    label: 'Products', // NEW MENU ITEM
    href: '/products',
    icon: <Package size={20} />,
  },
  {
    label: 'Users Details',
    href: '/users',
    icon: <Users size={20} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={styles.sidebar}>
      {/* Logo Area */}
      <div style={styles.brand}>
        <img src="/4.png" alt="Cane & Tender Logo" style={styles.logo} />
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              style={isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
            >
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={styles.footer}>
        <button style={styles.logoutButton}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '260px',
    backgroundColor: '#013a2b',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    fontFamily: 'sans-serif',
  },
  brand: {
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  nav: {
    flex: 1,
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#a3b6b0',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    gap: '12px',
  },
  activeLink: {
    backgroundColor: '#1b5548',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: '24px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },
};