import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import catalogo from './mapas-ign.json';
import { BASE_MAPAS, enlacePdf, mapasDeProvincia, mapasPorCategoria, mapasPorTipo, rutaMapa } from './mapas';

const carpeta = join(dirname(fileURLToPath(import.meta.url)), '../../public/mapas/ign');

describe('archivos locales de los mapas IGN', () => {
	it('tiene el jpg y la miniatura, y el pdf cuando el catálogo lo trae', () => {
		const sinPdf = catalogo.mapas.filter((mapa) => mapa.pdf == null).map((mapa) => mapa.slug);
		expect(sinPdf.sort()).toEqual(['carta-topografica-de-las-islas-malvinas', 'imagen-satelital-de-las-islas-malvinas']);

		for (const mapa of catalogo.mapas) {
			expect(existsSync(join(carpeta, `${mapa.slug}.jpg`)), `${mapa.slug}.jpg`).toBe(true);
			expect(existsSync(join(carpeta, `${mapa.slug}-thumb.webp`)), `${mapa.slug}-thumb.webp`).toBe(true);
			if (mapa.pdf != null) expect(existsSync(join(carpeta, `${mapa.slug}.pdf`)), `${mapa.slug}.pdf`).toBe(true);
		}
	});
});

describe('consultas del catálogo', () => {
	it('agrupa por categoría y por tipo', () => {
		expect(mapasPorCategoria('provincia')).toHaveLength(108);
		expect(mapasPorCategoria('argentina')).toHaveLength(7);
		expect(mapasPorTipo('mudo').every((mapa) => mapa.tipo === 'mudo')).toBe(true);
		expect(mapasPorTipo('satelital')).toHaveLength(29);
	});

	it('relaciona GBA con Buenos Aires y Malvinas con Tierra del Fuego', () => {
		const buenosAires = mapasDeProvincia('buenos-aires');
		expect(buenosAires.length).toBeGreaterThan(0);
		expect(buenosAires.every((mapa) => mapa.provincia === 'buenos_aires')).toBe(true);
		expect(buenosAires.some((mapa) => mapa.provinciaNombre === 'Gran Buenos Aires')).toBe(true);

		const tierraDelFuego = mapasDeProvincia('tierra-del-fuego');
		expect(tierraDelFuego.some((mapa) => mapa.provinciaNombre === 'Islas Malvinas')).toBe(true);
		expect(tierraDelFuego.some((mapa) => mapa.provinciaNombre === 'Isla Grande de Tierra del Fuego')).toBe(true);
		expect(tierraDelFuego.every((mapa) => mapa.provincia === 'tierra_del_fuego')).toBe(true);
	});

	it('arma las rutas locales y las de Blob sin apuntar al IGN', () => {
		expect(rutaMapa('/mapas/ign', 'cordoba', 'jpg')).toBe('/mapas/ign/cordoba.jpg');
		expect(rutaMapa(BASE_MAPAS, 'cordoba', 'thumb')).toBe(`${BASE_MAPAS}/cordoba-thumb.webp`);
		expect(enlacePdf(`${BASE_MAPAS}/cordoba.pdf`)).toBe(`${BASE_MAPAS}/cordoba.pdf?download=1`);
		for (const mapa of catalogo.mapas) {
			expect(mapa.ancho).toBeGreaterThan(0);
			expect(mapa.alto).toBeGreaterThan(0);
			expect(mapa.thumbAncho).toBeGreaterThan(0);
			expect(mapa.thumbAlto).toBeGreaterThan(0);
			expect(rutaMapa(BASE_MAPAS, mapa.slug, 'jpg')).not.toContain('ign.gob.ar');
			expect(rutaMapa(BASE_MAPAS, mapa.slug, 'thumb')).not.toContain('ign.gob.ar');
			if (mapa.pdf) expect(rutaMapa(BASE_MAPAS, mapa.slug, 'pdf')).not.toContain('ign.gob.ar');
		}
	});
});
