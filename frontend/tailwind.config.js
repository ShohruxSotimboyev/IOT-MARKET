export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        primary: '#0A74DA',
        teal: '#00AFA3',
        accent: '#83b735',
      },
      fontFamily: {
        sans: ['Outfit', 'Lato', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Poppins', 'Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        wd: '15px',
      },
    },
  },
  plugins: [],
}
