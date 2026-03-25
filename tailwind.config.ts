/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          dark: '#1A2B4A',
          accent: '#0D9488',
        },
        program: {
          vidhai: '#0D9488',
          mentorship: '#7C3AED',
          hostels: '#F59E0B',
          fellowship: '#EF4444',
        },
        health: {
          good: '#10B981',
          medium: '#F59E0B',
          poor: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
}
