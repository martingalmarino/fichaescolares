import type { PlanLectivo } from './anio';
import type { OpcionesPlanificador, SeccionPlanificador } from './opciones';

const FILAS_ASISTENCIA = 22;

/** Cuántas hojas salen, sin armar el DOM. La vista previa sigue mostrando solo dos. */
export function totalPlanificador(opciones: OpcionesPlanificador, plan: PlanLectivo, alumnos: string[]): number {
	const incluye = (id: SeccionPlanificador) => opciones.secciones.includes(id);
	let total = 0;
	if (incluye('portada')) total += 1;
	if (incluye('meses')) total += plan.mesesCiclo.length;
	else if (incluye('cumpleanos')) total += 1;
	if (incluye('actos') && !incluye('meses')) total += 1;
	if (incluye('semanas')) total += plan.semanas.length;
	if (incluye('planificacion')) total += 1;
	if (incluye('asistencia')) total += alumnos.length === 0 ? 1 : Math.ceil(alumnos.length / FILAS_ASISTENCIA);
	return total;
}
