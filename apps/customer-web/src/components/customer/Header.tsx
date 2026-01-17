"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  User,
  LogOut,
  Settings,
  Heart,
  Search,
  Package,
  MapPin 
} from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import LocationSelector from "./LocationSelector";

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
        /* Smooth Dropdown Animation */
        .user-dropdown-container:hover .dropdown-panel {
          opacity: 1 !important;
          visibility: visible !important;
          transform: translateY(0) !important;
        }
        
        /* Icon Button Styles */
        .nav-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px; /* Slightly larger for better touch target */
          height: 44px;
          border-radius: 50%;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          color: #334155;
          background: transparent;
        }
        .nav-icon-btn:hover {
          background-color: #f1f5f9;
          color: #16a34a;
          transform: translateY(-1px);
        }

        /* Dropdown Item Styles */
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 8px;
          color: #475569;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.2s ease;
        }
        .dropdown-item:hover {
          background: #f0fdf4;
          color: #15803d;
        }

        /* Search Focus Effect */
        .search-container:focus-within {
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #22c55e !important;
        }
        
        /* Location Text Constraints */
        .location-constraint {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        .location-constraint > div, 
        .location-constraint > span,
        .location-constraint p {
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
        }
        /* Hide duplicate icon inside LocationSelector */
        .location-constraint svg {
          display: none !important; 
        }
      `}</style>

      <header
        style={{
          ...styles.headerWrapper,
          height: scrolled ? "72px" : "90px", // Smooth height transition
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.04)" : "none",
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.95)" : "#ffffff",
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div style={styles.container}>
          
          {/* 1. Left: Brand Logo */}
          <Link href="/home" style={styles.brand}>
             <Image 
               src="/images/4.png" 
               alt="Cane & Tender" 
               width={160} // Adjusted for balance
               height={60} 
               style={{ objectFit: 'contain', maxHeight: '60px' }} 
               priority
               unoptimized={true} 
             />
          </Link>

          {/* 2. Middle: Search Bar */}
          <div style={styles.searchSection}>
            <div style={styles.searchBar} className="search-container">
              <input
                type="text"
                placeholder="Search for fresh items..."
                style={styles.searchInput}
              />
              <button style={styles.searchButton}>
                <Search size={20} color="#ffffff" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* 3. Right Group: Location + Actions */}
          <div style={styles.rightGroup}>
            
            {/* Location Group */}
            <div style={styles.locationContainer}>
               <div style={styles.locationIconWrapper}>
                 <MapPin size={18} color="#64748b" fill="#f1f5f9" />
               </div>
               
               <div style={styles.locationTextWrapper} className="location-constraint">
                 <LocationSelector />
               </div>
            </div>

            <div style={styles.separator}></div>

            {/* Actions */}
            <div style={styles.actionRow}>
              <Link href="/favorites" className="nav-icon-btn" title="Favorites">
                <Heart size={22} />
              </Link>

              <Link href="/cart" style={styles.cartLink} className="nav-icon-btn" title="Cart">
                <div style={styles.cartWrapper}>
                  <ShoppingBag size={22} />
                  <span style={styles.cartBadge}>3</span>
                </div>
              </Link>

              {isAuthenticated ? (
                <div className="user-dropdown-container" style={{ position: "relative" }}>
                  <div className="nav-icon-btn">
                    <User size={22} />
                  </div>
                  <div style={styles.dropdownPanel} className="dropdown-panel">
                    <div style={styles.dropdownHeader}>
                      <p style={styles.userName}>Alex Johnson</p>
                      <p style={styles.userEmail}>alex@example.com</p>
                    </div>
                    <hr style={styles.divider} />
                    <Link href="/profile" className="dropdown-item">
                      <User size={18} /> Profile
                    </Link>
                    <Link href="/orders" className="dropdown-item">
                      <Package size={18} /> My Orders
                    </Link>
                    <Link href="/settings" className="dropdown-item">
                      <Settings size={18} /> Settings
                    </Link>
                    <hr style={styles.divider} />
                    <button
                      onClick={() => logout()}
                      className="dropdown-item"
                      style={{
                        width: "100%",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#ef4444",
                      }}
                    >
                      <LogOut size={18} /> Logout
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
        </div>
      </header>
    </>
  );
}

// Enhanced Styles
const styles: { [key: string]: React.CSSProperties } = {
  headerWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    borderBottom: "1px solid #f1f5f9",
  },
  container: {
    maxWidth: "1440px",
    margin: "0 auto",
    height: "100%",
    padding: "0 32px", // Increased padding for breathability
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
  },
  brand: { textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center" },
  searchSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '560px', // Slightly wider search bar
  },
  searchBar: {
    background: "#f3f4f6",
    borderRadius: "50px",
    padding: "5px 5px 5px 24px",
    display: "flex",
    alignItems: "center",
    width: "100%",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "0.95rem",
    width: "100%",
    color: "#1e293b",
    fontWeight: 500,
    fontFamily: "inherit",
  },
  searchButton: {
    background: "#22c55e",
    border: "none",
    width: "40px", // Larger button
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    marginLeft: "12px",
    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)", // Subtle green glow
    transition: "transform 0.1s ease",
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  // --- LOCATION STYLES ---
  locationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginRight: '8px',
    maxWidth: '240px',
    cursor: 'pointer', // Suggests clickable
  },
  locationIconWrapper: {
    background: '#f8fafc',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#64748b',
    border: '1px solid #e2e8f0'
  },
  locationTextWrapper: {
    flex: 1,
    overflow: 'hidden',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#334155',
    lineHeight: 1.2
  },
  separator: {
    width: '1px',
    height: '32px',
    backgroundColor: '#e2e8f0',
    margin: '0 4px'
  },
  actionRow: { display: "flex", alignItems: "center", gap: "12px" },
  cartLink: { textDecoration: "none", color: "inherit" },
  cartWrapper: { position: "relative", display: "flex", alignItems: "center" },
  cartBadge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "#ef4444", // Changed to red for better visibility
    color: "white",
    fontSize: "11px",
    fontWeight: 700,
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  dropdownPanel: {
    position: "absolute",
    top: "55px",
    right: 0,
    width: "260px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 40px -5px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)", // Cleaner shadow
    border: "1px solid #f1f5f9",
    padding: "8px",
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(10px)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1100,
  },
  dropdownHeader: { padding: "16px 16px 12px 16px" },
  userName: { margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" },
  userEmail: { margin: 0, fontSize: "0.8rem", color: "#64748b", marginTop: "2px" },
  divider: { border: 0, borderTop: "1px solid #f1f5f9", margin: "8px 0" },
  loginBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 28px",
    borderRadius: "50px",
    fontSize: "0.95rem",
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)"
  },
};