/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        muted: "#667085",
        brand: "#5B4DFF",
        aqua: "#11B9AD",
        sun: "#FFB547",
        surface: "#F7F8FC",
      },
    },
  },
  plugins: [],
};

