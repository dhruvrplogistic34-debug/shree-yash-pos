/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F1115',
          card: '#1A1D24',
          cardHover: '#232732',
          cardActive: '#2C3240',
          border: '#282C37',
          surface: '#15171E',
        },
        brand: {
          orange: '#F97316',
          orangeHover: '#EA580C',
          orangeLight: 'rgba(249, 115, 22, 0.15)',
          amber: '#F59E0B',
          veg: '#22C55E',
          vegLight: 'rgba(34, 197, 94, 0.15)',
          nonveg: '#EF4444',
          nonvegLight: 'rgba(239, 68, 68, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 20px -3px rgba(249, 115, 22, 0.35)',
        'glow-veg': '0 0 15px -3px rgba(34, 197, 94, 0.35)',
        'glow-nonveg': '0 0 15px -3px rgba(239, 68, 68, 0.35)',
        'drawer': '0 -10px 25px -5px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
};
