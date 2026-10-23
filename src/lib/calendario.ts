import { efemerides } from '../data/efemerides';

export const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'] as const;

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MESES_MIN = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MESES_SLUG = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const;
const ZONA = 'America/Argentina/Buenos_Aires';
const NOTA_TRASLADABLE = 'El feriado puede trasladarse.';

const SEMANA: Record<string, number> = {
	domingo: 0,
	lunes: 1,
	martes: 2,
	miercoles: 3,
	jueves: 4,
	viernes: 5,
	sabado: 6,
};

const MES_CORTO: Record<string, number> = {
	ene: 1,
	feb: 2,
	mar: 3,
	abr: 4,
	may: 5,
	jun: 6,
	jul: 7,
	ago: 8,
	sep: 9,
	oct: 10,
	nov: 11,
	dic: 12,
};

/** Días no laborables turísticos. Los fija una resolución de cada año. */
const DIAS_TURISTICOS: Record<number, { dia: number; mes: number }[]> = {
	2026: [
		{ dia: 23, mes: 3 },
		{ dia: 10, mes: 7 },
		{ dia: 7, mes: 12 },
	],
};

export interface FechaConmemorativa {
	dia: number | null;
	mes: number | null;
	movil?: string;
	feriado?: { regla: 'inamovible' | 'trasladable' | 'movil' | null };
}

export interface Ocurrencia {
	dia: number;
	mes: number;
	nota: string | null;
}

export function nombreMes(mes: number): string {
	return MESES[mes - 1] ?? '';
}

export function slugDeMes(mes: number): string {
	return MESES_SLUG[mes - 1] ?? '';
}

export function mesDeSlug(slug: string): number | null {
	const indice = MESES_SLUG.indexOf(slug as (typeof MESES_SLUG)[number]);
	return indice === -1 ? null : indice + 1;
}

export function chipFecha(dia: number, mes: number): string {
	return `${dia} ${MESES_CORTOS[mes - 1] ?? ''}`;
}

export function textoFecha(dia: number, mes: number, anio: number): string {
	return `${dia} de ${MESES[mes - 1] ?? ''} de ${anio}`;
}

export function isoDe(anio: number, mes: number, dia: number): string {
	return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export function partesIso(iso: string): { anio: number; mes: number; dia: number } {
	const [anio, mes, dia] = iso.split('-').map(Number);
	return { anio: anio ?? 0, mes: mes ?? 0, dia: dia ?? 0 };
}

/** «lunes 1 de marzo de 2027», en hora UTC para que la fecha no corra. */
export function fechaCompleta(anio: number, mes: number, dia: number): string {
	const semana = DIAS_SEMANA[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()] ?? '';
	return `${semana} ${dia} de ${MESES_MIN[mes - 1] ?? ''} de ${anio}`;
}

export function fechaDiaMes(dia: number, mes: number): string {
	return `${dia} de ${MESES_MIN[mes - 1] ?? ''}`;
}

export function fechaArgentina(instante: Date): { anio: number; mes: number; dia: number } {
	const partes = new Intl.DateTimeFormat('en-US', {
		timeZone: ZONA,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	}).formatToParts(instante);
	const valor = (tipo: Intl.DateTimeFormatPartTypes) => Number(partes.find((parte) => parte.type === tipo)?.value);
	return { anio: valor('year'), mes: valor('month'), dia: valor('day') };
}

/** Domingo de Pascua, algoritmo de Meeus para el calendario gregoriano. */
export function pascua(anio: number): { dia: number; mes: number } {
	const a = anio % 19;
	const b = Math.floor(anio / 100);
	const c = anio % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const mes = Math.floor((h + l - 7 * m + 114) / 31);
	const dia = ((h + l - 7 * m + 114) % 31) + 1;
	return { dia, mes };
}

function sumarDias(anio: number, mes: number, dia: number, delta: number): { dia: number; mes: number } {
	const fecha = new Date(Date.UTC(anio, mes - 1, dia + delta));
	return { dia: fecha.getUTCDate(), mes: fecha.getUTCMonth() + 1 };
}

function enesimoDia(anio: number, mes: number, semana: number, orden: number): { dia: number; mes: number } | null {
	const primero = new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay();
	const dia = 1 + ((semana - primero + 7) % 7) + (orden - 1) * 7;
	const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
	if (dia < 1 || dia > ultimo) return null;
	return { dia, mes };
}

function notaDe(item: FechaConmemorativa): string | null {
	return item.feriado?.regla === 'trasladable' ? NOTA_TRASLADABLE : null;
}

function resolverMovil(movil: string, anio: number): { dia: number; mes: number }[] {
	if (movil === 'resolucion-anual') return DIAS_TURISTICOS[anio] ?? [];
	const pascuaMatch = /^pascua-(\d+)$/.exec(movil);
	if (pascuaMatch) {
		const domingo = pascua(anio);
		return [sumarDias(anio, domingo.mes, domingo.dia, -Number(pascuaMatch[1]))];
	}
	const semanal = /^(domingo|lunes|martes|miercoles|jueves|viernes|sabado)-(\d+)-(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)$/.exec(movil);
	if (!semanal) return [];
	const mes = MES_CORTO[semanal[3] ?? ''];
	const semana = SEMANA[semanal[1] ?? ''];
	if (!mes || semana == null) return [];
	const fecha = enesimoDia(anio, mes, semana, Number(semanal[2]));
	return fecha ? [fecha] : [];
}

/** Primera ocurrencia del año. Los días turísticos no tienen una sola fecha: usar ocurrenciasDelAnio. */
export function fechaDelAnio(item: FechaConmemorativa, anio: number): Ocurrencia | null {
	if (item.movil === 'resolucion-anual') return null;
	return ocurrenciasDelAnio(item, anio)[0] ?? null;
}

export function ocurrenciasDelAnio(item: FechaConmemorativa, anio: number): Ocurrencia[] {
	const nota = notaDe(item);
	if (item.movil) {
		return resolverMovil(item.movil, anio).map((fecha) => ({ ...fecha, nota }));
	}
	if (item.dia == null || item.mes == null) return [];
	return [{ dia: item.dia, mes: item.mes, nota }];
}

export type FechaLista<T> = T & { dia: number; mes: number; anio: number; nota: string | null };

/**
 * Próximas fechas a partir de un instante, en hora de Argentina.
 * Los feriados trasladables quedan en su día conmemorativo.
 * Si la fecha es hoy, entra en la lista.
 */
export function proximasEfemerides<T extends FechaConmemorativa>(lista: T[], desde: Date, cantidad = 4): FechaLista<T>[] {
	const hoy = fechaArgentina(desde);
	const futuras: FechaLista<T>[] = [];
	for (const item of lista) {
		for (const anio of [hoy.anio, hoy.anio + 1]) {
			for (const fecha of ocurrenciasDelAnio(item, anio)) {
				const yaPaso = anio === hoy.anio && (fecha.mes < hoy.mes || (fecha.mes === hoy.mes && fecha.dia < hoy.dia));
				if (!yaPaso) futuras.push({ ...item, dia: fecha.dia, mes: fecha.mes, anio, nota: fecha.nota });
			}
		}
	}
	return futuras.sort((a, b) => a.anio - b.anio || a.mes - b.mes || a.dia - b.dia).slice(0, cantidad);
}

export function efemeridesDelMes<T extends FechaConmemorativa>(lista: T[], mes: number, anio: number): FechaLista<T>[] {
	return lista
		.flatMap((item) =>
			ocurrenciasDelAnio(item, anio)
				.filter((fecha) => fecha.mes === mes)
				.map((fecha) => ({ ...item, dia: fecha.dia, mes: fecha.mes, anio, nota: fecha.nota })),
		)
		.sort((a, b) => a.dia - b.dia);
}

export function proximaOcurrencia<T extends FechaConmemorativa>(item: T, desde: Date): FechaLista<T> | null {
	return proximasEfemerides([item], desde, 1)[0] ?? null;
}

/**
 * Traslado de feriados de la ley 27.399.
 * Martes o miércoles → lunes anterior. Jueves o viernes → lunes siguiente.
 * Sábado, domingo y lunes quedan en su día.
 */
export function trasladarFeriado(anio: number, mes: number, dia: number): { dia: number; mes: number; trasladado: boolean } {
	const semana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
	const delta = semana === 2 ? -1 : semana === 3 ? -2 : semana === 4 ? 4 : semana === 5 ? 3 : 0;
	if (delta === 0) return { dia, mes, trasladado: false };
	return { ...sumarDias(anio, mes, dia, delta), trasladado: true };
}

export interface FeriadoCalculado {
	slug: string;
	nombre: string;
	titulo: string;
	dia: number;
	mes: number;
	anio: number;
	trasladadoDesde: { dia: number; mes: number } | null;
	noLaborable: boolean;
}

/** Feriados nacionales del año, con el traslado ya aplicado. No incluye puentes sin decreto. */
export function feriadosDelAnio(anio: number): FeriadoCalculado[] {
	const salida: FeriadoCalculado[] = [];
	for (const item of efemerides) {
		const juevesSanto = item.slug === 'jueves-santo';
		if (!item.feriado.es && !juevesSanto) continue;
		const fechas =
			item.slug === 'carnaval'
				? [sumarDias(anio, pascua(anio).mes, pascua(anio).dia, -48), sumarDias(anio, pascua(anio).mes, pascua(anio).dia, -47)]
				: ocurrenciasDelAnio(item, anio).map((fecha) => ({ dia: fecha.dia, mes: fecha.mes }));
		for (const fecha of fechas) {
			const traslado = item.feriado.regla === 'trasladable' ? trasladarFeriado(anio, fecha.mes, fecha.dia) : { dia: fecha.dia, mes: fecha.mes, trasladado: false };
			salida.push({
				slug: item.slug,
				nombre: item.nombre,
				titulo: item.titulo,
				dia: traslado.dia,
				mes: traslado.mes,
				anio,
				trasladadoDesde: traslado.trasladado ? { dia: fecha.dia, mes: fecha.mes } : null,
				noLaborable: juevesSanto,
			});
		}
	}
	return salida.sort((a, b) => a.mes - b.mes || a.dia - b.dia || a.slug.localeCompare(b.slug, 'es'));
}

export function puentesDelAnio(anio: number): { dia: number; mes: number }[] {
	return DIAS_TURISTICOS[anio] ?? [];
}

export function efemeridesCercanas<T extends FechaConmemorativa & { slug: string }>(lista: T[], slug: string, desde: Date, radio = 2): FechaLista<T>[] {
	const hoy = fechaArgentina(desde);
	const linea: FechaLista<T>[] = [];
	for (const anio of [hoy.anio, hoy.anio + 1]) {
		for (const item of lista) {
			for (const fecha of ocurrenciasDelAnio(item, anio)) {
				linea.push({ ...item, dia: fecha.dia, mes: fecha.mes, anio, nota: fecha.nota });
			}
		}
	}
	linea.sort((a, b) => a.anio - b.anio || a.mes - b.mes || a.dia - b.dia);
	const proxima = linea.findIndex((item) => item.slug === slug && (item.anio > hoy.anio || item.mes > hoy.mes || (item.mes === hoy.mes && item.dia >= hoy.dia)));
	const indice = proxima === -1 ? linea.findIndex((item) => item.slug === slug) : proxima;
	if (indice < 0) return [];
	return linea.filter((_, i) => i !== indice && Math.abs(i - indice) <= radio);
}
