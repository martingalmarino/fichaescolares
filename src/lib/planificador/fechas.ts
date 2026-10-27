import {
	diasIso,
	jurisdiccionDe,
	calendarioDe,
	type Jurisdiccion,
} from '../../data/calendario-escolar';
import { isoDe, partesIso } from '../calendario';

export const ANIO_PLANIFICADOR = 2027;

export type EstadoFecha = 'oficial' | 'provisoria';

export interface HitoLectivo {
	iso: string;
	estado: EstadoFecha;
}

export interface CicloLectivo {
	anio: number;
	inicio: HitoLectivo;
	fin: HitoLectivo;
	invierno: { desde: HitoLectivo; hasta: HitoLectivo };
	provisorio: boolean;
}

/**
 * Ciclo de ejemplo para armar la grilla mientras la jurisdicción sigue
 * en «a confirmar». No se copia al calendario: cuando el JSON pasa a
 * oficial, armarCiclo deja de usarlo.
 * Inicio: primer lunes de marzo. Receso: segunda semana de julio y la
 * siguiente. Cierre: viernes de la semana del 17 de diciembre.
 */
export function cicloEjemplo(anio: number): { inicio: string; inviernoDesde: string; inviernoHasta: string; fin: string } {
	const inicio = enesimoDiaSemana(anio, 3, 1, 1);
	const inviernoDesde = enesimoDiaSemana(anio, 7, 1, 2);
	const inviernoHasta = sumarIso(inviernoDesde, 11);
	const ancla = new Date(Date.UTC(anio, 11, 17));
	const fin = viernesDeSemana(isoDe(ancla.getUTCFullYear(), ancla.getUTCMonth() + 1, ancla.getUTCDate()));
	return { inicio, inviernoDesde, inviernoHasta, fin };
}

export function armarCiclo(anio: number, jurisdiccion: Jurisdiccion): CicloLectivo {
	const oficial =
		jurisdiccion.estado === 'oficial' &&
		jurisdiccion.inicio &&
		jurisdiccion.fin &&
		jurisdiccion.invierno.desde &&
		jurisdiccion.invierno.hasta;
	if (oficial && jurisdiccion.inicio && jurisdiccion.fin && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		return {
			anio,
			inicio: { iso: jurisdiccion.inicio, estado: 'oficial' },
			fin: { iso: jurisdiccion.fin, estado: 'oficial' },
			invierno: {
				desde: { iso: jurisdiccion.invierno.desde, estado: 'oficial' },
				hasta: { iso: jurisdiccion.invierno.hasta, estado: 'oficial' },
			},
			provisorio: false,
		};
	}
	const ejemplo = cicloEjemplo(anio);
	return {
		anio,
		inicio: { iso: ejemplo.inicio, estado: 'provisoria' },
		fin: { iso: ejemplo.fin, estado: 'provisoria' },
		invierno: {
			desde: { iso: ejemplo.inviernoDesde, estado: 'provisoria' },
			hasta: { iso: ejemplo.inviernoHasta, estado: 'provisoria' },
		},
		provisorio: true,
	};
}

export function cicloDe(slug: string, anio = ANIO_PLANIFICADOR): CicloLectivo {
	const calendario = calendarioDe(anio);
	return armarCiclo(anio, jurisdiccionDe(calendario, slug));
}

export function etiquetaEstado(estado: EstadoFecha, texto: string): string {
	return estado === 'provisoria' ? `${texto} (provisorio)` : texto;
}

export function sumarIso(iso: string, delta: number): string {
	const { anio, mes, dia } = partesIso(iso);
	const fecha = new Date(Date.UTC(anio, mes - 1, dia + delta));
	return isoDe(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate());
}

export function diaSemana(iso: string): number {
	const { anio, mes, dia } = partesIso(iso);
	return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
}

export function lunesDe(iso: string): string {
	const dow = diaSemana(iso);
	return sumarIso(iso, dow === 0 ? -6 : 1 - dow);
}

/** Lunes = 1 … domingo = 0, igual que getUTCDay. `orden` empieza en 1. */
export function enesimoDiaSemana(anio: number, mes: number, diaSemanaObjetivo: number, orden: number): string {
	const primero = new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay();
	const delta = (diaSemanaObjetivo - primero + 7) % 7;
	return isoDe(anio, mes, 1 + delta + (orden - 1) * 7);
}

function viernesDeSemana(iso: string): string {
	const dow = diaSemana(iso);
	const delta = dow === 0 ? -2 : 5 - dow;
	return sumarIso(iso, delta);
}

export function diasEntre(desde: string, hasta: string): string[] {
	if (desde > hasta) return [];
	return diasIso(desde, hasta);
}
