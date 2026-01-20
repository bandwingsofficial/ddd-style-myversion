"use client";

import React from "react";
import Link from "next/link";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Phone, 
  Mail, 
  Leaf
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footerWrapper}>
      <div style={styles.footerMain}>
        <div style={styles.footerContainer} className="footer-grid">
          
          {/* Column 1: Brand Identity */}
          <div style={styles.column}>
            <Link href="/" style={styles.logoLink}>
              <div style={styles.logoIcon}><Leaf size={24} fill="currentColor" /></div>
              <span style={styles.logoText}>Cane & Tender</span>
            </Link>
            <p style={styles.brandStory}>
              Your destination for fresh, natural, and hygienic cane juice and tender coconut water.
            </p>
            <div style={styles.socialGroup}>
              <a href="#" style={styles.socialLink}><Facebook size={20} /></a>
              <a href="#" style={styles.socialLink}><Instagram size={20} /></a>
              <a href="#" style={styles.socialLink}><Twitter size={20} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Quick Links</h4>
            <ul style={styles.linkList}>
              <li style={styles.listItem}><Link href="/home" style={styles.link}>Home</Link></li>
              <li style={styles.listItem}><Link href="/menu" style={styles.link}>Shop</Link></li>
              <li style={styles.listItem}><Link href="/about" style={styles.link}>About Us</Link></li>
              <li style={styles.listItem}><Link href="/contact" style={styles.link}>Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Contact Info</h4>
            <ul style={styles.linkList}>
              <li style={styles.listItem}>
                <Mail size={16} style={styles.iconMint} /> 
                <span style={styles.contactText}>support@caneandtender.com</span>
              </li>
              <li style={styles.listItem}>
                <Phone size={16} style={styles.iconMint} /> 
                <span style={styles.contactText}>+1 (555) 123-4567</span>
              </li>
              <li style={styles.listItem}>
                <span style={styles.hours}>Mon - Sat: 9 AM - 8 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Legal</h4>
            <ul style={styles.linkList}>
              <li style={styles.listItem}><Link href="/privacy-policy" style={styles.link}>Privacy Policy</Link></li>
              <li style={styles.listItem}><Link href="/terms-of-service" style={styles.link}>Terms of Service</Link></li>
              <li style={styles.listItem}><Link href="/refund-policy" style={styles.link}>Refund Policy</Link></li>
            </ul>
          </div>

        </div>
      </div>

      <div style={styles.footerBottom}>
        <div style={styles.bottomContainer}>
          <p style={styles.copyright}>
            © {currentYear} Cane & Tender . All rights reserved.
          </p>
        </div>
      </div>

      {/* Media Queries for Responsive Grid */}
      <style jsx>{`
        @media (max-width: 968px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 3rem !important;
          }
        }
        @media (max-width: 580px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </footer>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footerWrapper: {
    backgroundColor: "#052e16",
    color: "#f0fdf4",
    borderTop: "1px solid rgba(74, 222, 128, 0.1)",
  },
  footerMain: {
    padding: "4rem 0 3rem",
  },
  footerContainer: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 2rem",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr 1fr 0.8fr",
    gap: "2rem",
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    marginBottom: "1rem",
  },
  logoIcon: {
    color: "#4ade80",
    display: "flex",
  },
  logoText: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#f0fdf4",
  },
  brandStory: {
    color: "#86efac",
    fontSize: "0.9rem",
    lineHeight: "1.6",
    marginBottom: "1.5rem",
    maxWidth: "280px",
  },
  socialGroup: {
    display: "flex",
    gap: "1rem",
  },
  socialLink: {
    color: "#f0fdf4",
    opacity: 0.7,
    transition: "opacity 0.3s",
    display: "flex",
    alignItems: "center",
  },
  columnTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#f0fdf4",
    marginBottom: "1.5rem",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
  },
  link: {
    color: "#86efac",
    textDecoration: "none",
    transition: "color 0.3s",
  },
  iconMint: {
    color: "#4ade80",
  },
  contactText: {
    color: "#f0fdf4",
  },
  hours: {
    opacity: 0.8,
    fontSize: "0.85rem",
    color: "#86efac",
  },
  footerBottom: {
    padding: "1.5rem 0",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    textAlign: "center",
  },
  bottomContainer: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  copyright: {
    fontSize: "0.85rem",
    color: "#86efac",
    opacity: 0.6,
  },
};