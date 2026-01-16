/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"]
      },
      colors: {
        greyDark: "#2a2e36",
        grey: "#3a3f4b",
        greyLight: "#5a6172",
        pink: "#e84393",
        purple: "#9b59b6"
      }
    },
  },
  plugins: [],
}
