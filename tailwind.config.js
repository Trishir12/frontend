/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#ffffff",
        muted: "#f8f8f8",
        border: "#e0e0e0",
        brand: {
          DEFAULT: "#008080",
          soft: "#0f9d9d",
        },
      },
    },
  },
  plugins: [],
};
