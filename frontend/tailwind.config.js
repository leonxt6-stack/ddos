/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cyber-black': '#020202',
        'cyber-gray': '#0a0a0a',
        'neon-blue': '#00f3ff',
        'neon-red': '#ff003c',
        'neon-amber': '#fbbf24',
        'neon-green': '#00ff9d',
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        'ibm-plex': ['IBM Plex Sans', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
        },
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0, 243, 255, 0.5)',
        'neon-red': '0 0 15px rgba(255, 0, 60, 0.5)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
