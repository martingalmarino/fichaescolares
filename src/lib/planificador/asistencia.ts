import type { DiaLectivo, MesLectivo } from './anio';

export type NivelAsistencia = 'primario' | 'secundario';
export type MesAsistencia = number | 'anio';

export interface OpcionesAsistencia {
	prov: string;
	nivel: NivelAsistencia;
	mes: MesAsistencia;
	filas: number;
}

export const MES_DEFECTO = 3;
export const FILAS_DEFECTO = 25;
export const FILAS_OPCIONES = [10, 15, 20, 25, 30, 35, 40] as const;

const NIVELES = new Set<NivelAsistencia>(['primario', 'secundario']);

/** Lunes a viernes del mes. Feriado, receso y días fuera del ciclo quedan para tacharlos. */
export function diasDeAsistencia(mes: MesLectivo): DiaLectivo[] {
	return mes.semanas.flat().filter((dia): dia is DiaLectivo => dia !== null && !dia.finDeSemana);
}

export function paginasDeNombres(nombres: string[], filas: number): string[][] {
	const cupo = Math.max(1, filas);
	if (nombres.length === 0) return [Array.from({ length: cupo }, () => '')];
	const paginas: string[][] = [];
	for (let i = 0; i < nombres.length; i += cupo) {
		const pagina = nombres.slice(i, i + cupo);
		while (pagina.length < cupo) pagina.push('');
		paginas.push(pagina);
	}
	return paginas;
}

export function opcionesAsistenciaDesdeParams(params: URLSearchParams, slugs: readonly string[]): OpcionesAsistencia {
	const prov = params.get('prov');
	const nivel = params.get('nivel');
	const mes = params.get('mes');
	const filas = Number(params.get('filas'));
	let mesElegido: MesAsistencia = MES_DEFECTO;
	if (mes === 'anio') mesElegido = 'anio';
	else if (mes && Number.isInteger(Number(mes)) && Number(mes) >= 1 && Number(mes) <= 12) mesElegido = Number(mes);
	return {
		prov: prov && slugs.includes(prov) ? prov : 'cordoba',
		nivel: nivel && NIVELES.has(nivel as NivelAsistencia) ? (nivel as NivelAsistencia) : 'primario',
		mes: mesElegido,
		filas: (FILAS_OPCIONES as readonly number[]).includes(filas) ? filas : FILAS_DEFECTO,
	};
}

export function paramsAsistencia(opciones: OpcionesAsistencia): string {
	const params = new URLSearchParams();
	params.set('prov', opciones.prov);
	params.set('nivel', opciones.nivel);
	if (opciones.mes === 'anio') params.set('mes', 'anio');
	else if (opciones.mes !== MES_DEFECTO) params.set('mes', String(opciones.mes));
	if (opciones.filas !== FILAS_DEFECTO) params.set('filas', String(opciones.filas));
	return params.toString();
}
