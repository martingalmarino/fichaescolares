import { describe, expect, it } from 'vitest';
import { calendarioDe } from '../data/calendario-escolar';
import { provincias } from '../data/provincias';
import { contarPalabras } from './meta';
import { cuadroBuenosAires, fechaCorta, filasResumen, filasVacacionesInvierno, introBuenosAires, introCaba, introCalendarioNacional, introCordoba, introProvincia, introVacacionesInvierno, inviernoCaba, keywordsCordoba, keywordsProvincia, preguntasBuenosAires, preguntasCaba, preguntasCordoba, preguntasNacional, preguntasProvincia, preguntasVacacionesInvierno, regionesEscolares } from './texto-calendario';

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

	it('responde el inicio 2027 con CABA y Córdoba oficiales y el resto a confirmar', () => {
		const calendario = calendarioDe(2027);
		const intro = introCalendarioNacional(calendario);
		const palabras = contarPalabras(intro);
		expect(palabras).toBeGreaterThanOrEqual(40);
		expect(palabras).toBeLessThanOrEqual(60);
		expect(intro).toContain('En la Ciudad de Buenos Aires y en Córdoba el inicio oficial es el lunes 1 de marzo de 2027');
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
		const cordoba = filas.find((fila) => fila.provincia.slug === 'cordoba');
		expect(cordoba).toMatchObject({
			estado: 'Oficial',
			inicio: 'lunes 1 de marzo de 2027',
			invierno: '12 al 23 de julio',
			fin: 'viernes 17 de diciembre de 2027',
		});
		const pendientes = filas.filter((fila) => fila.provincia.slug !== 'caba' && fila.provincia.slug !== 'cordoba');
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
		expect(preguntas.at(-1)?.a).toBe(
			'Por ahora, la Ciudad de Buenos Aires (clases del 1 de marzo al 17 de diciembre) y Córdoba (clases del 1 de marzo al 17 de diciembre).',
		);
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

	it('explica el calendario oficial 2027 de Córdoba', () => {
		const jurisdiccion = calendarioDe(2027).jurisdicciones.cordoba!;
		expect(introCordoba(jurisdiccion, 2027)).toBe(
			'Las clases 2027 en Córdoba comienzan el lunes 1 de marzo y terminan el viernes 17 de diciembre. Las vacaciones de invierno son del 12 al 23 de julio, según la Resolución 197/2026 del Ministerio de Educación.',
		);
		const preguntas = preguntasCordoba(jurisdiccion, 2027);
		expect(preguntas.map((item) => item.q)).toEqual([
			'¿Cuándo empiezan las clases 2027 en Córdoba?',
			'¿Cuándo son las vacaciones de invierno 2027 en Córdoba?',
			'¿Cuándo terminan las clases 2027 en Córdoba?',
			'¿Cuándo vuelven los docentes?',
			'¿Cuántos días de clase hay?',
		]);
		expect(preguntas[0]?.a).toContain('lunes 1 de marzo');
		expect(preguntas[1]?.a).toContain('12 al 23 de julio');
		expect(preguntas[1]?.a).toContain('lunes 26 de julio');
		expect(preguntas[2]?.a).toContain('viernes 17 de diciembre');
		expect(preguntas[3]?.a).toContain('lunes 15 de febrero de 2027');
		expect(preguntas[4]?.a).toContain('190');
		expect(preguntas.map((item) => item.a).join(' ')).not.toMatch(/a confirmar/i);
		expect(keywordsCordoba(2027)).toEqual([
			'calendario escolar 2027 córdoba',
			'inicio de clases 2027 córdoba',
			'vacaciones de invierno 2027 córdoba',
			'fin de clases 2027 córdoba',
			'resolución 197/2026',
		]);
	});

	it('responde el inicio de cada provincia sin fechas que el organismo no publicó', () => {
		const calendario = calendarioDe(2027);
		for (const provincia of provincias) {
			if (provincia.slug === 'caba' || provincia.slug === 'buenos-aires' || provincia.slug === 'cordoba') continue;
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

describe('vacaciones de invierno 2027', () => {
	it('lista las 24 jurisdicciones y marca CABA oficial del 19 al 30 de julio', () => {
		const calendario = calendarioDe(2027);
		expect(calendario.cfeInvierno).toBeNull();
		const regiones = filasVacacionesInvierno(calendario);
		const filas = regiones.flatMap((region) => region.filas);
		expect(filas).toHaveLength(24);
		expect(new Set(filas.map((fila) => fila.provincia.slug)).size).toBe(24);
		const caba = filas.find((fila) => fila.provincia.slug === 'caba');
		expect(caba).toMatchObject({
			oficial: true,
			estado: 'Oficial',
			receso: '19 al 30 de julio',
			href: '/calendario-escolar-2027/caba/#invierno',
		});
		const cordoba = filas.find((fila) => fila.provincia.slug === 'cordoba');
		expect(cordoba).toMatchObject({
			oficial: true,
			estado: 'Oficial',
			receso: '12 al 23 de julio',
			href: '/calendario-escolar-2027/cordoba/#invierno',
		});
		expect(filas.filter((fila) => fila.oficial)).toHaveLength(2);
		expect(filas.filter((fila) => !fila.oficial).every((fila) => fila.receso === 'A confirmar')).toBe(true);
		const centro = regiones.find((region) => region.id === 'centro')!;
		expect(centro.filas[0]?.provincia.slug).toBe('caba');
		expect(centro.filas[1]?.provincia.slug).toBe('cordoba');
		const intro = introVacacionesInvierno(calendario);
		expect(intro).toContain('Ciudad de Buenos Aires');
		expect(intro).toContain('19 al 30 de julio');
		expect(intro).toContain('Córdoba');
		expect(intro).toContain('12 al 23 de julio');
		const preguntas = preguntasVacacionesInvierno(calendario);
		expect(preguntas.map((item) => item.q)).toEqual([
			'¿Cuándo son las vacaciones de invierno 2027?',
			'¿Cuándo son las vacaciones de invierno 2027 en Buenos Aires?',
			'¿Cuándo son las vacaciones de invierno 2027 en CABA?',
			'¿Cuándo son las vacaciones de invierno 2027 en Córdoba?',
			'¿Cuándo son las vacaciones de invierno 2027 en Santa Fe?',
			'¿Cuánto duran las vacaciones de invierno?',
			'¿Qué provincias ya confirmaron las vacaciones de invierno 2027?',
		]);
		expect(preguntas.find((item) => item.q.includes('CABA'))?.a).toContain('19 al 30 de julio');
		expect(preguntas.find((item) => item.q.includes('Córdoba'))?.a).toContain('12 al 23 de julio');
		expect(preguntas.find((item) => item.q.includes('Córdoba'))?.a).toContain('lunes 26 de julio');
		expect(preguntas.find((item) => item.q.includes('Córdoba'))?.a).not.toMatch(/a confirmar/i);
		expect(preguntas.find((item) => item.q.includes('confirmaron'))?.a).toContain('CABA');
		expect(preguntas.find((item) => item.q.includes('confirmaron'))?.a).toContain('Córdoba');
	});
});
