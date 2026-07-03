/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f6fb',
          100: '#e6eaf3',
          200: '#c7d0e3',
          300: '#9aa9c8',
          400: '#6779a3',
          500: '#465684',
          600: '#333f68',
          700: '#252e4f',
          800: '#161c33',
          900: '#0d1122',
        },
        brass: {
          50: '#fbf6ea',
          100: '#f3e7c8',
          200: '#e6cd8f',
          300: '#d7b25c',
          400: '#c9a15c',
          500: '#b8863a',
          600: '#956b2c',
          700: '#725122',
        },
        paper: '#fbf8f3',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 45px -15px rgba(13, 17, 34, 0.35)',
        soft: '0 8px 24px -8px rgba(13, 17, 34, 0.18)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
