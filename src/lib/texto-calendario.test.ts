import { describe, expect, it } from 'vitest';
import { provincias } from '../data/provincias';
import { fechaCorta, regionesEscolares } from './texto-calendario';

describe('grilla del calendario', () => {
	it('formatea la fecha corta de la tarjeta', () => {
		expect(fechaCorta('2027-03-01')).toBe('1 mar');
		expect(fechaCorta('2027-07-17')).toBe('17 jul');
		expect(fechaCorta('2027-12-11')).toBe('11 dic');
	});

	it('reparte las 24 provincias en Centro, NOA, NEA, Cuyo y Patagonia', () => {
		expect(regionesEscolares.map((region) => region.slugs.length)).toEqual([6, 6, 4, 3, 5]);
		const slugs = regionesEscolares.flatMap((region) => [...region.slugs]);
		expect(new Set(slugs).size).toBe(24);
		expect([...slugs].sort()).toEqual(provincias.map((provincia) => provincia.slug).sort());
	});
});
