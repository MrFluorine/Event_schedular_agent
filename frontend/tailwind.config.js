

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#f7f9fb',
        userBubble: '#DCF8C6',
        assistantBubble: '#E4E6EB',
      },
    },
  },
  plugins: [],
}