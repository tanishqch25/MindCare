/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#343923', muted: '#73745C',
        teal: { DEFAULT: '#6A6F34', 700: '#55582A' },
        mint: '#F3EAC3', sky: { DEFAULT: '#C4BF71', 700: '#716F32' },
        line: '#E7E2C9',
      },
      boxShadow: { soft: '0 8px 28px rgba(79, 78, 40, .07)' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
