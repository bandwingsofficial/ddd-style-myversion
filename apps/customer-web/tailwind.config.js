/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#00A300",
          dark: "#004700",
          price: "#004700",
          discount: "#FF0000",
          trending: "#FFC800",
          outlet: "#004700",
        },
        ink: {
          primary: "#111827",
          muted: "#6B7280",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          border: "#E5E7EB",
          unit: "#F3F4F6",
        },
      },
      borderRadius: {
        card: "0.75rem",
        button: "0.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(17 24 39 / 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
