"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Twitter,
  Facebook,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* AMBIENT BACKGROUND */}
      <div className="footer-bg" aria-hidden="true">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="grid-lines" />
      </div>

      <div className="footer-main">
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="col brand-col">
            <Link href="/" className="logo-link">
              <div className="logo-wrapper">
                <Image 
                  src="/images/canten1.png" 
                  alt="Can &amp; Ten Logo" 
                  width={140} 
                  height={50}  
                  className="logo-img"
                  priority
                />
              </div>
            </Link>
            <p className="brand-story">
              Your destination for fresh, natural, and hygienic cane juice
              and tender coconut water.
            </p>
            <div className="social-group">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col">
            <h4 className="col-title">Quick Links</h4>
            <ul className="link-list">
              <li>
                <Link href="/home" className="footer-link">
                  <span className="link-text">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/menu" className="footer-link">
                  <span className="link-text">Shop</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="footer-link">
                  <span className="link-text">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="footer-link">
                  <span className="link-text">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="col">
            <h4 className="col-title">Contact Info</h4>
            <ul className="link-list contact-list">
              <li className="contact-item">
                <span className="icon-badge">
                  <Mail size={14} />
                </span>
                <span className="contact-text">connect@canten.com</span>
              </li>
              <li className="contact-item">
                <span className="icon-badge">
                  <Phone size={14} />
                </span>
                <span className="contact-text">+1 (555) 123-4567</span>
              </li>
              <li className="contact-item hours-item">
                <span className="hours">Mon – Sat: 9 AM – 8 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="col">
            <h4 className="col-title">Legal</h4>
            <ul className="link-list">
              <li>
                <Link href="/privacy-policy" className="footer-link">
                  <span className="link-text">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="footer-link">
                  <span className="link-text">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="footer-link">
                  <span className="link-text">Refund Policy</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="bottom-container">
          <p className="copyright">
            © {currentYear} Can &amp; Ten. All rights reserved.
          </p>
          <div className="bottom-tag">
            <span className="tag-dot" />
            Made fresh, every day
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          position: relative;
          background: #052e16;
          color: #f0fdf4;
          border-top: 1px solid rgba(74, 222, 128, 0.12);
          overflow: hidden;
          isolation: isolate;
        }

        /* ---------- AMBIENT BACKGROUND ---------- */
        .footer-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.22;
        }

        .glow-1 {
          width: 480px;
          height: 480px;
          top: -220px;
          left: -120px;
          background: radial-gradient(circle, #4ade80 0%, transparent 70%);
        }

        .glow-2 {
          width: 420px;
          height: 420px;
          bottom: -200px;
          right: -100px;
          background: radial-gradient(circle, #22c55e 0%, transparent 70%);
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at top, black, transparent 75%);
        }

        /* ---------- MAIN GRID ---------- */
        .footer-main {
          position: relative;
          z-index: 1;
          padding: 5rem 0 3rem;
        }

        .footer-grid {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1.3fr 0.8fr 1fr 0.8fr;
          gap: 2.5rem;
        }

        @media (max-width: 968px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.75rem 2rem;
          }
        }

        @media (max-width: 580px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2.25rem;
            padding: 0 1.5rem;
          }
        }

        .col {
          display: flex;
          flex-direction: column;
        }

        /* ---------- BRAND ---------- */
        .logo-link {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          margin-bottom: 1.1rem;
          width: fit-content;
        }

        .logo-wrapper {
          width: 130px; 
          height: auto;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        :global(.logo-img) {
          object-fit: contain;
          width: 100%;
          height: auto;
        }

        .logo-link:hover .logo-wrapper {
          transform: scale(1.04); 
        }

        .brand-story {
          color: #86efac;
          font-size: 0.92rem;
          line-height: 1.65;
          margin: 0 0 1.6rem 0;
          max-width: 280px;
          opacity: 0.85;
        }

        .social-group {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          color: #f0fdf4;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .social-link:hover {
          transform: translateY(-3px);
          background: linear-gradient(135deg, #6dc13a, #22c55e);
          border-color: transparent;
          color: #052e16;
          box-shadow: 0 10px 24px rgba(34, 197, 94, 0.35);
        }

        /* ---------- COLUMN TITLES ---------- */
        .col-title {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #d9f99d;
          margin: 0 0 1.4rem 0;
          position: relative;
          padding-bottom: 10px;
        }

        .col-title::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 28px;
          height: 2px;
          background: linear-gradient(90deg, #4ade80, transparent);
          border-radius: 2px;
        }

        /* ---------- LINK LISTS ---------- */
        .link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .footer-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: fit-content;
          text-decoration: none;
          color: #86efac;
          font-size: 0.92rem;
          transition: color 0.3s ease;
        }

        .link-text {
          position: relative;
        }

        .link-text::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -3px;
          width: 0%;
          height: 1px;
          background: #4ade80;
          transition: width 0.3s ease;
        }

        .footer-link:hover {
          color: #f0fdf4;
        }

        .footer-link:hover .link-text::after {
          width: 100%;
        }

        /* ---------- CONTACT ---------- */
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .icon-badge {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(74, 222, 128, 0.12);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.18);
        }

        .contact-text {
          color: #f0fdf4;
          opacity: 0.92;
          word-break: break-word;
        }

        .hours-item {
          padding-left: 38px;
        }

        .hours {
          color: #86efac;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        /* ---------- BOTTOM BAR ---------- */
        .footer-bottom {
          position: relative;
          z-index: 1;
          padding: 1.6rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }

        .bottom-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        @media (max-width: 580px) {
          .bottom-container {
            justify-content: center;
            text-align: center;
            padding: 0 1.5rem;
          }
        }

        .copyright {
          font-size: 0.85rem;
          color: #86efac;
          opacity: 0.6;
          margin: 0;
        }

        .bottom-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.8rem;
          color: #86efac;
          opacity: 0.75;
        }

        .tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.18);
          animation: pulseDot 2.4s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.85);
          }
        }

        /* ---------- ACCESSIBILITY ---------- */
        .footer-link:focus-visible,
        .social-link:focus-visible,
        .logo-link:focus-visible {
          outline: 2px solid #4ade80;
          outline-offset: 3px;
          border-radius: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-wrapper,
          .social-link,
          .footer-link,
          .link-text::after,
          .tag-dot {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  );
}