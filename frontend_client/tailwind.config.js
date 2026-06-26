/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      firetest: '#ff0000',
      colors: {
        primary: '#646cff',
        secondary: '#1a1a1a',
        accent: '#f59e0b',
        muted: '#6b7280',
        background: '#f9f9f9',
        dark: '#242424',
        green: '#38ce3c',
      },
      fontFamily: {
        sans: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
