export default {
  darkMode: 'class', // AKTIFKAN DARK MODE
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DARK THEME (Default)
        'dashboard-bg': '#0B0B1E',
        'card-bg': '#161630',
        'accent': '#6C5DD3',
        'accent-hover': '#5b4eb5',
        'text-main': '#FFFFFF',
        'text-muted': '#808191',
        'success': '#4ADE80',
        'danger': '#F87171',
        
        // LIGHT THEME
        'light': {
          'dashboard-bg': '#F5F7FA',
          'card-bg': '#FFFFFF',
          'text-main': '#1A1A1A',
          'text-muted': '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}