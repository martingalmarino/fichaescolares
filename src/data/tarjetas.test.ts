import { describe, expect, it } from 'vitest';
import { TARJETAS, nivelesDe, tarjetaPorSlug } from './tarjetas';

describe('tarjetas educativas', () => {
	it('publica los seis juegos y vocales no tiene segunda hoja', () => {
		expect(TARJETAS.map((set) => set.slug)).toEqual(['abecedario', 'vocales', 'silabas', 'numeros-1-al-20', 'colores-y-formas', 'dias-y-meses']);
		expect(tarjetaPorSlug('vocales')?.imagenes.some((imagen) => imagen.src.endsWith('-pagina-2.webp'))).toBe(false);
		expect(tarjetaPorSlug('abecedario')?.imagenes).toHaveLength(3);
	});

	it('incluye primer grado cuando el nivel llega hasta segundo', () => {
		expect(nivelesDe(tarjetaPorSlug('dias-y-meses')!)).toEqual(['inicial', 'primero', 'segundo']);
		expect(nivelesDe(tarjetaPorSlug('silabas')!)).toEqual(['primero']);
		expect(nivelesDe(tarjetaPorSlug('vocales')!)).toEqual(['inicial']);
		expect(nivelesDe(tarjetaPorSlug('abecedario')!)).toEqual(['inicial', 'primero']);
	});
});
