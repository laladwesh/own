/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#050410",
        secondary: "#a855f7",
        dimWhite: "rgba(255, 255, 255, 0.7)",
        dimBlue: "rgba(168, 85, 247, 0.1)",
        // bespoke violet ramp + accents
        ink: {
          900: "#050410",
          800: "#08061a",
          700: "#0c0a20",
          600: "#110d2b",
          500: "#171036",
        },
        violet: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        accent: "#a855f7", // restrained violet accent (was fuchsia)
        cyanGlow: "#8b5cf6", // violet (was cyan)
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        display: ["'Space Grotesk'", "Poppins", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(168, 85, 247, 0.45)",
        "glow-lg": "0 0 80px -12px rgba(168, 85, 247, 0.55)",
        "glow-fuchsia": "0 0 50px -10px rgba(168, 85, 247, 0.4)",
        card: "0 24px 80px -24px rgba(0, 0, 0, 0.8)",
        "inner-top": "inset 0 1px 0 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        "grid-violet":
          "linear-gradient(to right, rgba(168,85,247,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.08) 1px, transparent 1px)",
        "dot-violet":
          "radial-gradient(rgba(168,85,247,0.18) 1px, transparent 1px)",
        "shine":
          "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
        "violet-conic":
          "conic-gradient(from 180deg at 50% 50%, #2e1065 0deg, #7c3aed 90deg, #e879f9 180deg, #a855f7 270deg, #2e1065 360deg)",
      },
      keyframes: {
        "aurora-drift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(4%, -6%, 0) scale(1.1)" },
          "66%": { transform: "translate3d(-5%, 4%, 0) scale(0.95)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-22px) rotate(3deg)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "border-spin": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "aurora-drift": "aurora-drift 18s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        "spin-slow": "spin-slow 24s linear infinite",
        shimmer: "shimmer 2.5s infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        marquee: "marquee 38s linear infinite",
        "border-spin": "border-spin 5s linear infinite",
      },
    },
    screens: {
      xs: "480px",
      ss: "620px",
      sm: "768px",
      md: "1060px",
      lg: "1200px",
      xl: "1700px",
    },
  },
  plugins: [],
};
