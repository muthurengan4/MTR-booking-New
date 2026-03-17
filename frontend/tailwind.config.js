/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        background: 'var(--color-background)', /* gray-50 / dark-green-950 */
        foreground: 'var(--color-foreground)', /* gray-900 / gray-200 */
        primary: {
          DEFAULT: 'var(--color-primary)', /* green-800 / green-600 */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* brown / lighter brown */
          foreground: 'var(--color-secondary-foreground)', /* white */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* orange / lighter orange */
          foreground: 'var(--color-accent-foreground)', /* white */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* red-700 / red-600 */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* warm-gray-50 / dark-green-800 */
          foreground: 'var(--color-muted-foreground)', /* gray-600 / gray-400 */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* warm-gray-50 / dark-green-900 */
          foreground: 'var(--color-card-foreground)', /* gray-800 / gray-300 */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* warm-gray-50 / dark-green-900 */
          foreground: 'var(--color-popover-foreground)', /* gray-800 / gray-300 */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* green-600 / green-500 */
          foreground: 'var(--color-success-foreground)', /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* yellow-600 / yellow-500 */
          foreground: 'var(--color-warning-foreground)', /* black */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* red-700 / red-600 */
          foreground: 'var(--color-error-foreground)', /* white */
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['Crimson Text', 'serif'],
        body: ['Source Sans 3', 'sans-serif'],
        caption: ['Nunito Sans', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(45, 80, 22, 0.12)',
        'DEFAULT': '0 4px 8px rgba(45, 80, 22, 0.12)',
        'md': '0 6px 12px rgba(45, 80, 22, 0.15)',
        'lg': '0 12px 24px rgba(45, 80, 22, 0.18)',
        'xl': '0 20px 40px rgba(45, 80, 22, 0.21)',
        '2xl': '0 32px 64px -16px rgba(45, 80, 22, 0.24)',
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.26, 0.64, 1)',
      },
      zIndex: {
        'dropdown': '50',
        'navigation': '100',
        'modal': '200',
        'notification': '300',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}