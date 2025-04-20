import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		keyframes: {
			'bounce-once': {
			'0%, 100%': { transform: 'translateY(0)' },
			'50%': { transform: 'translateY(-4px)' },
			},
			bell: {
			'0%, 100%': { transform: 'rotate(0deg)' },
			'25%': { transform: 'rotate(15deg)' },
			'75%': { transform: 'rotate(-15deg)' },
			},
			'bell-shake-once': {
				'0%': { transform: 'rotate(0deg)' },
				'10%': { transform: 'rotate(-15deg)' },
				'20%': { transform: 'rotate(15deg)' },
				'30%': { transform: 'rotate(-10deg)' },
				'40%': { transform: 'rotate(10deg)' },
				'50%': { transform: 'rotate(-5deg)' },
				'60%': { transform: 'rotate(5deg)' },
				'70%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(0deg)' }, // mantém parado até reiniciar
			  }
		},
		animation: {
			'bounce-once': 'bounce-once 0.4s ease-in-out',
			'bell-shake-once': 'bell-shake-once 1.5s ease-in-out infinite',
		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
