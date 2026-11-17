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
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        background: {
          light: '#f5f7fa',
          dark: '#0f0f1a',
        },

        brand: {
          50:  '#f2faf5',
          100: '#e1f5e8',
          200: '#c5ebd3',
          300: '#9edcb6',
          400: '#6fc793',
          500: '#3eb073',
          600: '#2a975b',
          700: '#217749',
          800: '#1b5e3b',
          900: '#174e32',
          950: '#0a2b1b',
        },
        surface: {
          light: '#ffffff',
          dark:  '#131c17',
        },
        bg: {
          light: '#f5f9f6',
          dark:  '#0d1410',
        },
        card: {
          light: '#ffffff',
          dark:  '#16231d',
        },
        border: {
          light: '#e5e7eb',
          dark:  '#2a2a45',
        },
        text: {
          primary:   { light: '#111827', dark: '#f1f5f9' },
          secondary: { light: '#6b7280', dark: '#94a3b8' },
          muted:     { light: '#9ca3af', dark: '#64748b' },
        },
      },
      fontFamily: {
      sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card':      '0 2px 8px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-dark': '0 2px 8px 0 rgba(0,0,0,0.3), 0 1px 2px 0 rgba(0,0,0,0.2)',
        'brand':     '0 4px 20px 0 rgba(42,151,91,0.20)',
        'brand-lg':  '0 8px 32px 0 rgba(42,151,91,0.30)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in':     'fadeIn 0.2s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'slide-down':  'slideDown 0.3s ease-out',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
        'scale-in':    'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
