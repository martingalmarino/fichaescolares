import { jurisdiccionDe, calendarioDe, type Jurisdiccion } from '../../data/calendario-escolar';
import { efemerides } from '../../data/efemerides';
import { efemeridesDelMes, fechaDelAnio, feriadosDelAnio, isoDe, nombreMes, partesIso } from '../calendario';
import { ANIO_PLANIFICADOR, armarCiclo, diaSemana, diasEntre, etiquetaEstado, lunesDe, sumarIso, type CicloLectivo } from './fechas';
import type { OrganizacionPeriodos } from './opciones';

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const ORDEN_CICLO = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
const SLUGS_ACTO = ['25-de-mayo', '20-de-junio', '9-de-julio', '17-de-agosto', '11-de-septiembre', '12-de-octubre'];

export interface DiaLectivo {
	iso: string;
	dia: number;
	mes: number;
	anio: number;
	habil: boolean;
	finDeSemana: boolean;
	feriado: string | null;
	receso: string | null;
	hito: string | null;
	notas: string[];
}

export interface MesLectivo {
	mes: number;
	anio: number;
	nombre: string;
	semanas: (DiaLectivo | null)[][];
	habiles: number;
	estimados: boolean;
}

export interface PeriodoLectivo {
	clave: string;
	nombre: string;
	desde: string;
	hasta: string;
	etiquetaMeses: string;
	habiles: number;
	estimados: boolean;
}

export interface SemanaLectiva {
	desde: string;
	hasta: string;
	dias: (DiaLectivo | null)[];
	habiles: number;
}

export interface ActoPlan {
	slug: string;
	titulo: string;
	dia: number;
	mes: number;
}

export interface PlanLectivo {
	anio: number;
	slug: string;
	ciclo: CicloLectivo;
	meses: MesLectivo[];
	mesesCiclo: MesLectivo[];
	periodos: PeriodoLectivo[];
	semanas: SemanaLectiva[];
	totalHabiles: number;
	estimados: boolean;
	actos: ActoPlan[];
}

export function planDe(slug: string, periodos: OrganizacionPeriodos, anio = ANIO_PLANIFICADOR): PlanLectivo {
	const calendario = calendarioDe(anio);
	const jurisdiccion = jurisdiccionDe(calendario, slug);
	return armarPlan(anio, slug, jurisdiccion, periodos);
}

export function armarPlan(anio: number, slug: string, jurisdiccion: Jurisdiccion, periodos: OrganizacionPeriodos): PlanLectivo {
	const ciclo = armarCiclo(anio, jurisdiccion);
	const feriados = indiceFeriados(anio, jurisdiccion);
	const recesos = indiceRecesos(ciclo, jurisdiccion);
	const notas = indiceNotas(anio, feriados);
	const porIso = new Map<string, DiaLectivo>();
	for (let mes = 1; mes <= 12; mes += 1) {
		const cantidad = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
		for (let dia = 1; dia <= cantidad; dia += 1) {
			const iso = isoDe(anio, mes, dia);
			porIso.set(iso, armarDia(iso, anio, mes, dia, ciclo, feriados, recesos, notas));
		}
	}
	const meses = Array.from({ length: 12 }, (_, indice) => armarMes(anio, indice + 1, ciclo, porIso));
	const totalHabiles = meses.reduce((suma, mes) => suma + mes.habiles, 0);
	return {
		anio,
		slug,
		ciclo,
		meses,
		mesesCiclo: ORDEN_CICLO.map((mes) => meses[mes - 1]!),
		periodos: periodosDe(ciclo, periodos, porIso),
		semanas: semanasDe(ciclo, porIso),
		totalHabiles,
		estimados: ciclo.provisorio,
		actos: actosDePlanificacion(anio),
	};
}

export function actosDePlanificacion(anio: number): ActoPlan[] {
	return SLUGS_ACTO.flatMap((slug) => {
		const item = efemerides.find((fecha) => fecha.slug === slug);
		if (!item) return [];
		const fecha = fechaDelAnio(item, anio);
		if (!fecha) return [];
		return [{ slug, titulo: item.titulo, dia: fecha.dia, mes: fecha.mes }];
	});
}

export function actosEscolares(anio: number): ActoPlan[] {
	return efemerides
		.filter((item) => item.tipo === 'acto-escolar')
		.flatMap((item) => {
			const fecha = fechaDelAnio(item, anio);
			if (!fecha) return [];
			return [{ slug: item.slug, titulo: item.titulo, dia: fecha.dia, mes: fecha.mes }];
		})
		.sort((a, b) => a.mes - b.mes || a.dia - b.dia);
}

export function textoHabiles(cantidad: number, estimados: boolean): string {
	const unidad = cantidad === 1 ? 'día hábil' : 'días hábiles';
	return estimados ? `${cantidad} ${unidad} estimados` : `${cantidad} ${unidad}`;
}

export function diaDeMes(dia: number, mes: number): string {
	const nombre = nombreMes(mes).toLocaleLowerCase('es-AR');
	const capital = nombre.charAt(0).toLocaleUpperCase('es-AR') + nombre.slice(1);
	return `${dia} de ${capital}`;
}

function armarDia(
	iso: string,
	anio: number,
	mes: number,
	dia: number,
	ciclo: CicloLectivo,
	feriados: Map<string, { titulo: string; slug: string | null }>,
	recesos: Map<string, string>,
	notas: Map<string, string[]>,
): DiaLectivo {
	const dow = diaSemana(iso);
	const finDeSemana = dow === 0 || dow === 6;
	const enCiclo = iso >= ciclo.inicio.iso && iso <= ciclo.fin.iso;
	const feriado = feriados.get(iso)?.titulo ?? null;
	const receso = etiquetaReceso(iso, ciclo, recesos);
	const habil = enCiclo && !finDeSemana && !feriado && !recesos.has(iso);
	let hito: string | null = null;
	if (iso === ciclo.inicio.iso) hito = etiquetaEstado(ciclo.inicio.estado, 'Inicio de clases');
	else if (iso === ciclo.fin.iso) hito = etiquetaEstado(ciclo.fin.estado, 'Fin de clases');
	return {
		iso,
		dia,
		mes,
		anio,
		habil,
		finDeSemana,
		feriado,
		receso,
		hito,
		notas: notas.get(iso) ?? [],
	};
}

function etiquetaReceso(iso: string, ciclo: CicloLectivo, recesos: Map<string, string>): string | null {
	if (!recesos.has(iso)) return null;
	if (iso === ciclo.invierno.desde.iso) return etiquetaEstado(ciclo.invierno.desde.estado, 'Receso invernal');
	return 'Receso';
}

function armarMes(anio: number, mes: number, ciclo: CicloLectivo, porIso: Map<string, DiaLectivo>): MesLectivo {
	const cantidad = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
	const primero = diaSemana(isoDe(anio, mes, 1));
	const offset = (primero + 6) % 7;
	const celdas: (DiaLectivo | null)[] = Array.from({ length: offset }, () => null);
	let habiles = 0;
	for (let dia = 1; dia <= cantidad; dia += 1) {
		const item = porIso.get(isoDe(anio, mes, dia)) ?? null;
		if (item?.habil) habiles += 1;
		celdas.push(item);
	}
	while (celdas.length % 7 !== 0) celdas.push(null);
	const semanas: (DiaLectivo | null)[][] = [];
	for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
	const inicioMes = isoDe(anio, mes, 1);
	const finMes = isoDe(anio, mes, cantidad);
	const cruza = inicioMes <= ciclo.fin.iso && finMes >= ciclo.inicio.iso;
	return {
		mes,
		anio,
		nombre: nombreMes(mes),
		semanas,
		habiles,
		estimados: ciclo.provisorio && cruza,
	};
}

function periodosDe(ciclo: CicloLectivo, organizacion: OrganizacionPeriodos, porIso: Map<string, DiaLectivo>): PeriodoLectivo[] {
	const anio = ciclo.anio;
	const ventanas =
		organizacion === 'cuatrimestres'
			? [
					{ clave: 'c1', nombre: '1.er cuatrimestre', desde: ciclo.inicio.iso, hasta: minIso(ciclo.fin.iso, `${anio}-06-30`) },
					{ clave: 'c2', nombre: '2.º cuatrimestre', desde: maxIso(ciclo.inicio.iso, `${anio}-07-01`), hasta: ciclo.fin.iso },
				]
			: [
					{ clave: 't1', nombre: '1.er trimestre', desde: ciclo.inicio.iso, hasta: minIso(ciclo.fin.iso, `${anio}-05-31`) },
					{ clave: 't2', nombre: '2.º trimestre', desde: maxIso(ciclo.inicio.iso, `${anio}-06-01`), hasta: minIso(ciclo.fin.iso, `${anio}-08-31`) },
					{ clave: 't3', nombre: '3.er trimestre', desde: maxIso(ciclo.inicio.iso, `${anio}-09-01`), hasta: ciclo.fin.iso },
				];
	return ventanas
		.filter((ventana) => ventana.desde <= ventana.hasta)
		.map((ventana) => ({
			...ventana,
			etiquetaMeses: rangoMeses(ventana.desde, ventana.hasta),
			habiles: contarHabiles(porIso, ventana.desde, ventana.hasta),
			estimados: ciclo.provisorio,
		}));
}

function semanasDe(ciclo: CicloLectivo, porIso: Map<string, DiaLectivo>): SemanaLectiva[] {
	const semanas: SemanaLectiva[] = [];
	let cursor = lunesDe(ciclo.inicio.iso);
	const limite = ciclo.fin.iso;
	while (cursor <= limite) {
		const dias = Array.from({ length: 7 }, (_, indice) => porIso.get(sumarIso(cursor, indice)) ?? null);
		semanas.push({
			desde: cursor,
			hasta: sumarIso(cursor, 6),
			dias,
			habiles: dias.filter((dia) => dia?.habil).length,
		});
		cursor = sumarIso(cursor, 7);
	}
	return semanas;
}

function contarHabiles(porIso: Map<string, DiaLectivo>, desde: string, hasta: string): number {
	return diasEntre(desde, hasta).reduce((suma, iso) => suma + (porIso.get(iso)?.habil ? 1 : 0), 0);
}

function indiceFeriados(anio: number, jurisdiccion: Jurisdiccion): Map<string, { titulo: string; slug: string | null }> {
	const mapa = new Map<string, { titulo: string; slug: string | null }>();
	for (const feriado of feriadosDelAnio(anio)) {
		const iso = isoDe(feriado.anio, feriado.mes, feriado.dia);
		const titulo = feriado.noLaborable ? `${feriado.titulo} (no laborable)` : feriado.titulo;
		mapa.set(iso, { titulo, slug: feriado.slug });
	}
	for (const feriado of jurisdiccion.feriadosProvinciales) {
		const previo = mapa.get(feriado.fecha);
		mapa.set(feriado.fecha, {
			titulo: previo ? `${previo.titulo}. ${feriado.nombre}` : feriado.nombre,
			slug: previo?.slug ?? null,
		});
	}
	return mapa;
}

function indiceRecesos(ciclo: CicloLectivo, jurisdiccion: Jurisdiccion): Map<string, string> {
	const mapa = new Map<string, string>();
	for (const iso of diasEntre(ciclo.invierno.desde.iso, ciclo.invierno.hasta.iso)) mapa.set(iso, 'Receso invernal');
	for (const item of jurisdiccion.sinClases) {
		if ('fecha' in item) mapa.set(item.fecha, item.nombre);
		else for (const iso of diasEntre(item.desde, item.hasta)) mapa.set(iso, item.nombre);
	}
	return mapa;
}

function indiceNotas(anio: number, feriados: Map<string, { titulo: string; slug: string | null }>): Map<string, string[]> {
	const mapa = new Map<string, string[]>();
	for (let mes = 1; mes <= 12; mes += 1) {
		for (const fecha of efemeridesDelMes(efemerides, mes, anio)) {
			const iso = isoDe(anio, fecha.mes, fecha.dia);
			if (feriados.get(iso)?.slug === fecha.slug) continue;
			const lista = mapa.get(iso) ?? [];
			lista.push(fecha.titulo);
			mapa.set(iso, lista);
		}
	}
	return mapa;
}

function rangoMeses(desde: string, hasta: string): string {
	const ini = MESES_CORTOS[partesIso(desde).mes - 1] ?? '';
	const fin = MESES_CORTOS[partesIso(hasta).mes - 1] ?? '';
	return ini === fin ? ini : `${ini} – ${fin}`;
}

function minIso(a: string, b: string): string {
	return a < b ? a : b;
}

function maxIso(a: string, b: string): string {
	return a > b ? a : b;
}
