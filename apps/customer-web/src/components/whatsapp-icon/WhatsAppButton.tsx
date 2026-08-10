"use client";

import React from "react";

export default function SocialButtons() {
  const whatsappNumber = "919902962777";

  const whatsappMessage = encodeURIComponent(
    "Hello, I would like to get in touch."
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Replace this with your actual Instagram profile URL
  const instagramUrl =
    "https://www.instagram.com/Canten.online/";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] hidden flex-col items-center gap-3 md:flex md:bottom-8 md:right-8">

      {/* Instagram */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow us on Instagram"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-[0_8px_25px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            stroke="white"
            strokeWidth="2"
          />

          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="white"
            strokeWidth="2"
          />

          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="white"
          />
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
      >
        <svg
          viewBox="0 0 32 32"
          className="h-9 w-9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.25.59 4.37 1.62 6.21L3 29l6.99-1.79A12.73 12.73 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2Z"
            fill="white"
          />

          <path
            d="M16 6.4a9.6 9.6 0 0 0-8.28 14.47l-.95 3.48 3.57-.91A9.6 9.6 0 1 0 16 6.4Z"
            fill="#25D366"
          />

          <path
            d="M12.14 10.92c-.25-.56-.51-.57-.75-.58h-.64c-.22 0-.58.08-.89.42-.31.34-1.17 1.14-1.17 2.78s1.2 3.23 1.37 3.45c.17.22 2.31 3.7 5.69 5.04 2.81 1.11 3.38.89 3.99.83.61-.06 1.96-.8 2.24-1.57.28-.77.28-1.43.2-1.57-.08-.14-.31-.22-.64-.39-.34-.17-1.96-.97-2.26-1.08-.31-.11-.53-.17-.75.17-.22.34-.86 1.08-1.06 1.3-.2.22-.39.25-.72.08-.34-.17-1.42-.52-2.7-1.66-1-.89-1.67-1.99-1.86-2.33-.2-.34-.02-.52.15-.69.15-.15.34-.39.5-.58.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.58-.08-.17-.72-1.79-1.01-2.46Z"
            fill="white"
          />
        </svg>
      </a>
    </div>
  );
}