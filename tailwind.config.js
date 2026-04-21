/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10243e",
        mist: "#edf3f8",
        sky: "#d8ebf7",
        teal: "#0d9488",
        sand: "#f6f1e7",
        gold: "#d6a449",
      },
      boxShadow: {
        panel: "0 20px 45px -24px rgba(16, 36, 62, 0.38)",
      },
      fontFamily: {
        sans: ["'Manrope'", "ui-sans-serif", "system-ui"],
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui"],
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(216,235,247,0.95), rgba(237,243,248,0.8) 35%, rgba(255,255,255,0.92) 70%)",
      },
    },
  },
  plugins: [],
};
