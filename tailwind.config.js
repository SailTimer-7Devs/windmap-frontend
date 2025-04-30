/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true
  },
  dataAttributes: ['hover', 'open', 'focus', 'closed']
}