/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        secondary:  'var(--color-secondary)',
        background: 'var(--color-background)',
        surface:    'var(--color-surface)',
        border:     'var(--color-border)',
        text:       'var(--color-text)',
        muted:      'var(--color-text-muted)',
        success:    'var(--color-success)',
        warning:    'var(--color-warning)',
        error:      'var(--color-error)',
      },
    },
  },
  plugins: [],
};
