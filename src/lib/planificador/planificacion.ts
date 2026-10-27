import { AREAS_POR_NIVEL } from './areas';
import {
	gradoValido,
	opcionesDesdeParams,
	type NivelPlanificador,
	type OrganizacionPeriodos,
} from './opciones';

export type OrientacionPlan = 'vertical' | 'horizontal';

export interface OpcionesPlanificacion {
	prov: string;
	nivel: NivelPlanificador;
	grado: string;
	periodos: OrganizacionPeriodos;
	orientacion: OrientacionPlan;
	areas: string[];
}

const POR_HOJA_VERTICAL = 4;

export function paginasDeAreas(areas: string[], orientacion: OrientacionPlan): string[][] {
	if (areas.length === 0) return [];
	if (orientacion === 'horizontal') return [areas];
	const paginas: string[][] = [];
	for (let i = 0; i < areas.length; i += POR_HOJA_VERTICAL) paginas.push(areas.slice(i, i + POR_HOJA_VERTICAL));
	return paginas;
}

export function opcionesPlanificacionDesdeParams(params: URLSearchParams, slugs: readonly string[]): OpcionesPlanificacion {
	const base = opcionesDesdeParams(params, slugs);
	const nivel = base.nivel;
	const catalogo = AREAS_POR_NIVEL[nivel].map((area) => area.id);
	const validas = new Set(catalogo);
	const areas = params.has('areas')
		? catalogo.filter((id) =>
				(params.get('areas') ?? '')
					.split(',')
					.map((item) => item.trim())
					.includes(id),
			)
		: catalogo;
	return {
		prov: base.prov,
		nivel,
		grado: gradoValido(nivel, base.grado),
		periodos: base.periodos,
		orientacion: params.get('ori') === 'horizontal' ? 'horizontal' : 'vertical',
		areas: areas.filter((id) => validas.has(id)),
	};
}

export function paramsPlanificacion(opciones: OpcionesPlanificacion): string {
	const params = new URLSearchParams();
	params.set('prov', opciones.prov);
	params.set('nivel', opciones.nivel);
	params.set('grado', opciones.grado);
	params.set('periodos', opciones.periodos);
	if (opciones.orientacion === 'horizontal') params.set('ori', 'horizontal');
	const catalogo = AREAS_POR_NIVEL[opciones.nivel].map((area) => area.id);
	const elegidas = catalogo.filter((id) => opciones.areas.includes(id));
	if (elegidas.join(',') !== catalogo.join(',')) params.set('areas', elegidas.join(','));
	return params.toString();
}
