module.exports = {
  mode: 'jit',
  content: [
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './layout/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'surface-dark': '#282f37',
        'surface-md-dark': '#252a30',
        dark: '#171717',
      },

      margin: {
        '20%': '20%',
        '25%': '25%',
        '33.33%': '33.33%',
        '50%': '50%',
      },
      minHeight: {
        '98px': '98px',
        '18rem': '18rem',
        '80vh': '80vh',
      },
      backgroundImage: {
        'login-gr': 'linear-gradient(to right, #2C3E50 , #000000)',
      },
      gridTemplateColumns: {
        '2:1': '2fr 1fr',
        'info-repo': '1fr 0.5fr 2fr',
      },
      fontFamily: {
        Poppins: 'Poppins, sans-serif',
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
