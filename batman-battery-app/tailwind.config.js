/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12151C',
        surface: '#1E232C',
        mist: '#E8EAED',
        fog: '#9AA1AC',
        signal: '#F5A623',
        alert: '#E85D4A',
        go: '#3FBF7F',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        beacon: 'beacon 2.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.35s ease-out both',
      },
      keyframes: {
        beacon: {
          '0%, 100%': {
            boxShadow:
              '0 0 20px 6px rgba(245,166,35,0.45), 0 0 60px 20px rgba(245,166,35,0.18)',
          },
          '50%': {
            boxShadow:
              '0 0 32px 12px rgba(245,166,35,0.65), 0 0 90px 36px rgba(245,166,35,0.28)',
          },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      minHeight: {
        dvh: '100dvh',
      },
      height: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [],
};
