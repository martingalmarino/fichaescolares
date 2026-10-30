import { describe, expect, it } from 'vitest';
import { calendarioDe } from '../data/calendario-escolar';
import { provincias } from '../data/provincias';
import { contarPalabras } from './meta';
import { cuadroBuenosAires, fechaCorta, filasResumen, introBuenosAires, introCaba, introCalendarioNacional, introProvincia, inviernoCaba, keywordsProvincia, preguntasBuenosAires, preguntasCaba, preguntasNacional, preguntasProvincia, regionesEscolares } from './texto-calendario';

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

	it('responde el inicio 2027 de Buenos Aires sin fechas de la DGCyE', () => {
		const jurisdiccion = calendarioDe(2027).jurisdicciones['buenos-aires']!;
		const intro = introBuenosAires(jurisdiccion, 2027);
		const palabras = contarPalabras(intro);
		expect(palabras).toBeGreaterThanOrEqual(40);
		expect(palabras).toBeLessThanOrEqual(60);
		expect(intro).toContain('¿Cuándo empiezan las clases en 2027 en la Provincia de Buenos Aires?');
		expect(intro).toContain('DGCyE');
		expect(intro).toContain('todavía no publicó');
		expect(intro).toContain('no adelanta fechas estimadas');
		expect(intro).not.toMatch(/\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);

		const cuadro = cuadroBuenosAires(jurisdiccion);
		expect(cuadro.map((fila) => fila.clave)).toEqual(['Inicio de clases', 'Vacaciones de invierno', 'Fin de clases']);
		expect(cuadro.every((fila) => fila.inicial === 'A confirmar' && fila.primaria === 'A confirmar' && fila.secundaria === 'A confirmar')).toBe(true);

		const preguntas = preguntasBuenosAires(jurisdiccion, 2027);
		expect(preguntas.map((item) => item.q)).toEqual([
			'¿Cuándo empieza el ciclo lectivo 2027 en PBA?',
			'¿Cuándo son las vacaciones de invierno 2027 en Buenos Aires?',
			'¿Cuándo terminan las clases 2027?',
		]);
		expect(preguntas[0]?.a).toContain('href="/calendario-escolar-2027/caba/"');
		expect(preguntas.every((item) => !/\d{1,2} de (enero|febrero)/.test(item.a))).toBe(true);
	});

	it('explica la Agenda Educativa 2027 de CABA sin fechas del ministerio porteño', () => {
		const jurisdiccion = calendarioDe(2027).jurisdicciones.caba!;
		const intro = introCaba(jurisdiccion, 2027);
		const palabras = contarPalabras(intro);
		expect(palabras).toBeGreaterThanOrEqual(40);
		expect(palabras).toBeLessThanOrEqual(60);
		expect(intro).toContain('La Agenda Educativa es el calendario oficial');
		expect(intro).toContain('todavía no publicó la Agenda Educativa 2027');
		expect(intro).toContain('no adelanta fechas estimadas');
		expect(intro).not.toMatch(/\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);

		expect(inviernoCaba(jurisdiccion, 2027)).toContain('todavía no tienen fecha');
		expect(inviernoCaba(jurisdiccion, 2027)).not.toMatch(/\d{1,2} de (julio|agosto)/);

		const preguntas = preguntasCaba(jurisdiccion, 2027);
		expect(preguntas.map((item) => item.q)).toEqual([
			'¿Qué es la Agenda Educativa 2027?',
			'¿Cuándo empiezan las clases 2027 en CABA?',
			'¿Cuándo son las vacaciones de invierno 2027 en CABA?',
		]);
		expect(preguntas[0]?.a).toContain('href="/calendario-escolar-2027/buenos-aires/"');
		expect(preguntas.every((item) => !/empiezan el \d/.test(item.a))).toBe(true);
	});

	it('responde el inicio de cada provincia sin fechas que el organismo no publicó', () => {
		const calendario = calendarioDe(2027);
		for (const provincia of provincias) {
			if (provincia.slug === 'caba' || provincia.slug === 'buenos-aires') continue;
			const jurisdiccion = calendario.jurisdicciones[provincia.slug]!;
			const intro = introProvincia(provincia, jurisdiccion, 2027);
			const palabras = contarPalabras(intro);
			expect(palabras, provincia.slug).toBeGreaterThanOrEqual(40);
			expect(palabras, provincia.slug).toBeLessThanOrEqual(60);
			expect(intro, provincia.slug).toContain('todavía no publicó');
			expect(intro, provincia.slug).toContain('no adelanta fechas estimadas');
			expect(intro, provincia.slug).not.toMatch(/\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
			const preguntas = preguntasProvincia(provincia, jurisdiccion, 2027);
			expect(preguntas[0]?.q, provincia.slug).toContain('empiezan las clases');
			expect(preguntas[1]?.q, provincia.slug).toContain('vacaciones de invierno');
			expect(preguntas[2]?.q, provincia.slug).toContain('terminan las clases');
			expect(preguntas.slice(0, 3).every((item) => !/empiezan el \d/.test(item.a)), provincia.slug).toBe(true);
		}
		const mendoza = provincias.find((provincia) => provincia.slug === 'mendoza')!;
		expect(introProvincia(mendoza, calendario.jurisdicciones.mendoza!, 2027)).toContain('Dirección General de Escuelas (DGE)');
		expect(keywordsProvincia(mendoza, 2027)).toEqual([
			'calendario escolar 2027 mendoza',
			'inicio de clases 2027 mendoza',
			'ciclo lectivo 2027 mendoza',
			'vacaciones de invierno 2027 mendoza',
		]);
	});
});
