export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0A74DA',
        teal: '#00AFA3',
        accent: '#83b735',
      },
      fontFamily: {
        sans: ['Lato', 'Outfit', 'Arial', 'sans-serif'],
        display: ['Poppins', 'Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        wd: '15px',
      },
    },
  },
  plugins: [],
}
