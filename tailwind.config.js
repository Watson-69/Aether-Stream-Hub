/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crust: 'var(--bg-crust)',
        mantle: 'var(--bg-mantle)',
        card: 'var(--bg-card)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'accent-primary': 'var(--accent-primary)',
        'accent-highlight': 'var(--accent-highlight)',
        'border-color': 'var(--border-color)',

        bg: 'var(--bg-crust)',
        'panel-bg': 'var(--bg-mantle)',
        'card-bg': 'var(--bg-card)',
        border: 'var(--border-color)',
        'border-focus': 'var(--accent-primary)',
        fg: 'var(--text-main)',
        primary: 'var(--accent-primary)',
        'primary-hover': 'var(--accent-primary)',
        secondary: 'var(--accent-highlight)',
        'secondary-hover': 'var(--accent-highlight)',
        accent: 'var(--accent-highlight)',
        subtext: 'var(--text-muted)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
      },
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'tile': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'tile-glow': '0 0 15px -3px var(--accent-primary)',
        'window': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
