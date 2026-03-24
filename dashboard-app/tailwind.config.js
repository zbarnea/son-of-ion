/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#08081a',
          900: '#0d0d1a',
          800: '#131326',
          700: '#1c1c2e',
          600: '#252545',
        },
        active: {
          orange: '#7c2d12',
          blue:   '#0c4a6e',
          green:  '#064e3b',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
