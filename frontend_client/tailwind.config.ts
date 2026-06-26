

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '96rem', // 1536px
      },
      colors: {
        primary: {
          DEFAULT: '#646cff',
        },
        secondary: {
          DEFAULT: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#f59e0b',
        },
        muted: {
          DEFAULT: '#6b7280',
        },
        background: {
          DEFAULT: '#f9f9f9',
        },
        dark: {
          DEFAULT: '#242424',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}