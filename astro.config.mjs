// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const raiz = dirname(fileURLToPath(import.meta.url));

/** @type {Map<string, string>} */
const lastmodCalendario = new Map();
const carpeta = join(raiz, 'src/data/calendario-escolar');
for (const archivo of readdirSync(carpeta).filter((nombre) => nombre.endsWith('.json'))) {
	const datos = JSON.parse(readFileSync(join(carpeta, archivo), 'utf8'));
	const base = `https://www.aulita.com.ar/calendario-escolar-${datos.anio}/`;
	lastmodCalendario.set(base, datos.actualizado);
	for (const [slug, jurisdiccion] of Object.entries(datos.jurisdicciones)) {
		const fecha = jurisdiccion && typeof jurisdiccion === 'object' && 'actualizado' in jurisdiccion && jurisdiccion.actualizado ? String(jurisdiccion.actualizado) : datos.actualizado;
		lastmodCalendario.set(`${base}${slug}/`, fecha);
	}
}

// https://astro.build/config
export default defineConfig({
	site: 'https://www.aulita.com.ar',
	output: 'static',
	trailingSlash: 'always',
	integrations: [
		preact(),
		sitemap({
			serialize(item) {
				const lastmod = lastmodCalendario.get(item.url);
				if (lastmod) item.lastmod = new Date(`${lastmod}T12:00:00.000Z`);
				return item;
			},
		}),
	],
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
