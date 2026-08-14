/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // The page is cold on purpose. The only warm colour in the product is
        // the coffee itself, and it lives inside the 3D canvases (see
        // src/three/materials.ts). Nothing in the UI chrome may use roast or
        // crema — that rule is what makes the drinks read as the warm object.
        mist: '#E7EAE4', // page ground — fog on the Doi Chang ridge at 6am
        paper: '#F3F5F0', // raised surfaces
        ink: '#131E18', // primary type
        moss: '#55665B', // secondary type, labels
        line: '#C9CFC3', // hairlines
        cherry: '#C2371C', // the one hot accent: coffee cherry, live state, CTAs
        'cherry-dim': '#8E2814',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'Georgia', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // one scale, used everywhere
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        data: ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
      },
      borderRadius: {
        card: '0.125rem',
      },
      transitionTimingFunction: {
        settle: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(0.75rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        'pulse-ring': 'pulse-ring 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}
