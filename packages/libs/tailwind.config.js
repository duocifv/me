/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // Custom colors
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Merriweather", "ui-serif", "serif"],
      },
      spacing: {
        // Custom spacing
        96: "24rem",
        128: "32rem",
      },
      borderRadius: {
        // Custom radius
        "4xl": "2rem",
      },
      boxShadow: {
        // Custom shadows
        soft: "0 2px 15px rgba(0,0,0,0.1)",
        strong: "0 4px 30px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
