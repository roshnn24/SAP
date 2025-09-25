/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f0f23',
          surface: '#1a1a2e',
          card: '#16213e',
          border: '#2d3748',
          text: '#e2e8f0',
          muted: '#a0aec0',
          accent: '#4299e1',
          success: '#48bb78',
          warning: '#ed8936',
          error: '#f56565'
        }
      }
    },
  },
  plugins: [],
}





