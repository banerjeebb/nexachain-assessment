import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07080c',
        panel: 'rgba(20,22,32,0.72)',
        border: 'rgba(255,255,255,0.07)',
        'border-strong': 'rgba(255,255,255,0.12)',
        accent: '#a78bfa',
        'accent-d': '#8b6df0',
        cyan: '#22d3ee',
        pos: '#34d399',
        neg: '#fb7185',
        gold: '#e7b84a',
        warn: '#fbbf24',
        text: '#eceef6',
        'text-2': '#b7bbcc',
        dim: '#888da3',
        faint: '#585d72',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        panel: '24px',
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.07), 0 4px 32px rgba(0,0,0,0.4)',
        'accent-glow': '0 0 32px rgba(167,139,250,0.18)',
        'pos-glow': '0 0 32px rgba(52,211,153,0.18)',
        'neg-glow': '0 0 32px rgba(251,113,133,0.18)',
        'gold-glow': '0 0 32px rgba(231,184,74,0.18)',
        'cyan-glow': '0 0 32px rgba(34,211,238,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
