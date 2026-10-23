import { describe, expect, it } from 'vitest';
import { altoDeRenglon, lineasDePauta, muestraTexto } from './handwriting';

describe('handwriting', () => {
	it('alterna calcar y copiar en el modo mixto', () => {
		expect(muestraTexto('calcar', 1)).toBe(true);
		expect(muestraTexto('copiar', 1)).toBe(false);
		expect(muestraTexto('mixto', 0)).toBe(true);
		expect(muestraTexto('mixto', 1)).toBe(false);
	});

	it('la pauta doble tiene cuatro líneas y la simple dos', () => {
		expect(lineasDePauta('simple', 20)).toHaveLength(2);
		expect(lineasDePauta('doble', 20)).toHaveLength(4);
		expect(altoDeRenglon('doble', 20)).toBeGreaterThan(altoDeRenglon('simple', 20));
	});
});
