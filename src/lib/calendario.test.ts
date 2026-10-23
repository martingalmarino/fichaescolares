import { describe, expect, it } from 'vitest';
import efemerides from '../data/efemerides.json';
import proceres from '../data/proceres.json';
import { validarDatos } from '../data/schemas';
import { efemeridesCercanas, efemeridesDelMes, fechaArgentina, fechaDelAnio, mesDeSlug, pascua, proximasEfemerides } from './calendario';

const muestra = [
	{ slug: '20-de-noviembre', dia: 20, mes: 11 },
	{ slug: '24-de-marzo', dia: 24, mes: 3 },
	{ slug: '10-de-diciembre', dia: 10, mes: 12 },
	{ slug: '10-de-noviembre', dia: 10, mes: 11 },
	{ slug: '2-de-abril', dia: 2, mes: 4 },
	{ slug: '1-de-mayo', dia: 1, mes: 5 },
];

function enArgentina(anio: number, mes: number, dia: number): Date {
	return new Date(Date.UTC(anio, mes - 1, dia, 15, 0, 0));
}

describe('pascua', () => {
	it('cae el 5 de abril de 2026 y el 28 de marzo de 2027', () => {
		expect(pascua(2026)).toEqual({ dia: 5, mes: 4 });
		expect(pascua(2027)).toEqual({ dia: 28, mes: 3 });
	});
});

describe('fechaDelAnio', () => {
	it('resuelve Carnaval, Jueves y Viernes Santo a partir de Pascua', () => {
		const carnaval = efemerides.find((item) => item.slug === 'carnaval');
		const jueves = efemerides.find((item) => item.slug === 'jueves-santo');
		const viernes = efemerides.find((item) => item.slug === 'viernes-santo');
		expect(fechaDelAnio(carnaval!, 2026)).toMatchObject({ dia: 17, mes: 2 });
		expect(fechaDelAnio(jueves!, 2026)).toMatchObject({ dia: 2, mes: 4 });
		expect(fechaDelAnio(viernes!, 2026)).toMatchObject({ dia: 3, mes: 4 });
		expect(fechaDelAnio(viernes!, 2027)).toMatchObject({ dia: 26, mes: 3 });
	});

	it('resuelve el primer jueves de noviembre y el tercer domingo de agosto', () => {
		const acoso = efemerides.find((item) => item.slug === 'acoso-escolar');
		const infancias = efemerides.find((item) => item.slug === 'dia-de-las-infancias');
		expect(fechaDelAnio(acoso!, 2026)).toMatchObject({ dia: 5, mes: 11 });
		expect(fechaDelAnio(acoso!, 2027)).toMatchObject({ dia: 4, mes: 11 });
		expect(fechaDelAnio(infancias!, 2026)).toMatchObject({ dia: 16, mes: 8 });
		expect(fechaDelAnio(infancias!, 2027)).toMatchObject({ dia: 15, mes: 8 });
	});

	it('deja el feriado trasladable en su día y no calcula el asueto', () => {
		const guemes = efemerides.find((item) => item.slug === '17-de-junio');
		expect(fechaDelAnio(guemes!, 2026)).toEqual({ dia: 17, mes: 6, nota: 'El feriado puede trasladarse.' });
	});

	it('no inventa días turísticos fuera de 2026', () => {
		const turisticos = efemerides.find((item) => item.slug === 'dias-turisticos');
		expect(fechaDelAnio(turisticos!, 2026)).toBeNull();
		expect(efemeridesDelMes(efemerides, 7, 2026).some((item) => item.slug === 'dias-turisticos' && item.dia === 10)).toBe(true);
		expect(efemeridesDelMes(efemerides, 7, 2027).some((item) => item.slug === 'dias-turisticos')).toBe(false);
	});
});

describe('proximasEfemerides', () => {
	it('desde el 22 de octubre de 2026 incluye el acoso escolar, que ese año es el 5 de noviembre', () => {
		const proximas = proximasEfemerides(efemerides, enArgentina(2026, 10, 22), 4);
		expect(proximas.map((item) => item.slug)).toEqual(['22-de-octubre', '24-de-octubre', 'acoso-escolar', '6-de-noviembre']);
		expect(proximas.every((item) => item.anio === 2026)).toBe(true);
	});

	it('incluye el día de hoy y no corre los feriados trasladables', () => {
		const hoy = proximasEfemerides(muestra, enArgentina(2026, 11, 20), 1);
		expect(hoy[0]).toMatchObject({ slug: '20-de-noviembre', dia: 20, mes: 11, anio: 2026 });
		const soberania = proximasEfemerides(efemerides, enArgentina(2026, 11, 20), 2);
		expect(soberania[0]).toMatchObject({ slug: '20-de-noviembre', dia: 20, mes: 11, nota: 'El feriado puede trasladarse.' });
	});

	it('al día siguiente salta al 10 de diciembre y cierra el año con marzo, abril y mayo', () => {
		const proximas = proximasEfemerides(muestra, enArgentina(2026, 11, 21), 4);
		expect(proximas.map((item) => `${item.anio}-${item.slug}`)).toEqual([
			'2026-10-de-diciembre',
			'2027-24-de-marzo',
			'2027-2-de-abril',
			'2027-1-de-mayo',
		]);
	});

	it('alrededor del 25 de mayo muestra las fechas vecinas de ese mes', () => {
		const cercanas = efemeridesCercanas(efemerides, '25-de-mayo', enArgentina(2026, 5, 1));
		expect(cercanas.map((item) => item.slug)).toEqual(['15-de-mayo', '18-de-mayo', '28-de-mayo', '31-de-mayo']);
		expect(mesDeSlug('junio')).toBe(6);
	});

	it('en la noche del 31 de diciembre, en Argentina, la siguiente es Año Nuevo', () => {
		const medianocheUtc = new Date(Date.UTC(2027, 0, 1, 2, 30, 0));
		expect(fechaArgentina(medianocheUtc)).toEqual({ anio: 2026, mes: 12, dia: 31 });
		const proximas = proximasEfemerides(efemerides, medianocheUtc, 1);
		expect(proximas[0]).toMatchObject({ slug: '1-de-enero', dia: 1, mes: 1, anio: 2027 });
	});
});

describe('validarDatos', () => {
	it('acepta el archivo actual sin borradores', () => {
		expect(validarDatos(efemerides, proceres, { allowDraft: false })).toEqual([]);
	});

	it('rechaza un registro sin verificar y lo deja pasar con --allow-draft', () => {
		const copia = structuredClone(efemerides);
		const memoria = copia.find((item) => item.slug === '24-de-marzo');
		memoria!.verificado = false;
		expect(validarDatos(copia, proceres, { allowDraft: false }).some((error) => error.includes('24-de-marzo'))).toBe(true);
		expect(validarDatos(copia, proceres, { allowDraft: true })).toEqual([]);
	});

	it('rechaza un prócer citado que no existe', () => {
		const copia = structuredClone(efemerides);
		copia[4]!.proceres = ['nadie'];
		expect(validarDatos(copia, proceres, { allowDraft: false }).some((error) => error.includes('nadie'))).toBe(true);
	});

	it('rechaza un día inexistente, un slug repetido, un id repetido y una fecha sin fuente', () => {
		const dia = structuredClone(efemerides);
		dia[0]!.dia = 31;
		dia[0]!.mes = 4;
		expect(validarDatos(dia, proceres, { allowDraft: false }).some((error) => error.includes('no tiene día'))).toBe(true);

		const slug = structuredClone(efemerides);
		slug[1]!.slug = slug[0]!.slug;
		expect(validarDatos(slug, proceres, { allowDraft: false }).some((error) => error.includes('slug repetido'))).toBe(true);

		const id = structuredClone(efemerides);
		id[1]!.id = id[0]!.id;
		expect(validarDatos(id, proceres, { allowDraft: false }).some((error) => error.includes('id repetido'))).toBe(true);

		const fuente = structuredClone(efemerides);
		fuente[0]!.fuentes = [];
		expect(validarDatos(fuente, proceres, { allowDraft: false }).some((error) => error.includes('fuentes'))).toBe(true);
	});
});
