/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#ECE8DF",
        surface: "#E3DED2",
        line: "#C9C2B3",
        ink: "#1A1A1A",
        muted: "#666158",
        faint: "#9C968A",
        accent: "#1A1A1A",
        highlight: "#1A1A1A",
        white: "#ECE8DF",
        black: "#1A1A1A",
        gray: {
          50: "#1A1A1A", 100: "#1A1A1A", 200: "#1A1A1A", 300: "#1A1A1A", 400: "#666158",
          500: "#666158", 600: "#9C968A", 700: "#C9C2B3", 800: "#C9C2B3", 900: "#E3DED2",
        },
        dimWhite: "#666158",
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        display: ['"Clash Display"', '"JetBrains Mono"', "sans-serif"],
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