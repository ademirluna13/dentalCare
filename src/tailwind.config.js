/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Estas son nuestras variables "mágicas"
          sidebar: 'var(--sidebar-bg)',
          main: 'var(--main-bg)',
          accent: 'var(--accent)',
          text: 'var(--text-primary)',
          card: 'var(--card-bg)',
          "card-text": 'var(--card-text)',
        }
      },
      // Si quieres que las fuentes también cambien con el tema
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}