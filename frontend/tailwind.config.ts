import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0e0e0e',
          soft: '#1a1a1a',
          muted: '#2a2a2a',
        },
        bone: {
          DEFAULT: '#f5f0e8',
          soft: '#ede8df',
          muted: '#d9d3c7',
        },
        amber: {
          chess: '#c9a84c',
          light: '#e8c97a',
          dark: '#9a7530',
        },
        signal: {
          blunder: '#e05252',
          mistake: '#e09052',
          inaccuracy: '#e0c852',
          good: '#52b052',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
