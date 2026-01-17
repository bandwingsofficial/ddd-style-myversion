"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  User,
  MapPin,
  ChevronDown,
  LogOut,
  Settings,
  Heart,
  Search,
  Package
} from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";

export default function Header() {
  const { isAuthenticated } = useCustomerAuthStore();
  const logout = useLogout();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        .user-dropdown-container:hover .dropdown-panel {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateY(0) !important;
        }
        .nav-icon {
          transition: transform 0.2s ease, color 0.2s ease;
          cursor: pointer;
        }
        .nav-icon:hover {
          transform: translateY(-1px);
          color: #22c55e !important;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #475569;
          text-decoration: none;
          font-size: 0.875rem;
          transition: background 0.2s ease;
        }
        .dropdown-item:hover {
          background: #f8fafc;
          color: #22c55e;
        }
        .search-container:focus-within {
          border-color: #22c55e !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
      `}</style>

      <header style={{
        ...styles.headerWrapper,
        backgroundColor: scrolled ? "rgba(255, 255, 255, 0.8)" : "#ffffff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
        height: scrolled ? "64px" : "80px",
      }}>
        <div style={styles.container}>
          {/* Brand & Location */}
          <div style={styles.navGroup}>
            <Link href="/home" style={styles.brand}>
              <div style={styles.brandIconWrapper}>
                <LeafIcon size={18} />
              </div>
              <span style={styles.brandName}>Cane & Tender</span>
            </Link>

            <div style={styles.locationPicker}>
              <div style={styles.locationIcon}>
                <MapPin size={14} />
              </div>
              <div style={styles.locationText}>
                <span style={styles.locationLabel}>Deliver to</span>
                <span style={styles.locationValue}>Downtown Deli <ChevronDown size={12} /></span>
              </div>
            </div>
          </div>

          {/* Centered Search */}
          <div style={styles.searchBar} className="search-container">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search for fresh produce..."
              style={styles.searchInput}
            />
          </div>

          {/* Actions */}
          <div style={styles.actionRow}>
            <div className="nav-icon">
              <Heart size={22} color="#1e293b" />
            </div>
            
            <Link href="/cart" style={styles.cartLink} className="nav-icon">
              <div style={styles.cartWrapper}>
                <ShoppingBag size={22} color="#1e293b" />
                <span style={styles.cartBadge}>3</span>
              </div>
            </Link>

            {isAuthenticated ? (
              <div className="user-dropdown-container" style={{ position: 'relative', paddingBottom: '10px', marginTop: '10px' }}>
                <div className="nav-icon">
                  <User size={22} color="#1e293b" />
                </div>
                
                <div style={styles.dropdownPanel} className="dropdown-panel">
                  <div style={styles.dropdownHeader}>
                    <p style={styles.userName}>Alex Johnson</p>
                    <p style={styles.userEmail}>alex@example.com</p>
                  </div>
                  <hr style={styles.divider} />
                  <Link href="/profile" className="dropdown-item">
                    <User size={16} /> Profile
                  </Link>
                  <Link href="/orders" className="dropdown-item">
                    <Package size={16} /> My Orders
                  </Link>
                  <Link href="/settings" className="dropdown-item">
                    <Settings size={16} /> Settings
                  </Link>
                  <hr style={styles.divider} />
                  <button onClick={() => logout()} className="dropdown-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" style={styles.loginBtn}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

const LeafIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 21 2c-1 5-1.3 8.2-3.5 13.5A7 7 0 0 1 11 20z" />
    <path d="M11 20v-5" />
  </svg>
);

const styles: { [key: string]: React.CSSProperties } = {
  headerWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  container: {
    maxWidth: "1440px",
    margin: "0 auto",
    width: "100%",
    padding: "0 2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navGroup: { display: "flex", alignItems: "center", gap: "40px" },
  brand: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" },
  brandIconWrapper: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
  },
  brandName: { fontSize: "1.25rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.5px" },
  locationPicker: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  locationIcon: { background: "#f1f5f9", padding: "6px", borderRadius: "50%", display: "flex", color: "#64748b" },
  locationText: { display: "flex", flexDirection: "column" },
  locationLabel: { fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 600, color: "#94a3b8", lineHeight: 1 },
  locationValue: { fontSize: "0.85rem", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "2px" },
  searchBar: {
    background: "#f1f5f9",
    borderRadius: "12px",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "400px",
    height: "44px",
    border: "1px solid transparent",
    transition: "all 0.2s ease",
  },
  searchInput: { background: "transparent", border: "none", outline: "none", fontSize: "0.9rem", width: "100%", fontWeight: 400, color: "#1e293b" },
  actionRow: { display: "flex", alignItems: "center", gap: "28px" },
  cartWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#22c55e',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff'
  },
  loginBtn: {
    background: "#1e293b",
    color: "#fff",
    padding: "8px 20px",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 600,
    textDecoration: "none",
    transition: "background 0.2s"
  },
  dropdownPanel: {
    position: "absolute",
    top: "45px",
    right: 0,
    width: "220px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
    padding: "12px",
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(10px)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  dropdownHeader: { padding: "4px 12px 12px 12px" },
  userName: { margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" },
  userEmail: { margin: 0, fontSize: "0.75rem", color: "#64748b" },
  divider: { border: 0, borderTop: "1px solid #f1f5f9", margin: "8px 0" }
};