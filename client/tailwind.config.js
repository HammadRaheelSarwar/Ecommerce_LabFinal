/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: {
          DEFAULT: '#050505',
          premium: '#0D0D0D',
          surface: '#151515',
          card: '#1A1A1A',
          lighter: '#222222',
        },
        markaz: {
          dark: '#083820',
          forest: '#0c5a37',
          green: '#0e6f43',
          emerald: '#107c4b',
          mint: '#00b884',
          mintHover: '#00a375',
          lightGreen: '#e6f7ef',
          cream: '#f8f6f0',
          creamLight: '#fbf9f5',
          border: '#e5e7eb',
        },
        gold: {
          DEFAULT: '#D4AF37',
          premium: '#C9A227',
          soft: '#E6C76A',
          muted: '#A08020',
          light: '#F0D878',
        },
        gray: {
          luxury: '#B8B8B8',
          mid: '#888888',
          dark: '#444444',
          darker: '#333333',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['7rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'headline': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.7s ease forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #C9A227 50%, #E6C76A 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, #1A1A1A 25%, #252525 50%, #1A1A1A 75%)',
      },
    },
  },
  plugins: [],
}
