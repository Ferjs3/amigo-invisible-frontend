/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-dim": "var(--surface-dim)",
        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        accent: "var(--accent)",
        "accent-dark": "var(--accent-dark)",
        success: "var(--success)",
        "success-dark": "var(--success-dark)",
        danger: "var(--danger)",
        "danger-dark": "var(--danger-dark)",
      },
    },
  },
  plugins: [],
};