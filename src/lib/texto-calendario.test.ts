import { describe, expect, it } from 'vitest';
import { calendarioDe } from '../data/calendario-escolar';
import { provincias } from '../data/provincias';
import { contarPalabras } from './meta';
import { fechaCorta, filasResumen, introCalendarioNacional, preguntasNacional, regionesEscolares } from './texto-calendario';

describe('grilla del calendario', () => {
	it('formatea la fecha corta de la tarjeta', () => {
		expect(fechaCorta('2027-03-01')).toBe('1 mar');
		expect(fechaCorta('2027-07-17')).toBe('17 jul');
		expect(fechaCorta('2027-12-11')).toBe('11 dic');
	});

	it('reparte las 24 provincias en Centro, NOA, NEA, Cuyo y Patagonia', () => {
		expect(regionesEscolares.map((region) => region.slugs.length)).toEqual([6, 6, 4, 3, 5]);
		const slugs = regionesEscolares.flatMap((region) => [...region.slugs]);
		expect(new Set(slugs).size).toBe(24);
		expect([...slugs].sort()).toEqual(provincias.map((provincia) => provincia.slug).sort());
	});

	it('responde el inicio 2027 sin fechas estimadas y arma la tabla de las 24', () => {
		const calendario = calendarioDe(2027);
		const intro = introCalendarioNacional(calendario);
		const palabras = contarPalabras(intro);
		expect(palabras).toBeGreaterThanOrEqual(40);
		expect(palabras).toBeLessThanOrEqual(60);
		expect(intro).toContain('Todavía no hay una fecha oficial');
		expect(intro).toContain('no adelanta fechas estimadas');
		expect(intro).not.toMatch(/\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);

		const filas = filasResumen(calendario);
		expect(filas).toHaveLength(24);
		expect(filas.every((fila) => fila.estado === 'A confirmar')).toBe(true);
		expect(filas.every((fila) => fila.inicio === 'A confirmar' && fila.invierno === 'A confirmar' && fila.fin === 'A confirmar')).toBe(true);
		expect(filas.map((fila) => fila.href).sort()).toEqual(provincias.map((provincia) => `/calendario-escolar-2027/${provincia.slug}/`).sort());

		expect(preguntasNacional(calendario).map((item) => item.q)).toEqual([
			'¿Cuándo empieza el ciclo lectivo 2027?',
			'¿Cuándo son las vacaciones de invierno 2027?',
			'¿Cuántos días de clase hay en 2027?',
			'¿Cuándo se publica el calendario oficial?',
		]);
		expect(preguntasNacional(calendario).every((item) => !/empiezan el \d/.test(item.a))).toBe(true);
	});
});
