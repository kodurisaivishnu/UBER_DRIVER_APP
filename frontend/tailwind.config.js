/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  important: '#root',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        uber: {
          black: '#000000',
          blue: '#276EF1',
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E8ECF0',
            400: '#AFAFAF',
            600: '#6B6B6B',
            800: '#333333',
          },
        },
      },
    },
  },
  plugins: [],
};
