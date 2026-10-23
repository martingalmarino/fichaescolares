import { describe, expect, it } from 'vitest';
import { efemerides } from '../data/efemerides';
import { publicadas } from '../data/laminas';
import { mapas } from '../data/mapas';
import { provincias } from '../data/provincias';
import { MESES_SLUG, efemeridesDelMes, fechaArgentina, mesDeSlug, pascua } from './calendario';
import { MAX_DESCRIPCION, MAX_TITULO, MIN_DESCRIPCION, contarPalabras, htmlProvincia, introMes, metaEfemeride, metaLamina, metaMapa, metaProvincia, todasLasMetas } from './meta';

describe('títulos y descripciones', () => {
	const metas = todasLasMetas(new Date('2026-10-23T12:00:00-03:00'));

	it('cubre las páginas estáticas, los índices y las plantillas', () => {
		const rutas = new Set(metas.map((meta) => meta.ruta));
		expect(rutas.has('/sopa-de-letras/')).toBe(true);
		expect(rutas.has('/efemerides/')).toBe(true);
		expect(rutas.has('/efemerides/mayo/')).toBe(true);
		expect(rutas.has('/mapas/mapa-politico-de-cordoba-con-departamentos/')).toBe(true);
		expect(rutas.has('/laminas/escarapela/')).toBe(true);
		expect(rutas.has('/provincias/cordoba/')).toBe(true);
		expect(metas.filter((meta) => meta.ruta.startsWith('/efemerides/') && MESES_SLUG.some((mes) => meta.ruta === `/efemerides/${mes}/`))).toHaveLength(12);
		expect(metas.filter((meta) => meta.ruta.startsWith('/mapas/') && meta.ruta !== '/mapas/' && meta.ruta !== '/mapas/provincias/')).toHaveLength(mapas.length);
		expect(metas.filter((meta) => meta.ruta.startsWith('/laminas/') && meta.ruta !== '/laminas/')).toHaveLength(publicadas.length);
		expect(metas.filter((meta) => meta.ruta.startsWith('/provincias/') && meta.ruta !== '/provincias/')).toHaveLength(provincias.length);
		expect(metas.filter((meta) => meta.ruta.startsWith('/efemerides/') && !MESES_SLUG.some((mes) => meta.ruta === `/efemerides/${mes}/`) && meta.ruta !== '/efemerides/')).toHaveLength(efemerides.length);
	});

	it('no pasa el largo y no repite title ni description', () => {
		const titulos = new Map<string, string>();
		const descripciones = new Map<string, string>();
		const largos: string[] = [];
		for (const meta of metas) {
			if (meta.title.length > MAX_TITULO) largos.push(`título ${meta.title.length}: ${meta.ruta} — ${meta.title}`);
			if (meta.description.length > MAX_DESCRIPCION) largos.push(`description ${meta.description.length}: ${meta.ruta} — ${meta.description}`);
			if (!meta.flexible && meta.description.length < MIN_DESCRIPCION) largos.push(`description corta ${meta.description.length}: ${meta.ruta} — ${meta.description}`);
			const tituloPrevio = titulos.get(meta.title);
			if (tituloPrevio) largos.push(`título repetido «${meta.title}» en ${tituloPrevio} y ${meta.ruta}`);
			titulos.set(meta.title, meta.ruta);
			const descripcionPrevia = descripciones.get(meta.description);
			if (descripcionPrevia) largos.push(`description repetida en ${descripcionPrevia} y ${meta.ruta}`);
			descripciones.set(meta.description, meta.ruta);
		}
		expect(largos).toEqual([]);
	});

	it('arma los ejemplos de efemérides, mapas, láminas y provincias', () => {
		const mayo = metaEfemeride(efemerides.find((fecha) => fecha.slug === '25-de-mayo')!, new Date('2026-10-23T12:00:00-03:00'));
		expect(mayo.title).toBe('Día de la Revolución de Mayo: 25 de mayo | Aulita');
		expect(mayo.description).toContain('feriado nacional');
		expect(mayo.description).not.toMatch(/feriado(?! nacional)/);

		const sida = metaEfemeride(efemerides.find((fecha) => fecha.slug === '1-de-diciembre')!, new Date('2026-10-23T12:00:00-03:00'));
		expect(sida.title).toContain('1 de diciembre');
		expect(sida.description).not.toContain('feriado');

		const carnaval = metaEfemeride(efemerides.find((fecha) => fecha.slug === 'carnaval')!, new Date('2026-10-23T12:00:00-03:00'));
		const pascua2027 = pascua(2027);
		expect(carnaval.title).toBe('Carnaval 2027: lunes 8 y martes 9 de febrero | Aulita');
		expect(pascua2027.mes).toBeGreaterThan(0);

		const cordoba = metaMapa(mapas.find((mapa) => mapa.slug === 'mapa-politico-de-cordoba-con-departamentos')!);
		expect(cordoba.title).toBe('Mapa político de Córdoba con departamentos | Aulita');
		expect(cordoba.description).toContain('PDF A4');
		expect(cordoba.description).toContain('CC BY-SA 4.0');

		const escarapela = metaLamina(publicadas.find((lamina) => lamina.slug === 'escarapela')!);
		expect(escarapela.title).toBe('Escarapela argentina para colorear e imprimir | Aulita');
		expect(escarapela.description).toContain('18 de mayo');

		const ficha = metaProvincia(provincias.find((provincia) => provincia.slug === 'cordoba')!, true);
		expect(ficha.title).toBe('Provincia de Córdoba: ficha para imprimir | Aulita');
		expect(ficha.description).toContain('capital (Córdoba)');
		expect(ficha.description).toContain('Con mapa del IGN');
		expect(ficha.description).not.toContain('región');
	});

	it('deja la intro de cada mes entre 80 y 120 palabras', () => {
		const hoy = fechaArgentina(new Date('2026-10-23T12:00:00-03:00'));
		for (const slug of MESES_SLUG) {
			const mes = mesDeSlug(slug) ?? 1;
			const fechas = efemeridesDelMes(efemerides, mes, hoy.anio);
			const anterior = mes === 1 ? 12 : mes - 1;
			const siguiente = mes === 12 ? 1 : mes + 1;
			const palabras = contarPalabras(introMes(mes, hoy.anio, fechas, anterior, siguiente));
			expect(palabras, slug).toBeGreaterThanOrEqual(80);
			expect(palabras, slug).toBeLessThanOrEqual(120);
		}
	});

	it('deja el párrafo de cada provincia entre 80 y 100 palabras', () => {
		for (const provincia of provincias) {
			const tieneMapa = mapas.some((mapa) => mapa.provincia?.replaceAll('_', '-') === provincia.slug);
			const palabras = contarPalabras(htmlProvincia(provincia, tieneMapa));
			expect(palabras, provincia.slug).toBeGreaterThanOrEqual(80);
			expect(palabras, provincia.slug).toBeLessThanOrEqual(100);
		}
	});
});
