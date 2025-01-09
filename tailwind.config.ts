import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{css,js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			yellow: {
  				'300': '#FFEC40',
  				'500': '#F9BC12'
  			},
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
  		backgroundImage: {
  			'radial-gradient': 'radial-gradient(100% 100% at 50% 0%, #FFEC40 0%, #F9BC12 100%)'
  		},
  		fontFamily: {
  			mono: [
  				'var(--font-vcr)'
  			],
  			sans: [
  				'var(--font-inter)'
  			]
  		},
      boxShadow: {
        'custom-button': '8px 8px 12px 0px rgba(0, 0, 0, 0.25), 2px 0px 0px 0px rgba(255, 255, 255, 0.04) inset, 0px 2px 0px 0px rgba(255, 255, 255, 0.10) inset, -2px 0px 0px 0px rgba(0, 0, 0, 0.50) inset, 0px -2px 0px 0px rgba(0, 0, 0, 0.50) inset',
      },
  		keyframes: {
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			}
  		},
  		animation: {
  			marquee: 'marquee var(--duration) infinite linear',
  			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
  		},
      blur: {
        '4xl': '96px',
        '5xl': '128px',
      }
  	}
  },
  plugins: [],
} satisfies Config;
