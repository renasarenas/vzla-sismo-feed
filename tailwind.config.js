/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Editorial surface system — cool neutral "paper", not warm cream.
        paper: {
          DEFAULT: '#F4F4F2',
          dark: '#0D0D0D',
        },
        panel: {
          DEFAULT: '#FFFFFF',
          dark: '#161616',
        },
        ink: {
          DEFAULT: '#17171A',
          dark: '#E9E9E6',
          muted: '#6B6B66',
          'muted-dark': '#9A9A93',
        },
        rule: {
          DEFAULT: '#E2E1DC',
          dark: '#2A2B31',
          strong: '#1C1C1F',
        },
        // Single institutional accent — used as an alert rule and live status only.
        crisis: {
          red: '#CF1020',
          'red-light': '#DC2626',
          'red-dark': '#8A0E15',
          'red-darker': '#6B0B11',
          amber: '#B45309',
          blue: '#1D4ED8',
          'blue-light': '#2563EB',
        },
        // Back-compat aliases for components not yet migrated off the old tokens.
        surface: {
          DEFAULT: '#F4F4F2',
          dark: '#121317',
          elevated: '#FFFFFF',
          'elevated-dark': '#1A1B20',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      fontSize: {
        // Editorial display scale (serif). Tighter leading, real weights.
        'masthead': ['clamp(2.5rem, 5vw + 1rem, 4.75rem)', { lineHeight: '0.98', letterSpacing: '-0.02em', fontWeight: '600' }],
        'hero': ['clamp(2.25rem, 4vw + 1rem, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.015em', fontWeight: '600' }],
        'display': ['clamp(1.75rem, 2vw + 1rem, 2.5rem)', { lineHeight: '1.08', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline': ['clamp(1.2rem, 1vw + 0.9rem, 1.5rem)', { lineHeight: '1.22', fontWeight: '600' }],
        'lead': ['clamp(1.05rem, 0.5vw + 0.95rem, 1.2rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.65' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        // Utility/eyebrow label (sans, tracked).
        'eyebrow': ['0.7rem', { lineHeight: '1.2', letterSpacing: '0.14em', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'prose': '68ch',
        '8xl': '88rem',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(20,19,17,0.04), 0 6px 16px rgba(20,19,17,0.05)',
        'lift': '0 2px 4px rgba(20,19,17,0.04), 0 12px 28px rgba(20,19,17,0.10)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'seismo': {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'seismo': 'seismo 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
