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
        tn: {
          green:  '#064e3b',
          red:    '#b91c1c',
          'red-dk': '#991b1b',
          lime:   '#a3e635',
          navy:   '#0f172a',
          'green-dk': '#022c22',
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
