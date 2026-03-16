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
          500: '#5865f2', 
          600: '#4752d4',
          700: '#3740b0',
          800: '#2e358e',
          900: '#1a1b4b',
          950: '#0f1029',
        },
      },
      letterSpacing: {
        'tightest': '-0.075em',
        'widest-xl': '0.5em',
        'premium': '0.15em',
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.5)',
        'premium': '0 0 50px -12px rgba(99, 102, 241, 0.25)',
        'glow-white': '0 0 40px rgba(255, 255, 255, 0.15)',
        'glow-indigo': '0 0 40px rgba(79, 70, 229, 0.15)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin-reverse 10s linear infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
};
