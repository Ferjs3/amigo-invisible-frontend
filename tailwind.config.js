/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        plum: "#2B1830",
        "plum-dark": "#1D1022",
        paper: "#F3ECDD",
        "paper-dim": "#E9DFC8",
        ink: "#2B1830",
        "ink-soft": "#5B4A5F",
        gold: "#C9A227",
        "gold-dark": "#8C6F16",
        pine: "#3F6C51",
        "pine-dark": "#28472F",
        coral: "#C9634A",
        "coral-dark": "#8C4130",
      },
    },
  },
  plugins: [],
};
