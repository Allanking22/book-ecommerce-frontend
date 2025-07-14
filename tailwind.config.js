/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom Colors for Anime/Comic Aesthetic
      colors: {
        'anime-blue': '#40E0D0', // A vibrant teal/cyan
        'anime-pink': '#FF69B4', // A bright, energetic pink
        'comic-yellow': '#FFD700', // A strong, punchy yellow for highlights
        'comic-blue': '#00BFFF',
        'comic-red': '#FF4500',
      },
      // Custom Fonts
      fontFamily: {
        heading: ['Bangers', 'cursive'], // For titles and impactful text
        body: ['Chakra Petch', 'sans-serif'], // For general body text
      },
      // Custom Box Shadows for Comic Book Pop
      boxShadow: {
        'comic-pop': '8px 8px 0px rgba(0, 0, 0, 0.7)',
        'comic-soft': '4px 4px 0px rgba(0, 0, 0, 0.3)',
        'comic-pop-lg': '10px 10px 0px rgba(0, 0, 0, 0.9), 12px 12px 0px rgba(255, 105, 180, 0.3)',
        'comic-soft-sm': '2px 2px 0px rgba(0, 0, 0, 0.3)',
        
      },
      // Custom Text Shadows (requires a plugin or direct CSS utility)
      textShadow: {
        'outline': '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black',
      },
      // Custom Keyframes for Animations
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-light': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // NEW: float animation keyframes
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      // Custom Animations (mapping keyframes to utility classes)
      animation: {
        'fade-in-down': 'fade-in-down 0.7s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
        'pulse-light': 'pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // NEW: float animation
        'float': 'float 3s ease-in-out infinite alternate',
      },
      // Default Tailwind gradients (keep these)
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};