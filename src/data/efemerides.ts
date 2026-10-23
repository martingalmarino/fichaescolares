import data from './efemerides.json';

export interface Efemeride {
	slug: string;
	dia: number;
	mes: number;
	nombre: string;
	titulo: string;
	tema: string;
	linea: string;
	resumen: string;
	vocabulario: string[];
	proceres: string[];
	laminas: string[];
	fuentes: string[];
	verificado: boolean;
}

function isEfemeride(value: unknown): value is Efemeride {
	if (!value || typeof value !== 'object') return false;
	const item = value as Efemeride;
	return (
		typeof item.slug === 'string' &&
		typeof item.dia === 'number' &&
		typeof item.mes === 'number' &&
		typeof item.nombre === 'string' &&
		typeof item.titulo === 'string' &&
		typeof item.tema === 'string' &&
		typeof item.linea === 'string' &&
		typeof item.resumen === 'string' &&
		Array.isArray(item.vocabulario) &&
		Array.isArray(item.proceres) &&
		Array.isArray(item.laminas) &&
		Array.isArray(item.fuentes)
	);
}

if (!data.every(isEfemeride)) {
	throw new Error('src/data/efemerides.json tiene un registro incompleto');
}

export const efemerides: Efemeride[] = data;

const MESES = [
	'Enero',
	'Febrero',
	'Marzo',
	'Abril',
	'Mayo',
	'Junio',
	'Julio',
	'Agosto',
	'Septiembre',
	'Octubre',
	'Noviembre',
	'Diciembre',
];

export function etiquetaFecha(dia: number, mes: number, nombre: string): string {
	return `${dia} de ${MESES[mes - 1] ?? ''} · ${nombre}`;
}
