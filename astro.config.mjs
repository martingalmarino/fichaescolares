// @ts-check
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE ?? 'https://fichaspatrias.vercel.app',
	output: 'static',
	trailingSlash: 'always',
	integrations: [preact(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
