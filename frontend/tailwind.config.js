/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './mockups/**/*.html'],
  theme: {
    extend: {
      colors: {
        noc: {
          bg: '#05070b',
          panel: '#0b1220',
          panelAlt: '#111a2b',
          edge: '#1d3b6e',
          accent: '#22d3ee',
          warn: '#f59e0b',
          danger: '#ef4444',
          ok: '#10b981'
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.2), 0 0 24px rgba(34,211,238,0.18)'
      }
    }
  },
  plugins: []
};
