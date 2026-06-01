/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      colors: {
        gold: {
          100: '#f9f5eb',
          200: '#efe6d0',
          300: '#e2cfb0',
          400: '#d1b084',
          500: '#c29662',
          600: '#a6794b',
        },
        navy: {
          800: '#1e3a34',
          900: '#0f201b',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e3ebe7',
          200: '#c5d6ce',
          300: '#9eb8ad',
          400: '#7d9a8d',
          500: '#5e7d71',
          800: '#2d4039',
          900: '#25332f',
        },
      },
      backgroundImage: {
        'forest-gradient': 'linear-gradient(135deg, #0f201b 0%, #1c3b33 100%)',
        'sage-gradient': 'linear-gradient(to right, #f4f7f5, #eef5f2)',
        'luxury-green': 'linear-gradient(to right, #11241f, #203e35)',
      },
    },
  },
  plugins: [],
};
