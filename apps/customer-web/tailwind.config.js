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
          dark: "#15803d",  // green-700
          DEFAULT: "#16a34a", // green-600 (Primary Action)
          light: "#22c55e",   // green-500
          surface: "#f0fdf4", // green-50
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Ensure you have Inter or a nice sans font
      }
    },
  },
  plugins: [],
}