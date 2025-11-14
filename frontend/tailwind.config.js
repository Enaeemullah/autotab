/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#dc2626',
            dark: '#991b1b',
            light: '#fee2e2'
          },
          accent: '#f97316'
        }
      }
  },
  plugins: []
};
