/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef0ff',
          100: '#dde1ff',
          200: '#bcc6ff',
          300: '#91a0ff',
          400: '#6b78fc',
          500: '#5865f2',  // Discord Blurple — primary
          600: '#4752d4',
          700: '#3740b0',
          800: '#2e358e',
          900: '#1a1b4b',
          950: '#0f1029',
        },
        surface: {
          // Dark mode surfaces — navy feel like Discord
          900: '#16182a',
          800: '#1e2035',
          700: '#252840',
          600: '#2d3158',
          500: '#383c6e',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #5865f2 0%, #8b5cf6 100%)',
        'brand-gradient-warm': 'linear-gradient(135deg, #5865f2 0%, #7c6af7 50%, #a855f7 100%)',
        'hero-light': 'linear-gradient(135deg, #5865f2 0%, #7c6af7 40%, #a855f7 100%)',
        'hero-dark': 'linear-gradient(135deg, #1a1b4b 0%, #252840 40%, #3b1e6e 100%)',
      },
    },
  },
  plugins: [],
};
