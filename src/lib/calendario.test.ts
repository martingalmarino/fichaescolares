import { describe, expect, it } from 'vitest';
import efemerides from '../data/efemerides.json';
import proceres from '../data/proceres.json';
import { validarDatos } from '../data/schemas';
import { proximasEfemerides } from './calendario';

const muestra = [
	{ slug: '20-de-noviembre', dia: 20, mes: 11 },
	{ slug: '24-de-marzo', dia: 24, mes: 3 },
	{ slug: '10-de-diciembre', dia: 10, mes: 12 },
	{ slug: '10-de-noviembre', dia: 10, mes: 11 },
	{ slug: '2-de-abril', dia: 2, mes: 4 },
	{ slug: '1-de-mayo', dia: 1, mes: 5 },
];

describe('proximasEfemerides', () => {
	it('desde el 22 de octubre de 2026 devuelve tradición, soberanía, democracia y memoria', () => {
		const proximas = proximasEfemerides(efemerides, new Date(2026, 9, 22), 4);
		expect(proximas.map((item) => item.slug)).toEqual(['10-de-noviembre', '20-de-noviembre', '10-de-diciembre', '24-de-marzo']);
		expect(proximas[3]?.anio).toBe(2027);
		expect(proximas[0]?.anio).toBe(2026);
	});

	it('incluye el día de hoy y no corre los feriados trasladables', () => {
		const hoy = proximasEfemerides(muestra, new Date(2026, 10, 20), 1);
		expect(hoy[0]).toMatchObject({ slug: '20-de-noviembre', dia: 20, mes: 11, anio: 2026 });
	});

	it('al día siguiente salta al 10 de diciembre y cierra el año con marzo, abril y mayo', () => {
		const proximas = proximasEfemerides(muestra, new Date(2026, 10, 21), 4);
		expect(proximas.map((item) => `${item.anio}-${item.slug}`)).toEqual([
			'2026-10-de-diciembre',
			'2027-24-de-marzo',
			'2027-2-de-abril',
			'2027-1-de-mayo',
		]);
	});
});

describe('validarDatos', () => {
	it('acepta el archivo actual sin borradores', () => {
		expect(validarDatos(efemerides, proceres, { allowDraft: false })).toEqual([]);
	});

	it('rechaza un registro sin verificar y lo deja pasar con --allow-draft', () => {
		const copia = structuredClone(efemerides);
		copia[0]!.verificado = false;
		expect(validarDatos(copia, proceres, { allowDraft: false }).some((error) => error.includes('24-de-marzo'))).toBe(true);
		expect(validarDatos(copia, proceres, { allowDraft: true })).toEqual([]);
	});

	it('rechaza un prócer citado que no existe', () => {
		const copia = structuredClone(efemerides);
		copia[4]!.proceres = ['nadie'];
		expect(validarDatos(copia, proceres, { allowDraft: false }).some((error) => error.includes('nadie'))).toBe(true);
	});
});
