/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#191919",
        paper: "#fbfbfa",
        line: "#e9e9e7",
        accent: "#2383e2",
      },
    },
  },
  plugins: [],
};
