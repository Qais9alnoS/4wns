import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0a08',
        'bg-soft': '#131110',
        panel: '#171412',
        cream: '#ECDFC6',
        'cream-dim': '#a89c84',
        gold: '#b48d57',
        'gold-light': '#d9bb84',
        brick: '#7a3226',
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
        display: ['var(--font-lalezar)', 'var(--font-cairo)', 'sans-serif'],
        marker: ['var(--font-jomhuria)', 'var(--font-lalezar)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
