import type { Provincia } from '../../data/provincias';

export function nombreCorto(provincia: Provincia): string {
	if (provincia.slug === 'caba') return 'CABA';
	if (provincia.nombre.startsWith('Tierra del Fuego')) return 'Tierra del Fuego';
	return provincia.nombre;
}

export type NivelPlanificador = 'inicial' | 'primario';
export type TurnoPlanificador = 'manana' | 'tarde' | 'doble';
export type OrganizacionPeriodos = 'trimestres' | 'cuatrimestres';
export type SeccionPlanificador = 'portada' | 'meses' | 'semanas' | 'planificacion' | 'asistencia' | 'cumpleanos' | 'actos';

export interface Opcion {
	id: string;
	label: string;
}

export interface OpcionesPlanificador {
	prov: string;
	nivel: NivelPlanificador;
	grado: string;
	turno: TurnoPlanificador;
	periodos: OrganizacionPeriodos;
	secciones: SeccionPlanificador[];
}

export interface DatosDocente {
	docente: string;
	escuela: string;
	alumnos: string;
	cumpleanos: string;
}

export interface Cumpleano {
	nombre: string;
	dia: number;
	mes: number;
}

export const SECCIONES: { id: SeccionPlanificador; label: string }[] = [
	{ id: 'portada', label: 'Portada con tus datos' },
	{ id: 'meses', label: '12 meses con días hábiles' },
	{ id: 'semanas', label: 'Semana a semana' },
	{ id: 'planificacion', label: 'Planificación anual por área' },
	{ id: 'asistencia', label: 'Registro de asistencia' },
	{ id: 'cumpleanos', label: 'Cumpleaños' },
	{ id: 'actos', label: 'Actos y reuniones' },
];

export const SECCIONES_DEFECTO: SeccionPlanificador[] = ['portada', 'meses', 'planificacion', 'asistencia', 'cumpleanos', 'actos'];

export type VariantePlanificador = 'planificador' | 'agenda';

/** La agenda es el cuaderno: semana a semana marcada y la planificación anual destildada. */
export const SECCIONES_AGENDA: SeccionPlanificador[] = ['portada', 'meses', 'semanas', 'asistencia', 'cumpleanos', 'actos'];

export function seccionesDefecto(variante: VariantePlanificador = 'planificador'): SeccionPlanificador[] {
	return variante === 'agenda' ? [...SECCIONES_AGENDA] : [...SECCIONES_DEFECTO];
}

const NIVELES = new Set<NivelPlanificador>(['inicial', 'primario']);
const IDS_TURNO = new Set<TurnoPlanificador>(['manana', 'tarde', 'doble']);
const IDS_PERIODO = new Set<OrganizacionPeriodos>(['trimestres', 'cuatrimestres']);
const IDS_SECCION = new Set<SeccionPlanificador>(SECCIONES.map((item) => item.id));

export const GRADOS: Record<NivelPlanificador, Opcion[]> = {
	inicial: [
		{ id: 'sala-3', label: 'Sala de 3 años' },
		{ id: 'sala-4', label: 'Sala de 4 años' },
		{ id: 'sala-5', label: 'Sala de 5 años' },
	],
	primario: [
		{ id: '1', label: '1.er grado' },
		{ id: '2', label: '2.º grado' },
		{ id: '3', label: '3.er grado' },
		{ id: '4', label: '4.º grado' },
		{ id: '5', label: '5.º grado' },
		{ id: '6', label: '6.º grado' },
		{ id: '7', label: '7.º grado' },
	],
};

export const TURNOS: Opcion[] = [
	{ id: 'manana', label: 'Mañana' },
	{ id: 'tarde', label: 'Tarde' },
	{ id: 'doble', label: 'Doble' },
];

export const NIVEL_LABEL: Record<NivelPlanificador, string> = {
	inicial: 'Inicial',
	primario: 'Primario',
};

const GRADO_DEFECTO: Record<NivelPlanificador, string> = {
	inicial: 'sala-5',
	primario: '3',
};

export function gradoValido(nivel: NivelPlanificador, grado: string): string {
	return GRADOS[nivel].some((item) => item.id === grado) ? grado : GRADO_DEFECTO[nivel];
}

export function etiquetaGrado(nivel: NivelPlanificador, grado: string): string {
	return GRADOS[nivel].find((item) => item.id === gradoValido(nivel, grado))?.label ?? grado;
}

export function etiquetaTurno(turno: TurnoPlanificador): string {
	return TURNOS.find((item) => item.id === turno)?.label ?? 'Mañana';
}

export function sujetoProvincia(provincia: Provincia): string {
	if (provincia.slug === 'caba') return 'La Ciudad de Buenos Aires';
	if (provincia.slug === 'buenos-aires') return 'La provincia de Buenos Aires';
	return nombreCorto(provincia);
}

export function lugarProvincia(provincia: Provincia): string {
	if (provincia.slug === 'caba') return 'Ciudad de Buenos Aires';
	if (provincia.slug === 'buenos-aires') return 'Provincia de Buenos Aires';
	return `Provincia de ${nombreCorto(provincia)}`;
}

export function opcionesDefecto(prov = 'cordoba', variante: VariantePlanificador = 'planificador'): OpcionesPlanificador {
	return {
		prov,
		nivel: 'primario',
		grado: '3',
		turno: 'manana',
		periodos: 'trimestres',
		secciones: seccionesDefecto(variante),
	};
}

export function opcionesDesdeParams(
	params: URLSearchParams,
	slugs: readonly string[],
	variante: VariantePlanificador = 'planificador',
): OpcionesPlanificador {
	const base = opcionesDefecto('cordoba', variante);
	const prov = params.get('prov');
	if (prov && slugs.includes(prov)) base.prov = prov;
	const nivel = params.get('nivel');
	if (nivel && NIVELES.has(nivel as NivelPlanificador)) base.nivel = nivel as NivelPlanificador;
	const grado = params.get('grado');
	if (grado) base.grado = gradoValido(base.nivel, grado);
	else base.grado = gradoValido(base.nivel, base.grado);
	const turno = params.get('turno');
	if (turno && IDS_TURNO.has(turno as TurnoPlanificador)) base.turno = turno as TurnoPlanificador;
	const periodos = params.get('periodos');
	if (periodos && IDS_PERIODO.has(periodos as OrganizacionPeriodos)) base.periodos = periodos as OrganizacionPeriodos;
	if (params.has('inc')) {
		const pedidas = (params.get('inc') ?? '')
			.split(',')
			.map((item) => item.trim())
			.filter((item): item is SeccionPlanificador => IDS_SECCION.has(item as SeccionPlanificador));
		base.secciones = pedidas;
	}
	base.grado = gradoValido(base.nivel, base.grado);
	return base;
}

export function paramsDesdeOpciones(opciones: OpcionesPlanificador, variante: VariantePlanificador = 'planificador'): string {
	const params = new URLSearchParams();
	params.set('prov', opciones.prov);
	params.set('nivel', opciones.nivel);
	params.set('grado', opciones.grado);
	params.set('turno', opciones.turno);
	params.set('periodos', opciones.periodos);
	const inc = SECCIONES.map((item) => item.id)
		.filter((id) => opciones.secciones.includes(id))
		.join(',');
	if (inc !== seccionesDefecto(variante).join(',')) params.set('inc', inc);
	return params.toString();
}

export function leerAlumnos(texto: string): string[] {
	return texto
		.split('\n')
		.map((linea) => linea.trim())
		.filter(Boolean)
		.slice(0, 80);
}

export function leerCumpleanos(texto: string): Cumpleano[] {
	const salida: Cumpleano[] = [];
	for (const linea of texto.split('\n')) {
		const match = /^(.*?)[,;\s]+(\d{1,2})\s*[/\-]\s*(\d{1,2})\s*$/.exec(linea.trim());
		if (!match) continue;
		const dia = Number(match[2]);
		const mes = Number(match[3]);
		const nombre = match[1]?.trim() ?? '';
		if (!nombre || nombre.length > 80) continue;
		if (!diaExiste(dia, mes)) continue;
		salida.push({ nombre, dia, mes });
	}
	return salida.sort((a, b) => a.mes - b.mes || a.dia - b.dia || a.nombre.localeCompare(b.nombre, 'es'));
}

function diaExiste(dia: number, mes: number): boolean {
	if (mes < 1 || mes > 12 || dia < 1) return false;
	return dia <= new Date(Date.UTC(2024, mes, 0)).getUTCDate();
}
