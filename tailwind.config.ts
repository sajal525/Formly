import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        formly: {
          primary: "var(--formly-primary)",
          blue: "var(--formly-blue)",
          magenta: "var(--formly-magenta)",
        },
        ink: "var(--ink)",
        "body-text": "var(--body-text)",
        "page-bg": "var(--page-bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        "focus-ring": "var(--focus-ring)",
        success: "var(--success)",
        error: "var(--error)",
      },
      borderRadius: {
        card: "28px",
        input: "14px",
      },
      boxShadow: {
        card: "0 20px 50px -10px rgba(86, 59, 250, 0.08), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
        "card-dark": "0 20px 50px -10px rgba(0, 0, 0, 0.5), 0 10px 20px -5px rgba(0, 0, 0, 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
