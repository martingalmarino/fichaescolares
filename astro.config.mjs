// @ts-check
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.aulita.com.ar',
	output: 'static',
	trailingSlash: 'always',
	integrations: [preact(), sitemap()],
	redirects: {
		'/laminas-para-colorear/': {
			status: 301,
			destination: '/laminas/',
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
