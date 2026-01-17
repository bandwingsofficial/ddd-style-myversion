"use client";

import Link from "next/link";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Send, 
  Phone, 
  Mail, 
  ShieldCheck,
  CreditCard,
  Leaf
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      <div className="footer-main">
        <div className="footer-container">
          {/* Column 1: Brand Identity */}
          <div className="footer-brand">
            <Link href="/" className="logo-link">
              <div className="logo-icon"><Leaf size={24} fill="currentColor" /></div>
              <span className="logo-text">Cane & Tender</span>
            </Link>
            <p className="brand-story">
              Your destination for fresh, natural, and hygienic cane juice and tender coconut water.
            </p>
            <div className="social-group">
              <a href="#" className="social-link"><Facebook size={20} /></a>
              <a href="#" className="social-link"><Instagram size={20} /></a>
              <a href="#" className="social-link"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-nav">
            <h4 className="column-title">Quick Links</h4>
            <ul className="link-list">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/menu">Shop</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="footer-nav">
            <h4 className="column-title">Contact Info</h4>
            <ul className="link-list contact-list">
              <li>
                <Mail size={16} className="text-mint" /> 
                <span>support@caneandtender.com</span>
              </li>
              <li>
                <Phone size={16} className="text-mint" /> 
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <span className="hours">Mon - Sat: 9 AM - 8 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="footer-nav">
            <h4 className="column-title">Legal</h4>
            <ul className="link-list">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/refunds">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="bottom-container">
          <p className="copyright">
            © {currentYear} Cane & Tender Platform. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        .footer-wrapper {
          background: #052e16; 
          color: #f0fdf4; 
          border-top: 1px solid rgba(74, 222, 128, 0.1);
        }

        .footer-main {
          padding: 4rem 0 3rem;
        }

        .footer-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 1fr 0.8fr;
          gap: 2rem;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .logo-icon { color: #4ade80; } 
        
        .logo-text {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f0fdf4;
        }

        .brand-story {
          color: #86efac; 
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          max-width: 280px;
        }

        .social-group {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          color: #f0fdf4;
          opacity: 0.7;
          transition: 0.3s;
        }

        .social-link:hover { opacity: 1; color: #4ade80; }

        .column-title {
          font-size: 1rem;
          font-weight: 600;
          color: #f0fdf4;
          margin-bottom: 1.5rem;
        }

        .link-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .link-list li { 
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
        }

        .link-list :global(a) {
          color: #86efac;
          text-decoration: none;
          transition: 0.3s;
        }

        .link-list :global(a:hover) { color: #4ade80; }

        .text-mint { color: #4ade80; }

        .hours { opacity: 0.8; font-size: 0.85rem; }

        .footer-bottom {
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
        }

        .copyright {
          font-size: 0.85rem;
          color: #86efac;
          opacity: 0.6;
        }

        @media (max-width: 968px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 3rem;
          }
        }

        @media (max-width: 580px) {
          .footer-container { 
            grid-template-columns: 1fr; 
          }
        }
      `}</style>
    </footer>
  );
}