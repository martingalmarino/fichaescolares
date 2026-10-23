import { describe, expect, it } from 'vitest';
import { crearOperaciones } from './math';

describe('crearOperaciones', () => {
	it('repite las cuentas con la misma semilla', () => {
		const opciones = { tipo: 'suma' as const, minimo: 10, maximo: 80, cantidad: 12, llevar: true, conResto: false };
		expect(crearOperaciones(opciones, 42)).toEqual(crearOperaciones(opciones, 42));
	});

	it('no genera restas negativas ni pide prestado si la dificultad lo impide', () => {
		const cuentas = crearOperaciones(
			{ tipo: 'resta', minimo: 10, maximo: 99, cantidad: 20, llevar: false, conResto: false },
			8,
		);
		expect(cuentas.length).toBeGreaterThan(0);
		for (const cuenta of cuentas) {
			expect(cuenta.resultado).toBe(cuenta.a - cuenta.b);
			expect(cuenta.resultado).toBeGreaterThanOrEqual(0);
			const a = String(cuenta.a).padStart(2, '0');
			const b = String(cuenta.b).padStart(2, '0');
			for (let index = 0; index < a.length; index += 1) {
				expect(Number(a[index])).toBeGreaterThanOrEqual(Number(b[b.length - a.length + index] ?? 0));
			}
		}
	});

	it('arma divisiones exactas salvo que se pida resto', () => {
		const exactas = crearOperaciones(
			{ tipo: 'division', minimo: 2, maximo: 9, cantidad: 10, llevar: true, conResto: false },
			5,
		);
		for (const cuenta of exactas) {
			expect(cuenta.resto).toBe(0);
			expect(cuenta.a).toBe(cuenta.resultado * cuenta.b);
		}
		const conResto = crearOperaciones(
			{ tipo: 'division', minimo: 2, maximo: 9, cantidad: 10, llevar: true, conResto: true },
			5,
		);
		for (const cuenta of conResto) {
			expect(cuenta.resto).toBeGreaterThanOrEqual(0);
			expect(cuenta.resto).toBeLessThan(cuenta.b);
			expect(cuenta.a).toBe(cuenta.resultado * cuenta.b + cuenta.resto);
		}
	});
});
