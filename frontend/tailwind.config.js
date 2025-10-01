/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Node type colors from design tokens
        outcome: {
          light: {
            bg: '#E3F2FD',
            border: '#1976D2',
            text: '#0D47A1',
          },
          dark: {
            bg: '#1A237E',
            border: '#42A5F5',
            text: '#E3F2FD',
          },
        },
        opportunity: {
          light: {
            bg: '#F3E5F5',
            border: '#7B1FA2',
            text: '#4A148C',
          },
          dark: {
            bg: '#4A148C',
            border: '#BA68C8',
            text: '#F3E5F5',
          },
        },
        solution: {
          light: {
            bg: '#E8F5E9',
            border: '#388E3C',
            text: '#1B5E20',
          },
          dark: {
            bg: '#1B5E20',
            border: '#66BB6A',
            text: '#E8F5E9',
          },
        },
        experiment: {
          light: {
            bg: '#FFF3E0',
            border: '#F57C00',
            text: '#E65100',
          },
          dark: {
            bg: '#E65100',
            border: '#FFB74D',
            text: '#FFF3E0',
          },
        },
      },
    },
  },
  plugins: [],
};

