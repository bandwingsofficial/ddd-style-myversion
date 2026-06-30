"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomeBanner() {
  return (
    <section className="home-banner" aria-label="Fresh juice hero banner">
      {/* AMBIENT ORGANIC BACKGROUND */}
      <div className="bg-layer" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grain" />
        <span className="leaf leaf-1">🌿</span>
        <span className="leaf leaf-2">🌿</span>
        <span className="drop drop-1" />
        <span className="drop drop-2" />
      </div>

      <div className="banner-inner">
        {/* LEFT — CONTENT */}
        <div className="content-col">
          <div className="badge fade-up" style={{ animationDelay: "0s" }}>
            <span className="badge-dot" />
            Fresh Everyday
          </div>

          <h1 className="heading fade-up" style={{ animationDelay: "0.08s" }}>
            Freshness Delivered{" "}
            <span className="highlight">Fast.</span>
          </h1>

          <p className="subheading fade-up" style={{ animationDelay: "0.16s" }}>
            Natural, healthy &amp; refreshing sugarcane and coconut juices,
            delivered fresh to your doorstep.
          </p>

          <div className="cta-row fade-up" style={{ animationDelay: "0.24s" }}>
            <Link href="/menu" style={{ textDecoration: "none" }}>
              <button className="btn-primary" aria-label="Order juice now">
                <span>Order Now</span>
                <svg
                  className="btn-arrow"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </Link>

            <Link href="/menu" style={{ textDecoration: "none" }}>
              <button className="btn-secondary" aria-label="Explore the menu">
                Explore Menu
              </button>
            </Link>
          </div>

          <div className="trust-row fade-up" style={{ animationDelay: "0.32s" }}>
            <div className="trust-pill">
              <span aria-hidden="true">⭐</span> 4.9 Rating
            </div>
            <div className="trust-pill">
              <span aria-hidden="true">🧃</span> 5000+ Orders
            </div>
            <div className="trust-pill">
              <span aria-hidden="true">⚡</span> 20 Min Delivery
            </div>
            <div className="trust-pill">
              <span aria-hidden="true">🌿</span> 100% Natural
            </div>
          </div>
        </div>

        {/* RIGHT — HERO IMAGE */}
        <div className="image-col">
          <div className="image-glow" aria-hidden="true" />
          <div className="image-frame">
            <Image
              src="/images/homebg.png"
              alt="Fresh sugarcane and coconut juice ingredients"
              fill
              style={{ objectFit: "contain" }}
              priority
              unoptimized
            />
          </div>

          {/* FLOATING GLASS CARDS */}
          <div className="float-card card-1" style={{ animationDelay: "0.4s" }}>
            <span className="card-icon">⚡</span>
            <div>
              <div className="card-title">20 min</div>
              <div className="card-sub">Average Delivery</div>
            </div>
          </div>

          <div className="float-card card-2" style={{ animationDelay: "0.55s" }}>
            <span className="card-icon">⭐</span>
            <div>
              <div className="card-title">4.9 Rating</div>
              <div className="card-sub">5000+ Reviews</div>
            </div>
          </div>

          <div className="float-card card-3" style={{ animationDelay: "0.7s" }}>
            <span className="card-icon">🌿</span>
            <div>
              <div className="card-title">Fresh Today</div>
              <div className="card-sub">No Preservatives</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .home-banner {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #fbfaf6;
           padding: 20px 20px 60px;
          isolation: isolate;
        }

        @media (max-width: 768px) {
          .home-banner {
            padding: 84px 18px 40px;
          }
        }

        /* ---------- BACKGROUND ---------- */
        .bg-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.45;
        }

        .blob-1 {
          width: 480px;
          height: 480px;
          top: -160px;
          right: -120px;
          background: radial-gradient(circle, #bfe6a0 0%, transparent 70%);
        }

        .blob-2 {
          width: 380px;
          height: 380px;
          bottom: -140px;
          left: -100px;
          background: radial-gradient(circle, #d9f0c4 0%, transparent 70%);
        }

        .blob-3 {
          width: 320px;
          height: 320px;
          top: 35%;
          left: 38%;
          background: radial-gradient(circle, #eaf7e0 0%, transparent 70%);
          opacity: 0.35;
        }

        .grain {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px);
          background-size: 3px 3px;
        }

        .leaf {
          position: absolute;
          font-size: 28px;
          opacity: 0.25;
          animation: leafFloat 7s ease-in-out infinite;
        }
        .leaf-1 {
          top: 18%;
          left: 6%;
          animation-delay: 0s;
        }
        .leaf-2 {
          bottom: 14%;
          right: 8%;
          font-size: 22px;
          animation-delay: 1.5s;
        }

        .drop {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(180deg, rgba(76, 168, 46, 0.18), transparent);
        }
        .drop-1 {
          width: 14px;
          height: 18px;
          top: 30%;
          right: 20%;
          animation: leafFloat 5s ease-in-out infinite;
        }
        .drop-2 {
          width: 10px;
          height: 14px;
          bottom: 30%;
          left: 22%;
          animation: leafFloat 6s ease-in-out infinite 0.8s;
        }

        @keyframes leafFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-14px) rotate(8deg);
          }
        }

        /* ---------- LAYOUT ---------- */
        .banner-inner {
          position: relative;
          z-index: 2;
          max-width: 1320px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 36px;
        }

        @media (min-width: 1024px) {
          .banner-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            text-align: left;
            gap: 24px;
          }
        }

        .content-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 560px;
        }

        @media (min-width: 1024px) {
          .content-col {
            align-items: flex-start;
            flex: 0 0 48%;
          }
        }

        /* ---------- BADGE ---------- */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(76, 168, 46, 0.25);
          color: #2e7d32;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 22px;
          box-shadow: 0 4px 16px rgba(76, 168, 46, 0.08);
        }

        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ca82e;
          box-shadow: 0 0 0 4px rgba(76, 168, 46, 0.18);
        }

        /* ---------- TYPOGRAPHY ---------- */
        .heading {
          font-size: clamp(2.4rem, 5.6vw, 4.5rem);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -2px;
          color: #11201a;
          margin: 0 0 20px 0;
        }

        .highlight {
          background: linear-gradient(95deg, #4ca82e, #2e7d32);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .subheading {
          font-size: clamp(1rem, 1.6vw, 1.25rem);
          font-weight: 500;
          color: #5b6760;
          line-height: 1.5;
          max-width: 460px;
          margin: 0 0 30px 0;
        }

        /* ---------- BUTTONS ---------- */
        .cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          width: 100%;
          justify-content: center;
          margin-bottom: 30px;
        }

        @media (min-width: 1024px) {
          .cta-row {
            justify-content: flex-start;
          }
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          border: none;
          padding: 16px 32px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 1.05rem;
          background: linear-gradient(135deg, #6dc13a, #2e7d32);
          box-shadow: 0 12px 28px rgba(46, 125, 50, 0.32);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
            box-shadow 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 34px rgba(46, 125, 50, 0.42);
        }

        .btn-primary:hover .btn-arrow {
          transform: translateX(4px);
        }

        .btn-primary:active {
          transform: translateY(-1px) scale(0.98);
        }

        .btn-arrow {
          transition: transform 0.25s ease;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 16px 30px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 1.05rem;
          color: #1f2d24;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1.5px solid rgba(46, 125, 50, 0.3);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease, color 0.3s ease;
        }

        .btn-secondary:hover {
          background: rgba(46, 125, 50, 0.1);
          transform: translateY(-2px);
        }

        /* ---------- TRUST ROW ---------- */
        .trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        @media (min-width: 1024px) {
          .trust-row {
            justify-content: flex-start;
          }
        }

        .trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #34433a;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.06);
          padding: 8px 14px;
          border-radius: 999px;
        }

        /* ---------- IMAGE COLUMN ---------- */
        .image-col {
          position: relative;
          width: 100%;
          max-width: 480px;
          aspect-ratio: 1 / 1;
        }

        @media (min-width: 1024px) {
          .image-col {
            flex: 0 0 50%;
            max-width: 620px;
            aspect-ratio: 1 / 0.95;
          }
        }

        .image-glow {
          position: absolute;
          inset: 8%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109, 193, 58, 0.35), transparent 70%);
          filter: blur(40px);
          z-index: 0;
        }

        .image-frame {
          position: absolute;
          inset: 0;
          z-index: 1;
          animation: imageFloat 5.5s ease-in-out infinite;
          transition: transform 0.4s ease;
        }

        .image-frame:hover {
          transform: scale(1.03);
        }

        @keyframes imageFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        /* ---------- FLOATING CARDS ---------- */
        .float-card {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 30px rgba(20, 40, 25, 0.12);
          animation: cardFloat 6s ease-in-out infinite, fadeUp 0.7s ease forwards;
          opacity: 0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .float-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(20, 40, 25, 0.18);
        }

        .card-icon {
          font-size: 1.3rem;
        }

        .card-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #16241b;
        }

        .card-sub {
          font-size: 0.72rem;
          color: #62716a;
          font-weight: 500;
        }

        .card-1 {
          top: 6%;
          left: -4%;
        }
        .card-2 {
          bottom: 18%;
          right: -6%;
        }
        .card-3 {
          bottom: -4%;
          left: 12%;
        }

        @media (max-width: 1023px) {
          .card-1 {
            top: -2%;
            left: 0;
          }
          .card-2 {
            bottom: 8%;
            right: 0;
          }
          .card-3 {
            display: none;
          }
        }

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        /* ---------- ENTRANCE ANIMATIONS ---------- */
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.7s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up,
          .float-card,
          .image-frame,
          .leaf,
          .drop {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* ---------- FOCUS STATES ---------- */
        .btn-primary:focus-visible,
        .btn-secondary:focus-visible {
          outline: 3px solid #2e7d32;
          outline-offset: 3px;
        }
      `}</style>
    </section>
  );
} 