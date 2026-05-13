/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Semantic (CSS-var) tokens — kept for existing components */
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        ring:   'var(--ring)',

        /* ── Tours North hard-coded brand tokens ── */
        /* ── Tours North 'Authority Hub' Brand Tokens ── */
        tn: {
          navy:    '#0B213F', // Primary Dark Navy
          glacier: '#89B5DA', // Secondary Blue
          safety:  '#f97316', // Accent
          red:     '#b91c1c',
          slate:   '#F1F5F9', // Light backgrounds
          muted:   '#94A3B8', // Muted text
        },
      },
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        syne:  ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
