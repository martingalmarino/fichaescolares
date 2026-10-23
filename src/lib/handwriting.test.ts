import { describe, expect, it } from 'vitest';
import { altoDeRenglon, lineasDePauta, muestraTexto, tamanoDeTrazo } from './handwriting';

describe('handwriting', () => {
	it('alterna calcar y copiar en el modo mixto', () => {
		expect(muestraTexto('calcar', 1)).toBe(true);
		expect(muestraTexto('copiar', 1)).toBe(false);
		expect(muestraTexto('mixto', 0)).toBe(true);
		expect(muestraTexto('mixto', 1)).toBe(false);
	});

	it('achica una frase larga para que entre en el renglón', () => {
		const frase = 'Oíd, mortales, el grito sagrado: libertad.';
		const tamano = tamanoDeTrazo(frase, 24, true, 628);
		expect(tamano).toBeLessThan(24 * 1.05);
		expect([...frase].length * tamano * 0.75).toBeLessThanOrEqual(628);
	});

	it('sigue achicando una frase muy larga, sin piso que la recorte', () => {
		const frase = 'libertad '.repeat(24).trim();
		const disponible = 628;
		const tamano = tamanoDeTrazo(frase, 24, true, disponible);
		expect([...frase].length * tamano * 0.75).toBeLessThanOrEqual(disponible + 0.01);
		expect(tamano).toBeLessThan(8);
	});

	it('la pauta doble tiene cuatro líneas y la simple dos', () => {
		expect(lineasDePauta('simple', 20)).toHaveLength(2);
		expect(lineasDePauta('doble', 20)).toHaveLength(4);
		expect(altoDeRenglon('doble', 20)).toBeGreaterThan(altoDeRenglon('simple', 20));
	});
});
