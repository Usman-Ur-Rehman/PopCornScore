/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ps-bg':       '#0d0d0d',
        'ps-card':     '#141414',
        'ps-elevated': '#1e1e1e',
        'ps-border':   '#2a2a2a',
        'ps-red':      '#e50914',
        'ps-red-dark': '#b20710',
        'ps-gold':     '#f5c518',
        'ps-text':     '#e5e5e5',
        'ps-muted':    '#999999',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
