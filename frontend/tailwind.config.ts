import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
      },
      colors: {
        // ── semantic tokens (mapped to CSS vars) ──────────────────────────
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary:   { DEFAULT: "hsl(var(--primary))",    foreground: "hsl(var(--primary-foreground))"    },
        secondary: { DEFAULT: "hsl(var(--secondary))",  foreground: "hsl(var(--secondary-foreground))"  },
        destructive:{ DEFAULT: "hsl(var(--destructive))",foreground: "hsl(var(--destructive-foreground))"},
        muted:     { DEFAULT: "hsl(var(--muted))",      foreground: "hsl(var(--muted-foreground))"      },
        accent:    { DEFAULT: "hsl(var(--accent))",     foreground: "hsl(var(--accent-foreground))"     },
        popover:   { DEFAULT: "hsl(var(--popover))",    foreground: "hsl(var(--popover-foreground))"    },
        card:      { DEFAULT: "hsl(var(--card))",       foreground: "hsl(var(--card-foreground))"       },
        // ── brand palette ────────────────────────────────────────────────
        midnight: {
          50:  '#f0f0ff', 100: '#e4e4ff', 200: '#cccbff', 300: '#a9a4ff',
          400: '#8173ff', 500: '#6246ff', 600: '#5226ff', 700: '#4718eb',
          800: '#3b16c2', 900: '#31149c', 950: '#1e0c6a',
        },
        violet: {
          50:  '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        slate: {
          750: '#2a3349', 850: '#1a2235', 925: '#0f1729', 950: '#0a1020',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)",
      },
      backgroundImage: {
        'mesh-gradient': `
          radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99,70,255,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 55%),
          radial-gradient(ellipse 70% 60% at 50% -10%, rgba(81,115,255,0.08) 0%, transparent 50%)
        `,
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'violet-gradient': 'linear-gradient(135deg, hsl(var(--primary)) 0%, #7c3aed 100%)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(139,92,246,0.25)',
        'glow':     '0 0 24px rgba(139,92,246,0.35)',
        'glow-lg':  '0 0 48px rgba(139,92,246,0.4)',
        'card':     '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
        'inset-border': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.5' },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        shimmer:          'shimmer 2s linear infinite',
        'fade-up':        'fade-up 0.4s ease-out',
        'fade-in':        'fade-in 0.3s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
