/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FFF8E7',
          light: '#FFFBF0',
        },
        pink: {
          100: '#FFE5E5',
          200: '#FFD6D6',
          300: '#FFB8B8',
          400: '#FF9F9F',
        },
        lavender: {
          100: '#E8E3FF',
          200: '#D4CAFF',
          300: '#B8A8FF',
          400: '#9B85FF',
          500: '#8269E6',
          600: '#7C5EDB',
        },
        blue: {
          100: '#E0F2FE',
          200: '#BAE6FD',
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        mint: {
          50: '#F0FDFA',
          100: '#E6FFFA',
          200: '#B2F5EA',
          300: '#81E6D9',
          400: '#4FD1C7',
          500: '#38B2AC',
          600: '#2C7A7B',
          700: '#2C7A7B',
        },
      },
      fontFamily: {
        'nunito': ['Nunito', 'sans-serif'],
        'poppins-rounded': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


