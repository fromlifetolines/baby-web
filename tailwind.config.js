/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#010828', // Deep Navy Background
          800: '#031042',
          700: '#061a5c',
        },
        neon: {
          DEFAULT: '#6FFF00', // Electric neon green
          glow: 'rgba(111, 255, 0, 0.5)',
          dim: 'rgba(111, 255, 0, 0.15)',
        },
        cream: {
          DEFAULT: '#EFF4FF', // Off-white
          muted: '#8EA3D7',   // Secondary muted
        }
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        condiment: ['Condiment', 'cursive'],
        body: ['Noto Sans TC', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 0.2s linear infinite',
        'screen-shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        }
      }
    },
  },
  plugins: [],
}
