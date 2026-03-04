/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './Screens/**/*.{js,jsx,ts,tsx}',
    './Navigations/**/*.{js,jsx,ts,tsx}',],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#161622',
        pink: '#f687b3',
      },
    },
  },
  plugins: [],
};
