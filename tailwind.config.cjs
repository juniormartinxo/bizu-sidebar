/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1014",
        panel: "#121a20",
        line: "#22323d",
        accent: "#4fd1b5",
        accentSoft: "#12352e",
        warn: "#f59e0b",
        danger: "#f87171"
      },
      boxShadow: {
        shell: "0 24px 80px rgba(0, 0, 0, 0.38)",
        panel: "0 18px 48px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};
