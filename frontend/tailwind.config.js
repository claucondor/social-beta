/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyber Theme Colors
        'cyber': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Resistance Theme
        'resistance': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Glitch Colors
        'glitch': {
          'primary': '#00ff41',
          'secondary': '#ff0080',
          'accent': '#ffff00',
          'warning': '#ff4500',
        },
        // Dark Theme
        'dark': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'mono': ['Fira Code', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out infinite alternate',
        'scan': 'scan 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'matrix': 'matrix 20s linear infinite',
        'typing': 'typing 1.5s steps(40, end)',
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-2px)' },
          '40%': { transform: 'translateX(2px)' },
          '60%': { transform: 'translateX(-1px)' },
          '80%': { transform: 'translateX(1px)' },
          '100%': { transform: 'translateX(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px theme("colors.glitch.primary"), 0 0 10px theme("colors.glitch.primary"), 0 0 15px theme("colors.glitch.primary")' 
          },
          '50%': { 
            boxShadow: '0 0 10px theme("colors.glitch.primary"), 0 0 20px theme("colors.glitch.primary"), 0 0 30px theme("colors.glitch.primary")' 
          },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'neon-pulse': {
          '0%': { 
            textShadow: '0 0 5px theme("colors.glitch.primary"), 0 0 10px theme("colors.glitch.primary"), 0 0 15px theme("colors.glitch.primary"), 0 0 20px theme("colors.glitch.primary")' 
          },
          '100%': { 
            textShadow: '0 0 2px theme("colors.glitch.primary"), 0 0 5px theme("colors.glitch.primary"), 0 0 10px theme("colors.glitch.primary"), 0 0 15px theme("colors.glitch.primary")' 
          },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)',
        'cyber-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #262626 50%, #0a0a0a 100%)',
        'resistance-gradient': 'linear-gradient(135deg, #831843 0%, #be185d 50%, #831843 100%)',
        'glitch-gradient': 'linear-gradient(45deg, #00ff41 0%, #ff0080 50%, #ffff00 100%)',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 255, 65, 0.3)',
        'resistance': '0 0 20px rgba(190, 24, 93, 0.3)',
        'glitch': '0 0 20px rgba(255, 0, 128, 0.5)',
        'neon': '0 0 5px theme("colors.glitch.primary"), 0 0 10px theme("colors.glitch.primary"), 0 0 15px theme("colors.glitch.primary")',
      },
    },
  },
  plugins: [],
} 