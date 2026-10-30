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

	it('responde el inicio 2027 con CABA oficial y el resto a confirmar', () => {
		const calendario = calendarioDe(2027);
		const intro = introCalendarioNacional(calendario);
		const palabras = contarPalabras(intro);
		expect(palabras).toBeGreaterThanOrEqual(40);
		expect(palabras).toBeLessThanOrEqual(60);
		expect(intro).toContain('En la Ciudad de Buenos Aires el inicio oficial es el lunes 1 de marzo de 2027');
		expect(intro).toContain('figuran como a confirmar, sin fechas estimadas');

		const filas = filasResumen(calendario);
		expect(filas).toHaveLength(24);
		const caba = filas.find((fila) => fila.provincia.slug === 'caba');
		expect(caba).toMatchObject({
			estado: 'Oficial',
			inicio: 'lunes 1 de marzo de 2027',
			invierno: '19 al 30 de julio',
			fin: 'viernes 17 de diciembre de 2027',
		});
		const pendientes = filas.filter((fila) => fila.provincia.slug !== 'caba');
		expect(pendientes.every((fila) => fila.estado === 'A confirmar')).toBe(true);
		expect(pendientes.every((fila) => fila.inicio === 'A confirmar' && fila.invierno === 'A confirmar' && fila.fin === 'A confirmar')).toBe(true);
		expect(filas.map((fila) => fila.href).sort()).toEqual(provincias.map((provincia) => `/calendario-escolar-2027/${provincia.slug}/`).sort());

		const preguntas = preguntasNacional(calendario);
		expect(preguntas.map((item) => item.q)).toEqual([
			'¿Cuándo empieza el ciclo lectivo 2027?',
			'¿Cuándo son las vacaciones de invierno 2027?',
			'¿Cuántos días de clase hay en 2027?',
			'¿Cuándo se publica el calendario oficial?',
			'¿Qué provincias ya publicaron el calendario escolar 2027?',
		]);
		expect(preguntas.at(-1)?.a).toBe('Por ahora, la Ciudad de Buenos Aires (clases del 1 de marzo al 17 de diciembre).');
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

	it('explica la Agenda Educativa 2027 de CABA con las fechas oficiales', () => {
		const jurisdiccion = calendarioDe(2027).jurisdicciones.caba!;
		const intro = introCaba(jurisdiccion, 2027, '2026-10-30');
		expect(intro).toBe(
			'Las clases 2027 en la Ciudad de Buenos Aires empiezan el lunes 1 de marzo en nivel inicial y primario, y el miércoles 3 de marzo en secundario. El receso de invierno es del 19 al 30 de julio, y el ciclo lectivo termina el viernes 17 de diciembre. Los docentes vuelven a las escuelas el 10 de febrero. Fuente: Gobierno de la Ciudad, 30/10/2026.',
		);

		expect(inviernoCaba(jurisdiccion, 2027)).toContain('19 de julio de 2027');
		expect(inviernoCaba(jurisdiccion, 2027)).toContain('30 de julio de 2027');

		const preguntas = preguntasCaba(jurisdiccion, 2027);
		expect(preguntas.map((item) => item.q)).toEqual([
			'¿Cuándo empiezan las clases 2027 en CABA?',
			'¿Cuándo empieza el secundario 2027 en CABA?',
			'¿Cuándo son las vacaciones de invierno 2027 en CABA?',
			'¿Cuándo terminan las clases 2027 en CABA?',
			'¿Cuándo vuelven los docentes en 2027?',
		]);
		expect(preguntas[0]?.a).toContain('href="/calendario-escolar-2027/buenos-aires/"');
		expect(preguntas[1]?.a).toContain('miércoles 3 de marzo');
		expect(preguntas[4]?.a).toContain('10 de febrero de 2027');
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
