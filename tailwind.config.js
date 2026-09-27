/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0a0a0f",
        surface: "#12121a",
        glass: "rgba(255,255,255,0.05)",
        accent: {
          DEFAULT: "#7c5cff",
          soft: "#a78bfa"
        }
      },
      backdropBlur: { xs: "2px" },
      boxShadow: {
        glow: "0 0 40px -10px rgba(124,92,255,0.5)"
      }
    }
  },
  plugins: []
};
