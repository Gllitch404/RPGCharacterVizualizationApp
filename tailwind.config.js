/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          dark: '#0d0f14',
          panel: '#151921',
          card: '#1c222e',
          border: '#2a3346',
          gold: '#f59e0b',
          glow: '#38bdf8'
        }
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6)) brightness(1.05)' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.9)) brightness(1.15)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}

