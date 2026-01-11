/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,njk,js}',
    './src/**/*.md'
  ],
  theme: {
    extend: {
      colors: {
        'd2r': {
          unique: '#a59263',
          set: '#00ff00',
          rare: '#ffff00',
          magic: '#4169e1',
          crafted: '#ff8000',
        }
      }
    },
  },
  plugins: [],
}
