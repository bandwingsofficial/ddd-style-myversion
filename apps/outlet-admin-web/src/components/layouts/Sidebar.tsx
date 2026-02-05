'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Store,
  Package,
  ShoppingBag,
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
    label: 'Products',
    href: '/products',
    icon: <Package size={20} />,
  },
  {
    label: 'Users Details',
    href: '/users',
    icon: <Users size={20} />,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: <ShoppingBag size={20} />,
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  // State to manage hover if needed, though simpler CSS hover is tricky with inline styles.
  // We will rely on base styles here.

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
              {/* Active Bar indicator (simulated with border-left in styles) */}
              <span style={isActive ? { ...styles.icon, color: '#4ade80' } : styles.icon}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div style={styles.footer}>
        <button style={styles.logoutButton}>
          <LogOut size={20} />
          <span>LOGOUT</span>
        </button>
      </div>
    </aside>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: '270px',
    backgroundColor: '#012e22', // Deep dark green background
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    fontFamily: '"Inter", sans-serif', // Assuming a clean sans-serif
    boxShadow: '4px 0 24px rgba(0,0,0,0.2)', // Subtle shadow for depth
    zIndex: 50,
  },
  brand: {
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.3))', // Slight glow on logo
  },
  nav: {
    flex: 1,
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px', // Increased gap for airy feel
  },
  link: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    borderRadius: '12px', // Softer rounded corners
    color: '#89a8a0', // Muted green-grey for inactive
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    gap: '14px',
    borderLeft: '4px solid transparent', // Placeholder for alignment
  },
  activeLink: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Very subtle fill
    background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0) 100%)', // Gradient fade
    color: '#ffffff',
    borderLeft: '4px solid #4ade80', // The bright neon green bar
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Subtle lift
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.3s ease',
  },
  footer: {
    padding: '24px',
    marginTop: 'auto',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Center content like in design
    gap: '10px',
    width: '100%',
    padding: '14px',
    backgroundColor: 'transparent',
    border: '1px solid #451a1a', // Dark red border
    borderRadius: '12px',
    color: '#ef4444', // Red text
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
  },
};