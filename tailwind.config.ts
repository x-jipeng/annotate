import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#04070f',
          secondary: '#080e1c',
          tertiary: '#0c1525',
          card: '#101d30',
        },
        cyan: {
          DEFAULT: '#00d4f5',
          dim: 'rgba(0,212,245,0.12)',
          glow: 'rgba(0,212,245,0.25)',
          muted: 'rgba(0,212,245,0.06)',
        },
        accent: {
          orange: '#ff6b35',
          green: '#00e676',
          purple: '#b47ee5',
          yellow: '#ffd54f',
          red: '#ef5350',
        },
        sport: {
          basketball: '#ff7043',
          football: '#66bb6a',
          tennis: '#29b6f6',
          baseball: '#ce93d8',
          badminton: '#ffd54f',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Orbitron', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'blink': 'blink 0.6s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
