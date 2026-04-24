/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        seal: {
          dark: { bg: '#1A1A2E', text: '#E0E0E0', accent: '#7EC8E3' },
          light: { bg: '#FAF3E0', text: '#2C3E50', accent: '#5B9BD5' },
          sepia: { bg: '#F5E6CA', text: '#5C4033', accent: '#D4956A' },
          ocean: { bg: '#0D1B2A', text: '#B8D4E3', accent: '#48CAE4' },
          mint: { bg: '#E8F5E9', text: '#2E7D32', accent: '#66BB6A' },
          hc: { bg: '#121212', text: '#FFFFFF', accent: '#BB86FC' },
        },
      },
      fontFamily: {
        'atkinson': ['Atkinson-Hyperlegible'],
        'dyslexic': ['OpenDyslexic-Regular'],
        'lexend': ['Lexend-Regular'],
        'mono': ['RobotoMono-Regular'],
      },
      borderRadius: {
        'seal': '1.5rem',
      },
    },
  },
  plugins: [],
};
