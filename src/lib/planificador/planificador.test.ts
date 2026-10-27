import { describe, expect, it } from 'vitest';
import { calendarioDe, jurisdiccionDe, type Jurisdiccion } from '../../data/calendario-escolar';
import { provincias } from '../../data/provincias';
import { contarPalabras, MAX_DESCRIPCION, MAX_TITULO, MIN_DESCRIPCION } from '../meta';
import {
	hojasAgendaDefecto,
	parrafosAgenda,
	parrafosAsistencia,
	parrafosPlanificacion,
	parrafosPlanificador,
	preguntasAgenda,
	preguntasAsistencia,
	preguntasPlanificacion,
	preguntasPlanificador,
	respuestaAgenda,
	respuestaAsistencia,
	respuestaPlanificacion,
	respuestaPlanificador,
	seoAgenda,
	seoAsistencia,
	seoPlanificacion,
	seoPlanificador,
} from '../../data/planificador-contenido';
import { armarCiclo, cicloDe, cicloEjemplo } from './fechas';
import { armarPlan, planDe } from './anio';
import { AREAS_POR_NIVEL } from './areas';
import { leerAlumnos, leerCumpleanos, opcionesDesdeParams, paramsDesdeOpciones } from './opciones';
import { opcionesPlanificacionDesdeParams, paginasDeAreas, paramsPlanificacion } from './planificacion';
import { diasDeAsistencia, opcionesAsistenciaDesdeParams, paginasDeNombres, paramsAsistencia } from './asistencia';

const VACIA: Jurisdiccion = {
	estado: 'a-confirmar',
	inicio: null,
	invierno: { desde: null, hasta: null },
	fin: null,
	fuente: null,
	notas: null,
	feriadosProvinciales: [],
	sinClases: [],
};

describe('ciclo lectivo', () => {
	it('marca provisorio el ciclo de ejemplo y oficial el dato publicado', () => {
		const ejemplo = cicloEjemplo(2027);
		expect(ejemplo.inicio).toBe('2027-03-01');
		expect(ejemplo.inviernoDesde).toBe('2027-07-12');
		expect(ejemplo.inviernoHasta).toBe('2027-07-23');
		expect(ejemplo.fin).toBe('2027-12-17');

		const provisorio = armarCiclo(2027, VACIA);
		expect(provisorio.provisorio).toBe(true);
		expect(provisorio.inicio).toEqual({ iso: '2027-03-01', estado: 'provisoria' });

		const oficial = armarCiclo(2027, {
			...VACIA,
			estado: 'oficial',
			inicio: '2027-03-02',
			invierno: { desde: '2027-07-19', hasta: '2027-07-30' },
			fin: '2027-12-10',
			fuente: 'https://ejemplo.test/calendario',
		});
		expect(oficial.provisorio).toBe(false);
		expect(oficial.inicio.iso).toBe('2027-03-02');
		expect(oficial.inicio.estado).toBe('oficial');
	});

	it('lee la misma jurisdicción que el calendario y se actualiza si pasa a oficial', () => {
		const jurisdiccion = jurisdiccionDe(calendarioDe(2027), 'cordoba');
		const ciclo = cicloDe('cordoba');
		if (jurisdiccion.estado === 'oficial') {
			expect(ciclo.provisorio).toBe(false);
			expect(ciclo.inicio.iso).toBe(jurisdiccion.inicio);
			expect(ciclo.fin.iso).toBe(jurisdiccion.fin);
		} else {
			expect(ciclo.provisorio).toBe(true);
			expect(ciclo.inicio.estado).toBe('provisoria');
		}
	});
});

describe('días hábiles', () => {
	const plan = armarPlan(2027, 'cordoba', VACIA, 'trimestres');

	it('en marzo 2027 de ejemplo deja 20 días, sin fines de semana ni feriados', () => {
		const marzo = plan.meses[2];
		expect(marzo?.habiles).toBe(20);
		expect(marzo?.estimados).toBe(true);
		const inicio = marzo?.semanas.flat().find((dia) => dia?.iso === '2027-03-01');
		expect(inicio?.hito).toBe('Inicio de clases (provisorio)');
		expect(inicio?.habil).toBe(true);
		for (const iso of ['2027-03-06', '2027-03-07', '2027-03-24', '2027-03-25', '2027-03-26']) {
			expect(plan.meses[2]?.semanas.flat().find((dia) => dia?.iso === iso)?.habil).toBe(false);
		}
		expect(plan.meses[2]?.semanas.flat().find((dia) => dia?.iso === '2027-03-25')?.feriado).toBe('Jueves Santo (no laborable)');
	});

	it('no cuenta el receso ni un día sin clases', () => {
		for (const iso of ['2027-07-12', '2027-07-16', '2027-07-23']) {
			const dia = plan.meses[6]?.semanas.flat().find((item) => item?.iso === iso);
			expect(dia?.habil).toBe(false);
		}
		expect(plan.meses[6]?.semanas.flat().find((dia) => dia?.iso === '2027-07-12')?.receso).toBe('Receso invernal (provisorio)');

		const conHueco = armarPlan(2027, 'cordoba', { ...VACIA, sinClases: [{ fecha: '2027-03-03', nombre: 'Asueto local' }] }, 'trimestres');
		expect(conHueco.meses[2]?.habiles).toBe(19);
	});

	it('los períodos suman el mismo total y no se pisan', () => {
		const suma = plan.periodos.reduce((total, periodo) => total + periodo.habiles, 0);
		expect(suma).toBe(plan.totalHabiles);
		expect(plan.periodos.map((periodo) => periodo.nombre)).toEqual(['1.er trimestre', '2.º trimestre', '3.er trimestre']);
		const cuatrimestres = armarPlan(2027, 'cordoba', VACIA, 'cuatrimestres');
		expect(cuatrimestres.periodos).toHaveLength(2);
		expect(cuatrimestres.periodos.reduce((total, periodo) => total + periodo.habiles, 0)).toBe(cuatrimestres.totalHabiles);
	});

	it('un inicio oficial cambia la cuenta de marzo', () => {
		const oficial = armarPlan(
			2027,
			'cordoba',
			{
				...VACIA,
				estado: 'oficial',
				inicio: '2027-03-02',
				invierno: { desde: '2027-07-12', hasta: '2027-07-23' },
				fin: '2027-12-17',
				fuente: 'https://ejemplo.test/calendario',
			},
			'trimestres',
		);
		expect(oficial.estimados).toBe(false);
		expect(oficial.meses[2]?.habiles).toBe(19);
		expect(oficial.meses[2]?.estimados).toBe(false);
		expect(oficial.meses[2]?.semanas.flat().find((dia) => dia?.iso === '2027-03-02')?.hito).toBe('Inicio de clases');
	});
});

describe('opciones y datos locales', () => {
	const slugs = provincias.map((provincia) => provincia.slug);

	it('restaura provincia, nivel y secciones, y omite el incluyo por defecto', () => {
		const opciones = opcionesDesdeParams(new URLSearchParams('prov=cordoba&nivel=primario'), slugs);
		expect(opciones.prov).toBe('cordoba');
		expect(opciones.nivel).toBe('primario');
		expect(opciones.grado).toBe('3');
		expect(opciones.secciones).toContain('meses');
		expect(opciones.secciones).not.toContain('semanas');
		expect(paramsDesdeOpciones(opciones)).not.toContain('inc=');

		const recorte = opcionesDesdeParams(new URLSearchParams('prov=no-existe&nivel=inicial&grado=3&inc=portada,semanas'), slugs);
		expect(recorte.prov).toBe('cordoba');
		expect(recorte.grado).toBe('sala-5');
		expect(recorte.secciones).toEqual(['portada', 'semanas']);
	});

	it('la agenda marca la semana a semana y deja la planificación fuera de la URL limpia', () => {
		const opciones = opcionesDesdeParams(new URLSearchParams('prov=cordoba'), slugs, 'agenda');
		expect(opciones.secciones).toContain('semanas');
		expect(opciones.secciones).toContain('actos');
		expect(opciones.secciones).not.toContain('planificacion');
		expect(paramsDesdeOpciones(opciones, 'agenda')).not.toContain('inc=');
		expect(paramsDesdeOpciones({ ...opciones, secciones: [...opciones.secciones, 'planificacion'] }, 'agenda')).toContain('planificacion');
	});

	it('la planificación deja grado y áreas en la consulta, no en una ruta propia', () => {
		const base = opcionesPlanificacionDesdeParams(new URLSearchParams('prov=cordoba&nivel=primario&grado=1'), slugs);
		expect(base.grado).toBe('1');
		expect(base.orientacion).toBe('vertical');
		expect(base.areas).toEqual(AREAS_POR_NIVEL.primario.map((area) => area.id));
		expect(paramsPlanificacion(base)).not.toContain('areas=');
		expect(paramsPlanificacion(base)).not.toContain('ori=');
		expect(paramsPlanificacion(base)).toContain('grado=1');

		const recorte = opcionesPlanificacionDesdeParams(new URLSearchParams('nivel=inicial&ori=horizontal&areas=edfisica,lenguaje'), slugs);
		expect(recorte.nivel).toBe('inicial');
		expect(recorte.orientacion).toBe('horizontal');
		expect(recorte.areas).toEqual(['edfisica']);
		expect(paramsPlanificacion(recorte)).toContain('ori=horizontal');
		expect(paramsPlanificacion(recorte)).toContain('areas=edfisica');

		const primaria = AREAS_POR_NIVEL.primario.map((area) => area.label);
		expect(paginasDeAreas(primaria, 'vertical')).toHaveLength(2);
		expect(paginasDeAreas(primaria, 'horizontal')).toHaveLength(1);
		expect(paginasDeAreas(AREAS_POR_NIVEL.inicial.map((area) => area.label), 'vertical')).toHaveLength(2);
	});

	it('lee alumnos y cumpleaños sin fechas imposibles', () => {
		expect(leerAlumnos(' Ana \n\nLuis ')).toEqual(['Ana', 'Luis']);
		expect(leerCumpleanos('Ana Pérez, 12/3\nLeo 31/2\nSol, 29/2')).toEqual([
			{ nombre: 'Sol', dia: 29, mes: 2 },
			{ nombre: 'Ana Pérez', dia: 12, mes: 3 },
		]);
	});
});

describe('textos de la página', () => {
	it('respeta el largo de title y meta, y no usa las búsquedas del calendario', () => {
		expect(seoPlanificador.title.length).toBeLessThanOrEqual(MAX_TITULO);
		expect(seoPlanificador.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPCION);
		expect(seoPlanificador.description.length).toBeLessThanOrEqual(MAX_DESCRIPCION);
		expect(seoPlanificador.h1).toBe('Planificador docente 2027 para imprimir');
		const reservado = /calendario escolar 2027|cuándo empiezan las clases/i;
		expect(seoPlanificador.title).not.toMatch(reservado);
		expect(seoPlanificador.description).not.toMatch(reservado);
		expect(seoPlanificador.h1).not.toMatch(reservado);
		expect(respuestaPlanificador).not.toMatch(reservado);
		for (const pregunta of preguntasPlanificador) {
			expect(`${pregunta.q} ${pregunta.a}`).not.toMatch(reservado);
		}
	});

	it('el texto de abajo queda entre 400 y 600 palabras', () => {
		const palabras = contarPalabras(parrafosPlanificador.join(' '));
		expect(palabras).toBeGreaterThanOrEqual(400);
		expect(palabras).toBeLessThanOrEqual(600);
	});

	it('la agenda respeta el largo, las preguntas y no usa las búsquedas del calendario', () => {
		expect(seoAgenda.title).toBe('Agenda docente 2027 para imprimir en PDF gratis | Aulita');
		expect(seoAgenda.h1).toBe('Agenda docente 2027 para imprimir');
		expect(seoAgenda.description).toBe(
			'Descargá tu agenda docente 2027 en A4, gratis: portada con tu nombre, meses con feriados y efemérides de tu provincia, semana a semana, cumpleaños y asistencia.',
		);
		expect(seoAgenda.title.length).toBeLessThanOrEqual(MAX_TITULO);
		expect(seoAgenda.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPCION);
		expect(seoAgenda.description.length).toBeLessThanOrEqual(MAX_DESCRIPCION);
		const reservado = /calendario escolar 2027|cuándo empiezan las clases/i;
		expect(seoAgenda.title).not.toMatch(reservado);
		expect(seoAgenda.description).not.toMatch(reservado);
		expect(seoAgenda.h1).not.toMatch(reservado);
		expect(respuestaAgenda).not.toMatch(reservado);
		expect(respuestaAgenda.split(/(?<=\.)\s+/)).toHaveLength(2);
		for (const pregunta of preguntasAgenda) {
			expect(`${pregunta.q} ${pregunta.a}`).not.toMatch(reservado);
		}
		expect(preguntasAgenda.map((item) => item.q)).toEqual([
			'¿Se puede imprimir en A5?',
			'¿Trae los feriados de mi provincia?',
			'¿Es editable?',
			'¿Cuántas hojas tiene?',
		]);
		const palabras = contarPalabras(parrafosAgenda.join(' '));
		expect(palabras).toBeGreaterThanOrEqual(300);
		expect(palabras).toBeLessThanOrEqual(500);
		const html = parrafosAgenda.join(' ');
		expect(html).toContain('href="/planificador-docente-2027/"');
		expect(html).toContain('href="/planificacion-anual/"');
		expect(html).toContain('href="/registro-de-asistencia/"');
		expect(html).toContain('href="/calendario-escolar-2027/"');
		expect(html).toContain('href="/"');
		expect(html).toContain('anill');
		expect(html).toContain('A5');
		const plan = planDe('cordoba', 'trimestres');
		expect(hojasAgendaDefecto).toBe(1 + plan.mesesCiclo.length + plan.semanas.length + 1);
		expect(preguntasAgenda[3]?.a).toContain(String(hojasAgendaDefecto));
	});

	it('la planificación anual respeta el largo y no usa las búsquedas del calendario', () => {
		expect(seoPlanificacion.h1).toBe('Planificación anual para imprimir');
		expect(seoPlanificacion.description).toBe(
			'Plantilla de planificación anual en A4 para primaria y nivel inicial: áreas por trimestre o cuatrimestre con los días hábiles de tu provincia ya calculados.',
		);
		expect(seoPlanificacion.title.length).toBeLessThanOrEqual(MAX_TITULO);
		expect(seoPlanificacion.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPCION);
		expect(seoPlanificacion.description.length).toBeLessThanOrEqual(MAX_DESCRIPCION);
		const reservado = /calendario escolar 2027|cuándo empiezan las clases/i;
		expect(seoPlanificacion.title).not.toMatch(reservado);
		expect(seoPlanificacion.description).not.toMatch(reservado);
		expect(seoPlanificacion.h1).not.toMatch(reservado);
		expect(respuestaPlanificacion).not.toMatch(reservado);
		for (const pregunta of preguntasPlanificacion) {
			expect(`${pregunta.q} ${pregunta.a}`).not.toMatch(reservado);
		}
		expect(preguntasPlanificacion.map((item) => item.q)).toEqual([
			'¿Qué partes tiene una planificación anual?',
			'¿Trimestres o cuatrimestres?',
			'¿Sirve para nivel inicial?',
			'¿Cómo se cuentan los días de clase?',
		]);
		const palabras = contarPalabras(parrafosPlanificacion.join(' '));
		expect(palabras).toBeGreaterThanOrEqual(400);
		expect(palabras).toBeLessThanOrEqual(600);
		const html = parrafosPlanificacion.join(' ');
		expect(html).toContain('href="/planificador-docente-2027/"');
		expect(html).toContain('href="/agenda-docente-2027/"');
		expect(html).toContain('href="/calendario-escolar-2027/"');
		expect(html).toContain('href="/como-se-califica-en-primaria/"');
		expect(html).toContain('href="/"');
		expect(html).toContain('Res. CFE 174/12');
	});

	it('el registro de asistencia respeta el largo y no usa las búsquedas del calendario', () => {
		expect(seoAsistencia.h1).toBe('Registro de asistencia para imprimir');
		expect(seoAsistencia.description).toBe(
			'Planilla de asistencia por mes en A4: los días hábiles de tu provincia ya cargados, feriados marcados y tu lista de alumnos. Para primaria y secundaria.',
		);
		expect(seoAsistencia.title.length).toBeLessThanOrEqual(MAX_TITULO);
		expect(seoAsistencia.description.length).toBeGreaterThanOrEqual(MIN_DESCRIPCION);
		expect(seoAsistencia.description.length).toBeLessThanOrEqual(MAX_DESCRIPCION);
		const reservado = /calendario escolar 2027|cuándo empiezan las clases/i;
		expect(seoAsistencia.title).not.toMatch(reservado);
		expect(seoAsistencia.description).not.toMatch(reservado);
		expect(seoAsistencia.h1).not.toMatch(reservado);
		expect(respuestaAsistencia).not.toMatch(reservado);
		for (const pregunta of preguntasAsistencia) {
			expect(`${pregunta.q} ${pregunta.a}`).not.toMatch(reservado);
		}
		expect(preguntasAsistencia.map((item) => item.q)).toEqual([
			'¿Se guardan los nombres de mis alumnos?',
			'¿Puedo imprimir todo el año?',
			'¿Qué significa J?',
			'¿Sirve para secundaria?',
		]);
		const palabras = contarPalabras(parrafosAsistencia.join(' '));
		expect(palabras).toBeGreaterThanOrEqual(300);
		expect(palabras).toBeLessThanOrEqual(500);
		const html = parrafosAsistencia.join(' ');
		expect(html).toContain('href="/planificador-docente-2027/"');
		expect(html).toContain('href="/agenda-docente-2027/"');
		expect(html).toContain('href="/planificacion-anual/"');
		expect(html).toContain('href="/"');
		expect(html).not.toMatch(/alumnos=/);
	});

	it('arma el plan de las 24 provincias', () => {
		for (const provincia of provincias) {
			const plan = planDe(provincia.slug, 'trimestres');
			expect(plan.meses).toHaveLength(12);
			expect(plan.totalHabiles).toBeGreaterThan(0);
		}
	});
});

describe('registro de asistencia', () => {
	const slugs = provincias.map((provincia) => provincia.slug);

	it('deja el mes y las filas fuera de la URL cuando son los de fábrica', () => {
		const base = opcionesAsistenciaDesdeParams(new URLSearchParams('prov=cordoba'), slugs);
		expect(base).toEqual({ prov: 'cordoba', nivel: 'primario', mes: 3, filas: 25 });
		expect(paramsAsistencia(base)).toBe('prov=cordoba&nivel=primario');
		expect(paramsAsistencia(base)).not.toContain('alumnos');

		const anio = opcionesAsistenciaDesdeParams(new URLSearchParams('nivel=secundario&mes=anio&filas=40'), slugs);
		expect(anio.nivel).toBe('secundario');
		expect(anio.mes).toBe('anio');
		expect(anio.filas).toBe(40);
		expect(paramsAsistencia(anio)).toContain('mes=anio');
		expect(paramsAsistencia(anio)).toContain('filas=40');

		const raro = opcionesAsistenciaDesdeParams(new URLSearchParams('prov=no-existe&mes=13&filas=7'), slugs);
		expect(raro.prov).toBe('cordoba');
		expect(raro.mes).toBe(3);
		expect(raro.filas).toBe(25);
	});

	it('tacha feriados y receso, y parte la lista según las filas', () => {
		const marzo = planDe('cordoba', 'trimestres').mesesCiclo.find((mes) => mes.mes === 3);
		if (!marzo) throw new Error('falta marzo');
		const dias = diasDeAsistencia(marzo);
		expect(dias.every((dia) => !dia.finDeSemana)).toBe(true);
		expect(dias.filter((dia) => dia.habil)).toHaveLength(marzo.habiles);
		expect(dias.find((dia) => dia.dia === 24)?.habil).toBe(false);
		expect(dias.find((dia) => dia.dia === 25)?.feriado).toMatch(/Jueves Santo/);
		expect(dias.find((dia) => dia.dia === 26)?.habil).toBe(false);

		const julio = planDe('cordoba', 'trimestres').mesesCiclo.find((mes) => mes.mes === 7);
		if (!julio) throw new Error('falta julio');
		expect(diasDeAsistencia(julio).some((dia) => dia.receso && !dia.habil)).toBe(true);

		expect(paginasDeNombres([], 25)).toEqual([Array.from({ length: 25 }, () => '')]);
		expect(paginasDeNombres(['Ana', 'Luis'], 25)[0]).toHaveLength(25);
		expect(paginasDeNombres(Array.from({ length: 30 }, (_, i) => `A${i}`), 25)).toHaveLength(2);
	});
});
