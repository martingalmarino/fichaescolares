import { describe, expect, it } from 'vitest';
import { mapas, mapasPorCategoria } from './mapas';
import { notaMapa, schemaMapaAmerica, seoMapa } from './seo-mapas';

describe('SEO del mapa político de América', () => {
	const ficha = seoMapa('mapa-politico-de-america');

	it('describe las versiones que existen: nombres y capitales, sin prometer un mudo en la misma ficha', () => {
		expect(ficha).toBeDefined();
		expect(ficha!.description).toContain('países y capitales');
		expect(ficha!.description).toContain('nombres de países');
		expect(ficha!.description).not.toContain('mudo');
		expect(ficha!.keywords).toEqual([
			'mapa político de américa',
			'mapa de américa para imprimir',
			'mapa político de américa con nombres',
			'mapa de américa mudo',
			'mapa de américa con capitales',
		]);
		expect(ficha!.h1).toBe('Mapa político de América para imprimir');
		expect(ficha!.intro).toContain('35 países');
		expect(ficha!.intro).toContain('capitales');
		expect(ficha!.intro).toContain('PDF');
		expect(ficha!.intro).toContain('A4');
	});

	it('enlaza al sur, al mudo y al índice, y no inventa un mapa físico', () => {
		const america = mapasPorCategoria('america');
		expect(america.some((mapa) => mapa.tipo === 'fisico')).toBe(false);
		expect(america.some((mapa) => mapa.slug === 'mapa-mudo-de-continente-americano-n-3')).toBe(true);
		expect(ficha!.enlaces.sur.href).toBe('/mapas/mapa-politico-de-america-del-sur/');
		expect(ficha!.enlaces.mudo.href).toBe('/mapas/mapa-mudo-de-continente-americano-n-3/');
		expect(ficha!.enlaces.indice.href).toBe('/mapas/');
		expect(mapas.some((mapa) => mapa.slug === ficha!.enlaces.mudo.href.split('/').filter(Boolean).at(-1))).toBe(true);

		const vuelta = notaMapa('mapa-politico-de-america-del-sur');
		expect(vuelta?.href).toBe('/mapas/mapa-politico-de-america/');
		expect(vuelta?.ancla).toBe('mapa político de América para imprimir');
	});

	it('publica BreadcrumbList, CreativeWork con el PDF gratis y FAQPage', () => {
		const schema = schemaMapaAmerica({
			pagina: 'https://www.aulita.com.ar/mapas/mapa-politico-de-america/',
			pdf: 'https://sxggwoqjuhdstuyc.public.blob.vercel-storage.com/mapas/ign/mapa-politico-de-america.pdf',
			imagen: 'https://sxggwoqjuhdstuyc.public.blob.vercel-storage.com/mapas/ign/mapa-politico-de-america.jpg',
		});
		const graph = schema['@graph'] as { '@type': string; [clave: string]: unknown }[];
		expect(graph.map((nodo) => nodo['@type'])).toEqual(['CreativeWork', 'BreadcrumbList', 'FAQPage']);

		const obra = graph[0];
		expect(obra.isAccessibleForFree).toBe(true);
		expect(obra.associatedMedia).toMatchObject({
			contentUrl: 'https://sxggwoqjuhdstuyc.public.blob.vercel-storage.com/mapas/ign/mapa-politico-de-america.pdf',
			encodingFormat: 'application/pdf',
			isAccessibleForFree: true,
		});

		const migas = graph[1].itemListElement as { name: string; position: number }[];
		expect(migas.map((item) => item.name)).toEqual(['Inicio', 'Mapas', 'Mapa político de América']);

		const preguntas = graph[2].mainEntity as { name: string }[];
		expect(preguntas.map((item) => item.name)).toEqual([
			'¿Cuántos países tiene América?',
			'¿Qué diferencia hay entre el mapa político y el físico?',
		]);
	});
});
