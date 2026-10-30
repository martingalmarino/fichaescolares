/**
 * Para pasar una provincia a oficial, editá solo el JSON del año
 * (src/data/calendario-escolar/2027.json): estado "oficial", inicio,
 * invierno.desde, invierno.hasta, fin, fuente (https) y actualizado con la
 * fecha de hoy. El título, la descripción, el banner y las respuestas
 * salen de esos campos. inicioSecundario y vueltaDocentes son opcionales
 * y solo valen con estado oficial. Los cortes de período son opcionales y solo
 * valen con estado oficial: cortes.trimestres son el fin del primero y
 * del segundo, y cortes.cuatrimestres el fin del primero. Si no están,
 * el planificador reparte los días hábiles en partes parejas.
 * Para 2028: copiá el JSON, sumalo al array `archivos` y copiá la carpeta
 * src/pages/calendario-escolar-2027/ con el año nuevo en la ruta.
 */
import archivo2027 from './calendario-escolar/2027.json';
import { provincias } from './provincias';

export type EstadoCalendario = 'a-confirmar' | 'oficial';

export interface FechaNombrada {
	fecha: string;
	nombre: string;
}

export interface RangoNombrado {
	desde: string;
	hasta: string;
	nombre: string;
}

/** Fines inclusive de cada período, salvo el último, que cierra con el fin del ciclo. */
export interface CortesPeriodo {
	trimestres?: [string, string];
	cuatrimestres?: [string];
}

export interface Jurisdiccion {
	estado: EstadoCalendario;
	inicio: string | null;
	invierno: { desde: string | null; hasta: string | null };
	fin: string | null;
	fuente: string | null;
	notas: string | null;
	/** Inicio de secundaria, si la jurisdicción lo publica aparte del inicio general. */
	inicioSecundario?: string | null;
	/** Vuelta de los docentes, si la resolución la publica. */
	vueltaDocentes?: string | null;
	feriadosProvinciales: FechaNombrada[];
	sinClases: (FechaNombrada | RangoNombrado)[];
	actualizado?: string;
	cortes?: CortesPeriodo;
}

export interface CalendarioEscolar {
	anio: number;
	actualizado: string;
	jurisdicciones: Record<string, Jurisdiccion>;
}

const ESTADOS = new Set<EstadoCalendario>(['a-confirmar', 'oficial']);

/** Provincias que comparten límite. No usa el campo región, que no está verificado. */
const VECINAS: Record<string, string[]> = {
	'buenos-aires': ['caba', 'santa-fe', 'la-pampa'],
	caba: ['buenos-aires'],
	catamarca: ['tucuman', 'salta', 'la-rioja'],
	chaco: ['formosa', 'corrientes', 'santiago-del-estero'],
	chubut: ['rio-negro', 'santa-cruz'],
	cordoba: ['santa-fe', 'san-luis', 'santiago-del-estero'],
	corrientes: ['chaco', 'misiones', 'entre-rios'],
	'entre-rios': ['santa-fe', 'corrientes', 'buenos-aires'],
	formosa: ['chaco', 'salta'],
	jujuy: ['salta'],
	'la-pampa': ['buenos-aires', 'cordoba', 'rio-negro'],
	'la-rioja': ['catamarca', 'san-juan', 'cordoba'],
	mendoza: ['san-juan', 'san-luis', 'neuquen'],
	misiones: ['corrientes'],
	neuquen: ['rio-negro', 'mendoza'],
	'rio-negro': ['neuquen', 'chubut', 'la-pampa'],
	salta: ['jujuy', 'tucuman', 'formosa'],
	'san-juan': ['la-rioja', 'mendoza', 'san-luis'],
	'san-luis': ['cordoba', 'mendoza', 'la-pampa'],
	'santa-cruz': ['chubut', 'tierra-del-fuego'],
	'santa-fe': ['cordoba', 'entre-rios', 'chaco'],
	'santiago-del-estero': ['tucuman', 'cordoba', 'chaco'],
	'tierra-del-fuego': ['santa-cruz'],
	tucuman: ['salta', 'santiago-del-estero', 'catamarca'],
};

function registro(valor: unknown): Record<string, unknown> | null {
	if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null;
	return valor as Record<string, unknown>;
}

function fechaIso(valor: unknown, anio?: number): valor is string {
	if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
	const [anioFecha, mes, dia] = valor.split('-').map(Number);
	if (anio != null && anioFecha !== anio) return false;
	const fecha = new Date(Date.UTC(anioFecha ?? 0, (mes ?? 1) - 1, dia ?? 1));
	return fecha.getUTCFullYear() === anioFecha && fecha.getUTCMonth() === (mes ?? 1) - 1 && fecha.getUTCDate() === dia;
}

function https(valor: unknown): valor is string {
	if (typeof valor !== 'string') return false;
	try {
		return new URL(valor).protocol === 'https:';
	} catch {
		return false;
	}
}

function fechaNombrada(valor: unknown, anio: number): valor is FechaNombrada {
	const item = registro(valor);
	return Boolean(item && fechaIso(item.fecha, anio) && typeof item.nombre === 'string' && item.nombre.trim());
}

function cortesValidos(valor: unknown, anio: number): boolean {
	const cortes = registro(valor);
	if (!cortes) return false;
	const claves = Object.keys(cortes);
	if (claves.some((clave) => clave !== 'trimestres' && clave !== 'cuatrimestres')) return false;
	if (cortes.trimestres !== undefined) {
		if (!Array.isArray(cortes.trimestres) || cortes.trimestres.length !== 2) return false;
		const [primero, segundo] = cortes.trimestres;
		if (!fechaIso(primero, anio) || !fechaIso(segundo, anio) || primero >= segundo) return false;
	}
	if (cortes.cuatrimestres !== undefined) {
		if (!Array.isArray(cortes.cuatrimestres) || cortes.cuatrimestres.length !== 1 || !fechaIso(cortes.cuatrimestres[0], anio)) return false;
	}
	return cortes.trimestres !== undefined || cortes.cuatrimestres !== undefined;
}

function rango(valor: unknown, anio: number): valor is RangoNombrado {
	const item = registro(valor);
	if (!item || !fechaIso(item.desde, anio) || !fechaIso(item.hasta, anio) || typeof item.nombre !== 'string' || !item.nombre.trim()) return false;
	return item.desde <= item.hasta;
}

export function erroresCalendario(datos: unknown, slugs: string[]): string[] {
	const errores: string[] = [];
	const calendario = registro(datos);
	if (!calendario || !Number.isInteger(calendario.anio)) return ['el calendario no tiene año'];
	const anio = calendario.anio as number;
	if (!fechaIso(calendario.actualizado)) errores.push(`${anio}: actualizado no es una fecha`);
	const jurisdicciones = registro(calendario.jurisdicciones);
	if (!jurisdicciones) return [...errores, `${anio}: faltan las jurisdicciones`];
	for (const slug of slugs) {
		if (!jurisdicciones[slug]) errores.push(`${anio}: falta ${slug}`);
	}
	for (const slug of Object.keys(jurisdicciones)) {
		if (!slugs.includes(slug)) errores.push(`${anio}: jurisdicción desconocida ${slug}`);
		const item = registro(jurisdicciones[slug]);
		if (!item) {
			errores.push(`${anio}/${slug}: jurisdicción inválida`);
			continue;
		}
		if (!ESTADOS.has(item.estado as EstadoCalendario)) errores.push(`${anio}/${slug}: estado inválido`);
		const invierno = registro(item.invierno);
		if (!invierno) errores.push(`${anio}/${slug}: falta invierno`);
		const oficial = item.estado === 'oficial';
		if (oficial) {
			if (!fechaIso(item.inicio, anio)) errores.push(`${anio}/${slug}: inicio oficial inválido`);
			if (!invierno || !fechaIso(invierno.desde, anio) || !fechaIso(invierno.hasta, anio) || String(invierno.desde) > String(invierno.hasta)) {
				errores.push(`${anio}/${slug}: invierno oficial inválido`);
			}
			if (!fechaIso(item.fin, anio)) errores.push(`${anio}/${slug}: fin oficial inválido`);
			if (!https(item.fuente)) errores.push(`${anio}/${slug}: la fuente oficial tiene que ser https`);
		} else {
			if (item.inicio !== null || item.fin !== null || item.fuente !== null) errores.push(`${anio}/${slug}: a-confirmar no puede tener fechas ni fuente`);
			if (!invierno || invierno.desde !== null || invierno.hasta !== null) errores.push(`${anio}/${slug}: a-confirmar no puede tener vacaciones`);
		}
		if (item.notas !== null && typeof item.notas !== 'string') errores.push(`${anio}/${slug}: notas inválidas`);
		for (const clave of ['inicioSecundario', 'vueltaDocentes'] as const) {
			const extra = item[clave];
			if (extra == null) continue;
			if (!oficial) errores.push(`${anio}/${slug}: a-confirmar no puede tener ${clave}`);
			else if (!fechaIso(extra, anio)) errores.push(`${anio}/${slug}: ${clave} inválido`);
		}
		if (item.actualizado !== undefined && !fechaIso(item.actualizado)) errores.push(`${anio}/${slug}: actualizado inválido`);
		if (!Array.isArray(item.feriadosProvinciales) || item.feriadosProvinciales.some((feriado) => !fechaNombrada(feriado, anio))) {
			errores.push(`${anio}/${slug}: feriado provincial inválido`);
		}
		if (!Array.isArray(item.sinClases) || item.sinClases.some((dia) => !fechaNombrada(dia, anio) && !rango(dia, anio))) {
			errores.push(`${anio}/${slug}: día sin clases inválido`);
		}
		if (item.cortes !== undefined) {
			if (!oficial) errores.push(`${anio}/${slug}: a-confirmar no puede tener cortes de período`);
			else if (!cortesValidos(item.cortes, anio)) errores.push(`${anio}/${slug}: cortes de período inválidos`);
		}
	}
	for (const [slug, vecinas] of Object.entries(VECINAS)) {
		if (!slugs.includes(slug)) errores.push(`vecina desconocida ${slug}`);
		for (const vecina of vecinas) {
			if (!slugs.includes(vecina)) errores.push(`${slug}: vecina desconocida ${vecina}`);
		}
	}
	for (const slug of slugs) {
		if (!VECINAS[slug]) errores.push(`faltan vecinas de ${slug}`);
	}
	return errores;
}

function cargar(datos: unknown, slugs: string[]): CalendarioEscolar {
	const errores = erroresCalendario(datos, slugs);
	if (errores.length > 0) throw new Error(`src/data/calendario-escolar: ${errores.join('; ')}`);
	return datos as CalendarioEscolar;
}

const slugs = provincias.map((provincia) => provincia.slug);
const archivos = [archivo2027];

export const calendarios: CalendarioEscolar[] = archivos
	.map((archivo) => cargar(archivo, slugs))
	.sort((a, b) => a.anio - b.anio);

export const calendarioVigente = calendarios[calendarios.length - 1] ?? cargar(archivo2027, slugs);

export function calendarioDe(anio: number): CalendarioEscolar {
	const calendario = calendarios.find((item) => item.anio === anio);
	if (!calendario) throw new Error(`No hay calendario escolar ${anio}`);
	return calendario;
}

export function jurisdiccionDe(calendario: CalendarioEscolar, slug: string): Jurisdiccion {
	const jurisdiccion = calendario.jurisdicciones[slug];
	if (!jurisdiccion) throw new Error(`No hay calendario ${calendario.anio} de ${slug}`);
	return jurisdiccion;
}

export function actualizadoDe(calendario: CalendarioEscolar, jurisdiccion?: Jurisdiccion): string {
	return jurisdiccion?.actualizado ?? calendario.actualizado;
}

export function vecinasDe(slug: string): string[] {
	return VECINAS[slug] ?? [];
}

export function diasIso(desde: string, hasta: string): string[] {
	const dias: string[] = [];
	const cursor = new Date(`${desde}T12:00:00.000Z`);
	const fin = new Date(`${hasta}T12:00:00.000Z`);
	while (cursor <= fin) {
		dias.push(cursor.toISOString().slice(0, 10));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dias;
}

export function recesosDe(jurisdiccion: Jurisdiccion): { iso: string; nombre: string }[] {
	const dias: { iso: string; nombre: string }[] = [];
	if (jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		for (const iso of diasIso(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)) {
			dias.push({ iso, nombre: 'Vacaciones de invierno' });
		}
	}
	for (const item of jurisdiccion.sinClases) {
		if ('fecha' in item) dias.push({ iso: item.fecha, nombre: item.nombre });
		else for (const iso of diasIso(item.desde, item.hasta)) dias.push({ iso, nombre: item.nombre });
	}
	return dias;
}
