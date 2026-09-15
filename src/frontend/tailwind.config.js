/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
          primary: "#000666",
          "primary-dark": "#1A237E",
          secondary: "#FF9933",
          accent: "#10B981",
          "accent-alt": "#FE9832",
          background: "#F7F9FB",
      },
      fontFamily: {
          sans: ['Inter', 'sans-serif'],
          heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
          'float': 'float 3s ease-in-out infinite',
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
          float: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
          }
      }
    },
  },
  plugins: [],
}
