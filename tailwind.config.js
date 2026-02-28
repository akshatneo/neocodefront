// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4C6FFF",   // modern blue
          light: "#88A3FF",
          dark: "#2741CC",
        },
        accent: {
          DEFAULT: "#00D3A9",   // mint-teal pop
          light: "#5FF4D7",
          dark: "#00A387",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          500: "#6B7280",
          700: "#374151",
          900: "#111827",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F5F7FA",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.06)",
      }
    },
  },
  plugins: [],
};