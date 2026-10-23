import data from './efemerides.json';

export type TipoEfemeride = 'feriado' | 'acto-escolar' | 'conmemoracion' | 'no-laborable';
export type NivelEscolar = 'inicial' | 'primaria';
export type ReglaFeriado = 'inamovible' | 'trasladable' | 'movil';

export interface Efemeride {
	id: number;
	slug: string;
	dia: number | null;
	mes: number | null;
	nombre: string;
	titulo: string;
	tema?: string;
	linea?: string;
	resumen: string;
	vocabulario?: string[];
	proceres: string[];
	laminas: string[];
	tipo: TipoEfemeride;
	nivel: NivelEscolar[];
	feriado: { es: boolean; regla: ReglaFeriado | null };
	movil?: string;
	recursos: { fichas: string[]; laminas: string[] };
	fuentes: string[];
	verificado: boolean;
}

const TIPOS = new Set<TipoEfemeride>(['feriado', 'acto-escolar', 'conmemoracion', 'no-laborable']);
const NIVELES = new Set<NivelEscolar>(['inicial', 'primaria']);
const REGLAS = new Set<ReglaFeriado>(['inamovible', 'trasladable', 'movil']);

function textos(valor: unknown): valor is string[] {
	return Array.isArray(valor) && valor.every((item) => typeof item === 'string');
}

function diaDelMes(dia: number, mes: number): boolean {
	if (!Number.isInteger(dia) || !Number.isInteger(mes) || mes < 1 || mes > 12) return false;
	return dia >= 1 && dia <= new Date(2024, mes, 0).getDate();
}

function fechaCoherente(item: Efemeride): boolean {
	const sinDia = item.dia == null;
	const sinMes = item.mes == null;
	if (sinDia !== sinMes) return false;
	if (sinDia) return typeof item.movil === 'string';
	if (item.movil != null) return false;
	return diaDelMes(item.dia as number, item.mes as number);
}

function isEfemeride(value: unknown): value is Efemeride {
	if (!value || typeof value !== 'object') return false;
	const item = value as Efemeride;
	const feriado = item.feriado;
	const recursos = item.recursos;
	if (!feriado || typeof feriado !== 'object' || typeof feriado.es !== 'boolean') return false;
	if (feriado.regla !== null && !REGLAS.has(feriado.regla)) return false;
	if (feriado.es === (feriado.regla === null)) return false;
	if (feriado.regla === 'movil' && typeof item.movil !== 'string') return false;
	if (!recursos || !textos(recursos.fichas) || !textos(recursos.laminas)) return false;
	if (!Number.isInteger(item.id) || item.id < 1) return false;
	if (!TIPOS.has(item.tipo)) return false;
	if (!textos(item.nivel) || item.nivel.some((nivel) => !NIVELES.has(nivel as NivelEscolar))) return false;
	if (item.tema !== undefined && typeof item.tema !== 'string') return false;
	if (item.linea !== undefined && typeof item.linea !== 'string') return false;
	if (item.vocabulario !== undefined && !textos(item.vocabulario)) return false;
	if (item.vocabulario && (!item.tema || !item.linea)) return false;
	return (
		typeof item.slug === 'string' &&
		fechaCoherente(item) &&
		typeof item.nombre === 'string' &&
		typeof item.titulo === 'string' &&
		typeof item.resumen === 'string' &&
		textos(item.proceres) &&
		textos(item.laminas) &&
		textos(item.fuentes) &&
		item.fuentes.length > 0
	);
}

const lista = data as unknown;
if (!Array.isArray(lista) || !lista.every(isEfemeride)) {
	throw new Error('src/data/efemerides.json tiene un registro incompleto');
}

const slugs = new Set<string>();
const ids = new Set<number>();
for (const item of lista) {
	if (slugs.has(item.slug)) throw new Error(`src/data/efemerides.json: slug repetido «${item.slug}»`);
	if (ids.has(item.id)) throw new Error(`src/data/efemerides.json: id repetido ${item.id}`);
	slugs.add(item.slug);
	ids.add(item.id);
}

export const efemerides: Efemeride[] = lista;

export function nombreTipo(tipo: TipoEfemeride): string {
	if (tipo === 'feriado') return 'Feriado';
	if (tipo === 'acto-escolar') return 'Acto escolar';
	if (tipo === 'no-laborable') return 'Día no laborable';
	return 'Conmemoración';
}

export function nombreRegla(regla: ReglaFeriado | null): string {
	if (regla === 'inamovible') return 'inamovible';
	if (regla === 'trasladable') return 'trasladable';
	if (regla === 'movil') return 'móvil';
	return '';
}

export function tieneFicha(item: Efemeride): item is Efemeride & { vocabulario: string[]; tema: string; linea: string } {
	return Boolean(item.vocabulario?.length && item.tema && item.linea);
}

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

export function etiquetaFecha(dia: number | null, mes: number | null, nombre: string): string {
	if (dia == null || mes == null) return nombre;
	return `${dia} de ${MESES[mes - 1] ?? ''} · ${nombre}`;
}
