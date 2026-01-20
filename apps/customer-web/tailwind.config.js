/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    
    // 👇 CRITICAL: This line fixes the "nonsense" unstyled look
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {
      // Added your specific footer colors here for global reuse
      colors: {
        brand: {
          dark: "#052e16",   // The dark green background/text
          mint: "#4ade80",   // The bright mint icons
          light: "#f0fdf4",  // The light hover background
          border: "#86efac", // The light green borders
        }
      }
    },
  },
  plugins: [],
}