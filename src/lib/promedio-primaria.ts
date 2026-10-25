import { calificacionDe, type JurisdiccionCalificacion } from '../data/calificacion-primaria';

export interface ResultadoPromedio {
	promedio: string;
	aprueba: boolean;
	centimos: number;
}

/** Acepta "7", "7,5" o "7.50". Devuelve centésimos enteros. */
export function aCentesimos(texto: string): number | null {
	const limpio = texto.trim().replace(',', '.');
	if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
	const [entero, frac = ''] = limpio.split('.');
	return Number(entero) * 100 + Number((frac + '00').slice(0, 2));
}

export function textoCentesimos(centimos: number): string {
	const entero = Math.trunc(centimos / 100);
	const frac = String(Math.abs(centimos) % 100).padStart(2, '0');
	return `${entero},${frac}`;
}

/** Promedio truncado a dos decimales, sin redondear. */
export function promedioSinRedondear(centimos: number[]): ResultadoPromedio | null {
	if (centimos.length === 0) return null;
	const suma = centimos.reduce((total, nota) => total + nota, 0);
	const truncado = Math.floor(suma / centimos.length);
	return { promedio: textoCentesimos(truncado), aprueba: false, centimos: truncado };
}

export function evaluarNotas(jurisdiccion: JurisdiccionCalificacion, textos: string[]): { error?: string; resultado?: ResultadoPromedio } {
	if (jurisdiccion.modo !== 'numero' || jurisdiccion.apruebaCon === undefined || jurisdiccion.min === undefined || jurisdiccion.max === undefined) {
		return { error: 'Esta jurisdicción no se promedia con un número en esta ficha.' };
	}
	const notas = textos.map((texto) => texto.trim()).filter(Boolean);
	if (notas.length === 0) return { error: 'Cargá al menos una nota.' };
	const centimos: number[] = [];
	for (const nota of notas) {
		const valor = aCentesimos(nota);
		if (valor === null) return { error: `“${nota}” no es una nota válida.` };
		const min = jurisdiccion.min * 100;
		const max = jurisdiccion.max * 100;
		if (valor < min || valor > max) {
			if (jurisdiccion.slug === 'entre-rios' && valor < min) {
				return { error: 'Debajo de 6, Entre Ríos registra “En proceso de apropiación de contenidos”. Esa nota no entra en el promedio de 6 a 10.' };
			}
			return { error: `Cada nota tiene que estar entre ${jurisdiccion.min} y ${jurisdiccion.max}.` };
		}
		centimos.push(valor);
	}
	const base = promedioSinRedondear(centimos);
	if (!base) return { error: 'Cargá al menos una nota.' };
	const umbral = jurisdiccion.apruebaCon * 100;
	return { resultado: { ...base, aprueba: base.centimos >= umbral } };
}

export function puedeCalcular(slug: string): boolean {
	return calificacionDe(slug)?.modo === 'numero';
}
