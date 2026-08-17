/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFAF0',
          100: '#FFF5EE',
          200: '#FFE4E1',
        },
        blush: {
          50: '#FFF0F5',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
        },
        pastel: {
          pink: '#FFB6C1',
          rose: '#B76E79',
          coral: '#FF6F61',
          gold: '#FFD700',
          champagne: '#F7E7CE',
        },
        brown: {
          text: '#5C4033',
          muted: '#8C7265',
          dark: '#3D281D',
        }
      },
      fontFamily: {
        cute: ['"Zen Maru Gothic"', '"M PLUS Rounded 1c"', '"Quicksand"', 'sans-serif'],
        heading: ['"Quicksand"', '"Zen Maru Gothic"', 'sans-serif'],
        body: ['"Zen Maru Gothic"', '"Noto Sans TC"', 'sans-serif'],
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        }
      },
      boxShadow: {
        'soft-pink': '0 12px 36px rgba(255, 182, 193, 0.35)',
        'rose-glow': '0 0 25px rgba(255, 111, 97, 0.4)',
        'card-bouncy': '0 10px 25px -5px rgba(183, 110, 121, 0.15), 0 8px 10px -6px rgba(183, 110, 121, 0.1)',
      }
    },
  },
  plugins: [],
}
