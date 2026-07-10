/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yamboly: {
          cyan: '#29B6E8',       // Azul cian principal
          cyanLight: '#7FDBFF',  // Cian claro
          magenta: '#E6007E',    // Rosa/magenta vibrante
          yellow: '#FFD400',     // Amarillo
          purple: '#4B2E83',     // Púrpura oscuro
          purpleLight: '#7B5EA7',// Púrpura medio
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        baloo: ['"Baloo 2"', 'cursive'],
      }
    },
  },
  plugins: [],
}