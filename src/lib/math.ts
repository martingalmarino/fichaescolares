import { mulberry32 } from './prng';

export type TipoCuenta = 'tablas' | 'suma' | 'resta' | 'multiplicacion' | 'division';
export type FormatoCuenta = 'vertical' | 'horizontal';

export interface Problema {
	a: number;
	b: number;
	operador: '+' | '−' | '×' | '÷';
	resultado: number;
	resto: number;
}

export interface OpcionesMatematica {
	tipo: TipoCuenta;
	minimo: number;
	maximo: number;
	cantidad: number;
	llevar: boolean;
	conResto: boolean;
}

function digitos(valor: number): number[] {
	return String(valor).split('').map(Number);
}

function sinLlevarSuma(a: number, b: number): boolean {
	const izquierda = digitos(a);
	const derecha = digitos(b);
	const largo = Math.max(izquierda.length, derecha.length);
	for (let index = 0; index < largo; index += 1) {
		const suma = (izquierda[izquierda.length - 1 - index] ?? 0) + (derecha[derecha.length - 1 - index] ?? 0);
		if (suma >= 10) return false;
	}
	return true;
}

function sinPedirPrestado(a: number, b: number): boolean {
	const izquierda = digitos(a);
	const derecha = digitos(b);
	const largo = Math.max(izquierda.length, derecha.length);
	for (let index = 0; index < largo; index += 1) {
		if ((izquierda[izquierda.length - 1 - index] ?? 0) < (derecha[derecha.length - 1 - index] ?? 0)) return false;
	}
	return true;
}

function entero(rand: () => number, minimo: number, maximo: number): number {
	const piso = Math.ceil(Math.min(minimo, maximo));
	const techo = Math.floor(Math.max(minimo, maximo));
	return piso + Math.floor(rand() * (techo - piso + 1));
}

function crearUno(opciones: OpcionesMatematica, rand: () => number): Problema | null {
	const minimo = Math.max(0, opciones.minimo);
	const maximo = Math.max(minimo, opciones.maximo);

	if (opciones.tipo === 'tablas') {
		const a = entero(rand, 1, 10);
		const b = entero(rand, 1, 10);
		return { a, b, operador: '×', resultado: a * b, resto: 0 };
	}

	if (opciones.tipo === 'suma') {
		for (let intento = 0; intento < 40; intento += 1) {
			const a = entero(rand, minimo, maximo);
			const b = entero(rand, minimo, maximo);
			if (!opciones.llevar && !sinLlevarSuma(a, b)) continue;
			return { a, b, operador: '+', resultado: a + b, resto: 0 };
		}
		return null;
	}

	if (opciones.tipo === 'resta') {
		for (let intento = 0; intento < 40; intento += 1) {
			let a = entero(rand, minimo, maximo);
			let b = entero(rand, minimo, maximo);
			if (b > a) [a, b] = [b, a];
			if (!opciones.llevar && !sinPedirPrestado(a, b)) continue;
			return { a, b, operador: '−', resultado: a - b, resto: 0 };
		}
		return null;
	}

	if (opciones.tipo === 'multiplicacion') {
		for (let intento = 0; intento < 40; intento += 1) {
			const a = entero(rand, Math.max(minimo, 1), maximo);
			const b = entero(rand, Math.max(minimo, 1), Math.min(maximo, opciones.llevar ? maximo : 9));
			if (!opciones.llevar && !digitos(a).every((digito) => digito * b < 10)) continue;
			return { a, b, operador: '×', resultado: a * b, resto: 0 };
		}
		return null;
	}

	for (let intento = 0; intento < 40; intento += 1) {
		const divisor = entero(rand, Math.max(minimo, 1), Math.max(maximo, 1));
		const cociente = entero(rand, Math.max(minimo, 1), Math.max(maximo, 1));
		if (divisor === 0) continue;
		const resto = opciones.conResto ? Math.floor(rand() * divisor) : 0;
		const dividendo = cociente * divisor + resto;
		return { a: dividendo, b: divisor, operador: '÷', resultado: cociente, resto };
	}
	return null;
}

export function crearOperaciones(opciones: OpcionesMatematica, seed: number): Problema[] {
	const rand = mulberry32(seed >>> 0);
	const cantidad = Math.min(40, Math.max(1, opciones.cantidad));
	const problemas: Problema[] = [];
	for (let index = 0; index < cantidad; index += 1) {
		const problema = crearUno(opciones, rand);
		if (problema) problemas.push(problema);
	}
	return problemas;
}
