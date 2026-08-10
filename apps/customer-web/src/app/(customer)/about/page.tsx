"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import {
  Leaf,
  Award,
  Heart,
  ShieldCheck,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50">

      {/* ============================================================
          CUSTOM ANIMATIONS
      ============================================================ */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(24px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes blob {
              0%, 100% {
                transform: translate(0px, 0px) scale(1);
              }

              33% {
                transform: translate(30px, -50px) scale(1.1);
              }

              66% {
                transform: translate(-20px, 20px) scale(0.95);
              }
            }

            .animate-fade-in-up {
              animation:
                fadeInUp
                0.8s
                cubic-bezier(0.16, 1, 0.3, 1)
                forwards;
            }

            .animate-blob {
              animation:
                blob
                10s
                infinite
                ease-in-out;
            }

            .animation-delay-2000 {
              animation-delay: 2s;
            }

            /* ======================================================
               MOBILE RESPONSIVE
            ====================================================== */

            @media (max-width: 640px) {
              .about-blob {
                filter: blur(2rem);
                opacity: 0.25;
              }

              .about-hero-title {
                font-size: 2.25rem;
                line-height: 1.12;
              }

              .about-hero-description {
                font-size: 0.95rem;
                line-height: 1.7;
              }

              .about-value-card {
                min-height: auto;
              }

              .about-story-text {
                font-size: 1rem;
                line-height: 1.8;
              }
            }

            @media (max-width: 380px) {
              .about-hero-title {
                font-size: 2rem;
              }

              .about-hero-description {
                font-size: 0.9rem;
              }
            }

            /* ======================================================
               ACCESSIBILITY
            ====================================================== */

            @media (prefers-reduced-motion: reduce) {
              .animate-fade-in-up,
              .animate-blob,
              .animate-ping {
                animation: none !important;
              }
            }
          `,
        }}
      />

      {/* ============================================================
          DECORATIVE BACKGROUND BLOBS
      ============================================================ */}

      <div
        className="
          about-blob
          pointer-events-none
          absolute
          left-1/4
          top-40
          h-56
          w-56
          rounded-full
          bg-emerald-100
          opacity-40
          mix-blend-multiply
          blur-3xl
          animate-blob

          sm:h-72
          sm:w-72
        "
        aria-hidden="true"
      />

      <div
        className="
          about-blob
          pointer-events-none
          absolute
          right-1/4
          top-60
          h-60
          w-60
          rounded-full
          bg-green-100
          opacity-40
          mix-blend-multiply
          blur-3xl
          animate-blob
          animation-delay-2000

          sm:h-80
          sm:w-80
        "
        aria-hidden="true"
      />

      {/* ============================================================
          HEADER
      ============================================================ */}

      <Header />

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <main
        className="
          customer-page-shell
          relative
          flex-grow
          animate-in
          fade-in
          slide-in-from-bottom-4
          duration-700
        "
      >

        {/* ==========================================================
            HERO SECTION
        ========================================================== */}

        <section
          className="
            mx-auto
            mb-14
            w-full
            max-w-4xl
            px-4
            pt-6
            text-center
            animate-fade-in-up

            sm:mb-20
            sm:px-6
            sm:pt-10
          "
        >

          {/* ========================================================
              EST BADGE
          ======================================================== */}

          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-emerald-100
              bg-emerald-50
              px-3
              py-1
              text-xs
              font-medium
              text-emerald-700
              shadow-sm
              transition-colors
              duration-300

              sm:mb-6
            "
          >

            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-emerald-400
                  opacity-75
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-500
                "
              />
            </span>

            Est. 2026
          </div>

          {/* ========================================================
              TITLE
          ======================================================== */}

          <h1
            className="
              about-hero-title
              mb-5
              text-4xl
              font-extrabold
              leading-tight
              tracking-tight
              text-slate-900

              sm:mb-6
              sm:text-5xl

              lg:text-6xl
            "
          >
            Purity in{" "}

            <span
              className="
                bg-gradient-to-r
                from-emerald-600
                via-emerald-500
                to-green-500
                bg-[length:200%_auto]
                bg-clip-text
                text-transparent
                transition-all
                duration-1000
                hover:bg-right
              "
            >
              Every Sip.
            </span>
          </h1>

          {/* ========================================================
              DESCRIPTION
          ======================================================== */}

          <p
            className="
              about-hero-description
              mx-auto
              max-w-2xl
              px-1
              text-base
              leading-relaxed
              text-slate-500

              sm:px-0
              sm:text-lg
              sm:leading-relaxed
            "
          >
            At CanTen, we are on a mission to
            redefine freshness by delivering
            nature's finest juices directly from
            the farm to your doorstep.
          </p>
        </section>

        {/* ==========================================================
            VALUES GRID
        ========================================================== */}

        <section
          className="
            mx-auto
            mb-16
            w-full
            max-w-6xl
            px-4

            sm:mb-24
            sm:px-6
            lg:px-8
          "
        >

          <div
            className="
              grid
              grid-cols-1
              gap-4

              sm:grid-cols-2
              sm:gap-5

              lg:grid-cols-4
              lg:gap-6
            "
          >

            {/* ======================================================
                CARD 1
            ====================================================== */}

            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: "150ms",
              }}
            >
              <ValueCard
                icon={
                  <Leaf className="h-6 w-6" />
                }
                title="100% Organic"
                desc="Sourced directly from certified organic farms, ensuring no pesticides touch your drink."
              />
            </div>

            {/* ======================================================
                CARD 2
            ====================================================== */}

            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: "300ms",
              }}
            >
              <ValueCard
                icon={
                  <ShieldCheck className="h-6 w-6" />
                }
                title="Hygiene First"
                desc="Prepared in state-of-the-art facilities following stringent safety protocols."
              />
            </div>

            {/* ======================================================
                CARD 3
            ====================================================== */}

            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: "450ms",
              }}
            >
              <ValueCard
                icon={
                  <Heart className="h-6 w-6" />
                }
                title="Made with Love"
                desc="We believe in the healing power of natural ingredients, served with care."
              />
            </div>

            {/* ======================================================
                CARD 4
            ====================================================== */}

            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: "600ms",
              }}
            >
              <ValueCard
                icon={
                  <Award className="h-6 w-6" />
                }
                title="Premium Quality"
                desc="We select only the tenderest coconuts and the juiciest sugarcane stalks."
              />
            </div>
          </div>
        </section>

        {/* ==========================================================
            STORY SECTION
        ========================================================== */}

        <section
          className="
            mx-auto
            w-full
            max-w-4xl
            px-4
            pb-14
            animate-fade-in-up

            sm:px-6
            sm:pb-20
          "
          style={{
            animationDelay: "750ms",
          }}
        >

          <div
            className="
              group/story
              relative
              overflow-hidden
              rounded-3xl
              border
              border-slate-100
              bg-white
              shadow-[0_8px_30px_rgb(0,0,0,0.02)]
              transition-all
              duration-500

              hover:-translate-y-1
              hover:shadow-[0_15px_40px_rgb(16,185,129,0.08)]
            "
          >

            {/* ======================================================
                TOP GRADIENT LINE
            ====================================================== */}

            <div
              className="
                h-1.5
                w-full
                bg-gradient-to-r
                from-emerald-500
                via-green-400
                to-emerald-500
                bg-[length:200%_auto]
                transition-all
                duration-1000
                group-hover/story:bg-right
              "
            />

            {/* ======================================================
                STORY CONTENT
            ====================================================== */}

            <div
              className="
                px-5
                py-8
                text-center

                sm:px-8
                sm:py-10

                md:px-12
                md:py-12
              "
            >

              <h2
                className="
                  mb-5
                  text-2xl
                  font-bold
                  text-slate-900
                  transition-colors
                  duration-300
                  group-hover/story:text-emerald-700

                  sm:mb-6
                "
              >
                Our Journey
              </h2>

              <div className="mx-auto max-w-3xl">

                <p
                  className="
                    about-story-text
                    text-base
                    leading-8
                    text-slate-500
                    transition-colors
                    duration-300
                    group-hover/story:text-slate-600

                    sm:text-lg
                    sm:leading-loose
                  "
                >
                  Founded in 2026,{" "}

                  <span
                    className="
                      font-semibold
                      text-slate-800
                      transition-colors
                      group-hover/story:text-emerald-900
                    "
                  >
                    CanTen
                  </span>{" "}

                  began with a simple question:
                  "Why is it so hard to find
                  authentic, hygienic sugarcane
                  juice?" What started as a small
                  stall in Bengaluru has grown into
                  a trusted brand, connecting urban
                  consumers with the raw, refreshing
                  taste of nature. We bridge the gap
                  between rural freshness and modern
                  convenience.
                </p>
              </div>

              {/* ====================================================
                  DECORATIVE SIGNATURE
              ==================================================== */}

              <div
                className="
                  mt-7
                  flex
                  justify-center
                  opacity-20
                  transition-opacity
                  duration-500

                  group-hover/story:opacity-50

                  sm:mt-8
                "
              >
                <svg
                  width="100"
                  height="20"
                  viewBox="0 0 100 20"
                  fill="none"
                  stroke="currentColor"
                  className="
                    text-emerald-700
                    stroke-[2]
                    transition-transform
                    duration-700

                    group-hover/story:scale-110
                  "
                >
                  <path
                    d="M0 10 Q 25 20, 50 10 T 100 10"
                    fill="none"
                  />
                </svg>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* ============================================================
          FOOTER
      ============================================================ */}

      <Footer />
    </div>
  );
}

/* ==================================================================
   VALUE CARD
================================================================== */

function ValueCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="
        about-value-card
        group
        h-full
        rounded-2xl
        border
        border-slate-100
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-emerald-100
        hover:shadow-lg
        hover:shadow-emerald-100/30

        sm:p-6
      "
    >

      {/* ==========================================================
          ICON
      ========================================================== */}

      <div
        className="
          mb-4
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-emerald-50
          text-emerald-600
          transition-all
          duration-300

          group-hover:scale-105
          group-hover:bg-emerald-100

          sm:mb-5
        "
      >
        {icon}
      </div>

      {/* ==========================================================
          TITLE
      ========================================================== */}

      <h3
        className="
          mb-2
          text-base
          font-bold
          text-slate-900
          transition-colors
          duration-300

          group-hover:text-emerald-700

          sm:text-lg
        "
      >
        {title}
      </h3>

      {/* ==========================================================
          DESCRIPTION
      ========================================================== */}

      <p
        className="
          text-sm
          leading-6
          text-slate-500

          sm:leading-7
        "
      >
        {desc}
      </p>
    </div>
  );
}