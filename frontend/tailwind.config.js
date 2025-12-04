export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // <--- INI WAJIB ADA
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-bg': '#0B0B1E',
        'card-bg': '#161630',
        'accent': '#6C5DD3',
        'accent-hover': '#5b4eb5',
        'text-main': '#FFFFFF',
        'text-muted': '#808191',
        'success': '#4ADE80',
        'danger': '#F87171',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}