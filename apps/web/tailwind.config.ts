import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Console design system (design/CGPU-MAX UI Reference.dc.html) ──
        // Surfaces
        ground: '#0B0C0F',
        panel: '#14161A',
        'panel-2': '#0E1013',
        'panel-3': '#1B1E23',
        hairline: 'rgba(255,255,255,0.07)',
        // Accents (alpha-value channel so bg-lime/15 etc. work)
        lime: 'oklch(0.78 0.17 152 / <alpha-value>)',
        'lime-bright': 'oklch(0.86 0.14 152 / <alpha-value>)',
        'lime-ink': '#07130d',
        cblue: 'oklch(0.70 0.15 250 / <alpha-value>)',
        'cblue-bright': 'oklch(0.80 0.12 250 / <alpha-value>)',
        camber: 'oklch(0.80 0.15 75 / <alpha-value>)',
        'camber-bright': 'oklch(0.85 0.13 75 / <alpha-value>)',
        cred: 'oklch(0.65 0.19 25 / <alpha-value>)',
        // Text tiers
        ink: {
          hi: '#FFFFFF',
          DEFAULT: '#E8EAED',
          mid: '#B4BAC2',
          muted: '#9BA2AB',
          faint: '#8A9099',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        control: '8px',
        card: '12px',
        panel: '14px',
        pill: '999px',
      },
      letterSpacing: {
        label: '0.12em',
      },
      transitionDuration: {
        DEFAULT: '250ms',
      },
      transitionTimingFunction: {
        console: 'cubic-bezier(.2,.7,.2,1)',
      },
    },
  },
  plugins: [],
};

export default config;
