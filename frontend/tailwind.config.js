/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2ff',
          100: '#f5d8ff',
          200: '#edc0ff',
          300: '#e29cff',
          400: '#d275ff',
          500: '#b84dec',
          600: '#9c3cd0',
          700: '#7f33ac'
        },
        pastel: {
          rose: '#ffe4f0',
          mint: '#e6fff1',
          peach: '#fff1e4',
          sky: '#e8f4ff',
          butter: '#fff7d6'
        }
      },
      boxShadow: {
        soft: '0 20px 70px -30px rgba(99, 102, 241, 0.18)'
      }
    }
  },
  plugins: []
};
