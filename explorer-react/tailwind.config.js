/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#f0f0f0',
        card: {
          DEFAULT: '#1a1a1a',
          foreground: '#f0f0f0'
        },
        popover: {
          DEFAULT: '#1a1a1a',
          foreground: '#f0f0f0'
        },
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#262626',
          foreground: '#a3a3a3'
        },
        muted: {
          DEFAULT: '#262626',
          foreground: '#737373'
        },
        accent: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff'
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff'
        },
        border: '#262626',
        input: '#262626',
        ring: '#3b82f6',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: [],
}