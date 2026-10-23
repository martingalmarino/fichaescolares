/** @type {import('tailwindcss').Config} */
export default {
	theme: {
		extend: {
			colors: {
				celeste: {
					DEFAULT: '#4aa3df',
					50: '#eef7fd',
					100: '#d6ecfa',
				},
				azul: '#1d3557',
				sol: {
					DEFAULT: '#f4a531',
					50: '#fff4e2',
				},
				texto: '#1f2937',
				muted: '#6b7280',
				borde: '#e5e7eb',
				bg: '#fbfdff',
			},
			borderRadius: {
				card: '14px',
				control: '10px',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			boxShadow: {
				card: '0 8px 24px rgba(29, 53, 87, 0.06)',
			},
		},
	},
};
