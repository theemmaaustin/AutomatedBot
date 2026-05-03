/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pink:    '#f72585',
        surface: '#0f0f0f',
        card:    '#111111',
        border:  '#1e1e1e',
        muted:   '#6b7280',
        green:   '#00d68f',
        red:     '#ff3d71',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
