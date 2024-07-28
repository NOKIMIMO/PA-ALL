module.exports = {
	theme: {
		extend: {
			colors: {
				"card": "oklch(var(--card) / <alpha-value>)",
			  },
		},
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
		},
	},
	daisyui: {
		themes: [
			{
				normal: {
					"primary": "#0000ff",
					"secondary": "#00a300",
					"accent": "#00bdff",
					"neutral": "#0c0400",
					"base-100": "#fff4f3",
					"info": "#00d2ea",
					"success": "#5fb500",
					"warning": "#9f4f00",
					"error": "#f6486e",
					// "--card": "#ffffff",
					// use hsl for card
					"--card": "100% 0 0",
					"--primary-muted": "65% 0.2 295", 
				},
				dark: {
					"primary": "#1e3a8a", // Darker primary blue
					"secondary": "#006400", // Darker green
					"accent": "#0084ff", // Darker accent blue
					"neutral": "#1f2937", // Darker neutral gray
					"base-100": "#cccccc", // Darker background color
					"info": "#00bcd4", // Darker info color
					"success": "#4caf50", // Darker success green
					"warning": "#ff9800", // Darker warning orange
					"error": "#f44336", // Darker error red
					"--card": "95% 0 0", // Darker card background
					"--primary-muted": "34% 0.2 289",
				},
			},
		],
	},
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	plugins: [require("@tailwindcss/typography"), require('daisyui')],
};
