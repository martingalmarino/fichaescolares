import { describe, expect, it } from 'vitest';
import { efemerides } from '../data/efemerides';
import { publicadas } from '../data/laminas';
import { TARJETAS } from '../data/tarjetas';
import { mapas } from '../data/mapas';
import { provincias } from '../data/provincias';
import { MESES_SLUG, efemeridesDelMes, fechaArgentina, mesDeSlug, pascua } from './calendario';
import { calendarioDe } from '../data/calendario-escolar';
import { MAX_DESCRIPCION, MAX_TITULO, MIN_DESCRIPCION, contarPalabras, h1CalendarioProvincia, htmlProvincia, introMes, metaCalendarioEscolar, metaCalendarioProvincia, metaEfemeride, metaLamina, metaMapa, metaProvincia, todasLasMetas } from './meta';

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
		expect(metas.filter((meta) => meta.ruta.startsWith('/calendario-escolar-2027/'))).toHaveLength(25);
		expect(rutas.has('/calendario-escolar-2027/cordoba/')).toBe(true);
		expect(rutas.has('/como-se-califica-en-primaria/')).toBe(true);
		expect(rutas.has('/como-se-califica-en-primaria/provincia-de-buenos-aires/')).toBe(true);
		expect(rutas.has('/como-se-califica-en-primaria/caba/')).toBe(true);
		expect(rutas.has('/calculadora-promedio-primaria/')).toBe(true);
		expect(rutas.has('/como-se-califica-en-primaria/se-repite-primer-grado/')).toBe(true);
		expect(rutas.has('/como-se-califica-en-primaria/como-leer-el-boletin/')).toBe(true);
		expect(rutas.has('/etiquetas-escolares/')).toBe(true);
		expect(rutas.has('/planificador-docente-2027/')).toBe(true);
		expect(rutas.has('/agenda-docente-2027/')).toBe(true);
		expect(rutas.has('/planificacion-anual/')).toBe(true);
		expect(rutas.has('/registro-de-asistencia/')).toBe(true);
		expect(rutas.has('/etiquetas-escolares/cuadernos/')).toBe(true);
		expect(rutas.has('/etiquetas-escolares/utiles/')).toBe(true);
		expect(rutas.has('/tarjetas-educativas/')).toBe(true);
		expect(rutas.has('/tarjetas-educativas/abecedario/')).toBe(true);
		expect(metas.filter((meta) => meta.ruta.startsWith('/tarjetas-educativas/') && meta.ruta !== '/tarjetas-educativas/')).toHaveLength(TARJETAS.length);
	});

	it('no pasa el largo y no repite title ni description', () => {
		const titulos = new Map<string, string>();
		const descripciones = new Map<string, string>();
		const largos: string[] = [];
		for (const meta of metas) {
			if (!meta.tituloLibre && meta.title.length > MAX_TITULO) largos.push(`título ${meta.title.length}: ${meta.ruta} — ${meta.title}`);
			if (!meta.descripcionLibre && meta.description.length > MAX_DESCRIPCION) largos.push(`description ${meta.description.length}: ${meta.ruta} — ${meta.description}`);
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

		const america = metaMapa(mapas.find((mapa) => mapa.slug === 'mapa-politico-de-america')!);
		expect(america.title).toBe('Mapa político de América para imprimir (PDF gratis)');
		expect(america.title.length).toBeLessThanOrEqual(60);
		expect(america.description).toBe(
			'Descargá gratis el mapa político de América con países y capitales, en A4 para imprimir. Versión con nombres de países, ideal para la escuela.',
		);
		expect(america.description.length).toBeGreaterThanOrEqual(140);
		expect(america.description.length).toBeLessThanOrEqual(155);

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

	it('arma los títulos del calendario escolar 2027', () => {
		expect(metaCalendarioEscolar(2027).title).toBe('Calendario escolar 2027 Argentina: inicio de clases');
		expect(metaCalendarioEscolar(2027).title.length).toBeLessThanOrEqual(60);
		expect(metaCalendarioEscolar(2027).description).toBe(
			'¿Cuándo empiezan las clases en 2027? Inicio del ciclo lectivo, vacaciones de invierno y feriados por provincia. Elegí tu provincia y descargalo gratis.',
		);
		expect(metaCalendarioEscolar(2027).description.length).toBeGreaterThanOrEqual(140);
		expect(metaCalendarioEscolar(2027).description.length).toBeLessThanOrEqual(155);
		const calendario = calendarioDe(2027);
		const esperado = new Map<string, string>([
			['buenos-aires', 'Inicio de clases 2027 en Buenos Aires: calendario escolar'],
			['caba', 'Agenda Educativa 2027 CABA: clases del 1 de marzo al 17 de diciembre'],
			['cordoba', 'Calendario escolar 2027 Córdoba: inicio de clases'],
			['mendoza', 'Calendario escolar 2027 Mendoza: inicio de clases'],
			['santiago-del-estero', 'Calendario 2027 Santiago del Estero: inicio de clases'],
			['tierra-del-fuego', 'Calendario escolar 2027 Tierra del Fuego: inicio de clases'],
			['tucuman', 'Calendario escolar 2027 Tucumán: inicio de clases'],
		]);
		for (const provincia of provincias) {
			const meta = metaCalendarioProvincia(provincia, calendario.jurisdicciones[provincia.slug]!, 2027);
			if (!meta.tituloLibre) expect(meta.title.length, meta.title).toBeLessThanOrEqual(60);
			if (provincia.slug === 'buenos-aires') {
				expect(h1CalendarioProvincia(provincia, 2027)).toBe('Calendario escolar 2027 de la Provincia de Buenos Aires: inicio de clases y ciclo lectivo');
				expect(meta.description).toBe(
					'Ciclo lectivo 2027 en la Provincia de Buenos Aires: cuándo empiezan las clases, vacaciones de invierno, feriados y fin de clases. Calendario para imprimir.',
				);
			} else if (provincia.slug === 'caba') {
				expect(h1CalendarioProvincia(provincia, 2027)).toBe('Agenda Educativa 2027 de CABA: inicio de clases el 1 de marzo');
				expect(meta.description).toBe(
					'Oficial: en CABA las clases 2027 empiezan el lunes 1 de marzo (secundario el 3), el receso de invierno es del 19 al 30 de julio y terminan el 17 de diciembre.',
				);
				expect(meta.tituloLibre).toBe(true);
			} else {
				expect(h1CalendarioProvincia(provincia, 2027)).toBe(`Calendario escolar 2027 de ${provincia.slug === 'tierra-del-fuego' ? 'Tierra del Fuego' : provincia.nombre}: cuándo empiezan las clases`);
				expect(meta.description).toContain(provincia.slug === 'mendoza' ? 'según la DGE' : 'según el Ministerio de Educación');
			}
			if (provincia.slug === 'mendoza') {
				expect(meta.description).toBe(
					'¿Cuándo empiezan las clases 2027 en Mendoza? Ciclo lectivo, vacaciones de invierno, feriados y fin de clases según la DGE. Calendario para imprimir gratis.',
				);
			}
			const titulo = esperado.get(provincia.slug);
			if (titulo) expect(meta.title).toBe(titulo);
			expect(meta.description.length, `${meta.ruta} ${meta.description}`).toBeGreaterThanOrEqual(140);
			expect(meta.description.length, `${meta.ruta} ${meta.description}`).toBeLessThanOrEqual(provincia.slug === 'caba' ? MAX_DESCRIPCION : 155);
		}
		expect(metaCalendarioProvincia(provincias.find((provincia) => provincia.slug === 'caba')!, calendario.jurisdicciones.caba!, 2027).title).toBe(
			'Agenda Educativa 2027 CABA: clases del 1 de marzo al 17 de diciembre',
		);
		expect(metaCalendarioProvincia(provincias.find((provincia) => provincia.slug === 'buenos-aires')!, calendario.jurisdicciones['buenos-aires']!, 2027).title.length).toBeLessThanOrEqual(60);
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
