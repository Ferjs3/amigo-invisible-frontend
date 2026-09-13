/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#2B1830",
        "canvas": "#1D1022",
        surface: "#F3ECDD",
        "surface-dim": "#E9DFC8",
        fg: "#2B1830",
        "fg-muted": "#5B4A5F",
        accent: "#C9A227",
        "accent-dark": "#8C6F16",
        success: "#3F6C51",
        "success-dark": "#28472F",
        danger: "#C9634A",
        "danger-dark": "#8C4130",
      },
    },
  },
  plugins: [],
};
