import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CGPU-MAX design tokens (Master Prompt section: UI/UX)
        primary: { bg: '#042C53' },
        accent: {
          blue: '#185FA5',
          coral: '#993C1D',
          purple: '#534AB7',
        },
        state: {
          success: '#0F6E56',
          warning: '#BA7517',
          danger: '#A32D2D',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0A0E1A',
        },
        text: {
          primary: '#042C53',
          secondary: '#5F5E5A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        card: '12px',
        pill: '999px',
      },
      letterSpacing: {
        label: '1.5px',
      },
      transitionDuration: {
        DEFAULT: '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
