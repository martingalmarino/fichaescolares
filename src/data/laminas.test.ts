import { describe, expect, it } from 'vitest';
import crudas from './laminas.json';
import { laminasDeFecha, publicadas, relacionadas } from './laminas';

const ocultas = ['cabildo', 'escudo-nacional', 'casa-de-tucuman', 'hornero', 'flor-de-ceibo'];

describe('láminas publicadas', () => {
	it('deja afuera las que están en revisión', () => {
		const slugs = publicadas.map((item) => item.slug);
		for (const slug of ocultas) expect(slugs).not.toContain(slug);
		expect(publicadas).toHaveLength(crudas.filter((item) => item.estado === 'publicar').length);
	});

	it('no ofrece el Cabildo el 25 de mayo y sí la escarapela', () => {
		const slugs = laminasDeFecha(25, 5).map((item) => item.slug);
		expect(slugs).toContain('escarapela');
		expect(slugs).not.toContain('cabildo');
	});

	it('guarda el hornero en el 5 de octubre y no lo publica', () => {
		const hornero = crudas.find((item) => item.slug === 'hornero');
		expect(hornero?.efemerides).toEqual(['5 de octubre']);
		expect(hornero?.estado).toBe('revisar');
	});

	it('arma hasta cuatro relacionadas sin repetir la lámina', () => {
		const escarapela = publicadas.find((item) => item.slug === 'escarapela');
		expect(escarapela).toBeTruthy();
		const otras = relacionadas(escarapela!);
		expect(otras.length).toBeLessThanOrEqual(4);
		expect(otras.map((item) => item.slug)).not.toContain('escarapela');
		expect(otras.every((item) => item.ancho > 0 && item.alto > 0)).toBe(true);
	});
});
