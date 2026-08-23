/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#843d96",
          50: "#faf5fc",
          100: "#f3e8f8",
          200: "#e9d5f2",
          300: "#d7b4e6",
          400: "#bd88d5",
          500: "#9f5ec0",
          600: "#843d96",
          700: "#6d307d",
          800: "#5a2966",
          900: "#4b2454",
        },
        "on-primary": "#ffffff",
        "primary-container": "#f3d9fa",
        "on-primary-container": "#4a1257",
        secondary: {
          DEFAULT: "#6b5876",
          50: "#f8f6f9",
          100: "#ede7f0",
          500: "#6b5876",
          700: "#4f3e58",
        },
        surface: "#faf8fc",
        "on-surface": "#1a161d",
        "on-surface-variant": "#584e5b",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
        full: "9999px",
      },
      spacing: {
        xl: "80px",
        "container-max": "1320px",
        gutter: "24px",
        "margin-mobile": "16px",
      },
      fontFamily: {
        headline: ["Outfit", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        label: ["Plus Jakarta Sans", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        editorial: ["'Cormorant Garamond'", "'Playfair Display'", "serif"],
      },
      boxShadow: {
        glass: "0 20px 40px -15px rgba(132, 61, 150, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8)",
        "glass-lg": "0 25px 50px -12px rgba(132, 61, 150, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9)",
        "glass-glow": "0 0 30px -5px rgba(147, 51, 234, 0.3)",
        ambient: "0 20px 40px -10px rgba(132, 61, 150, 0.07)",
      },
      maxWidth: {
        "container-max": "1320px",
      },
    },
  },
  plugins: [],
}
