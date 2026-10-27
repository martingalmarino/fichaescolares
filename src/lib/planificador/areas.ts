import type { NivelPlanificador } from './opciones';

export interface AreaPlan {
	id: string;
	label: string;
}

export const AREAS_POR_NIVEL: Record<NivelPlanificador, AreaPlan[]> = {
	primario: [
		{ id: 'lenguaje', label: 'Prácticas del Lenguaje' },
		{ id: 'matematica', label: 'Matemática' },
		{ id: 'naturales', label: 'Ciencias Naturales' },
		{ id: 'sociales', label: 'Ciencias Sociales' },
		{ id: 'edfisica', label: 'Educación Física' },
		{ id: 'plastica', label: 'Plástica' },
		{ id: 'musica', label: 'Música' },
		{ id: 'ingles', label: 'Inglés' },
	],
	inicial: [
		{ id: 'identidad', label: 'Identidad y convivencia' },
		{ id: 'juego', label: 'Juego' },
		{ id: 'comunicacion', label: 'Comunicación y expresión' },
		{ id: 'ambiente', label: 'Ambiente natural y social' },
		{ id: 'edfisica', label: 'Educación física' },
	],
};

/** Áreas que entran en la hoja A4 del planificador. */
export function areasDePlanificador(nivel: NivelPlanificador): string[] {
	if (nivel === 'inicial') return AREAS_POR_NIVEL.inicial.map((area) => area.label);
	return ['Prácticas del Lenguaje', 'Matemática', 'Ciencias Naturales', 'Ciencias Sociales', 'Ed. Artística'];
}

/** Lista completa para la plantilla de planificación anual. */
export function areasCompletas(nivel: NivelPlanificador): string[] {
	return AREAS_POR_NIVEL[nivel].map((area) => area.label);
}
