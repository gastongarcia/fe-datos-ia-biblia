import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#f4efe5',
        ink: '#1f1f1d',
        ember: '#b43c19',
        sky: '#1f5e7a',
        moss: '#314f3f'
      },
      boxShadow: {
        soft: '0 20px 50px rgba(0, 0, 0, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
