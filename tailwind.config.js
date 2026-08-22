/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#24231F', brand: '#665C51', mist: '#F4F3F0', moss: '#52665A', sand: '#E3E0D9', charcoal: '#3A3934' },
      boxShadow: { card: '0 1px 2px rgba(36, 35, 31, 0.05), 0 8px 24px rgba(36, 35, 31, 0.035)', soft: '0 18px 42px rgba(36, 35, 31, 0.12)' },
    },
  },
  plugins: [],
};
