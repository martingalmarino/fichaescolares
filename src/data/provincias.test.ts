import { describe, expect, it } from 'vitest';
import fuente from './provincias.fuente.json';
import siluetas from './siluetas.json';
import { publicarProvincias } from './publicar-provincias';
import { sopaDeFicha } from '../lib/sopa-ficha';

const disponibles = new Set(Object.keys(siluetas));

function completaRioNegro() {
	const base = structuredClone(fuente.find((provincia) => provincia.id === 'rio_negro'));
	if (!base) throw new Error('falta Río Negro en la fuente');
	base.region = {
		valor: 'Patagonia',
		fuente: ['https://www.example.org/region'],
		verificado: true,
	};
	base.palabras_clave = {
		valor: ['VIEDMA', 'NOTRO', 'CIPRES', 'PATAGONIA', 'NEGRO', 'MANZANA', 'LAGO', 'VALLE'],
		fuente: ['https://www.example.org/palabras'],
		verificado: true,
	};
	return base;
}

describe('publicarProvincias', () => {
	it('lista las jurisdicciones que tienen superficie y población citadas', () => {
		const publicadas = publicarProvincias(fuente, disponibles);
		expect(publicadas).toHaveLength(24);
		expect(publicadas.map((provincia) => provincia.slug)).toContain('misiones');
		const rioNegro = publicadas.find((provincia) => provincia.slug === 'rio-negro');
		expect(rioNegro?.capital).toBe('Viedma');
		expect(rioNegro?.flor).toBe('Notro');
		expect(rioNegro?.arbol).toBe('Ciprés de la cordillera');
		expect(publicadas.find((provincia) => provincia.slug === 'caba')?.capital).toBeNull();
		expect(publicadas.find((provincia) => provincia.slug === 'san-juan')?.bandera).toBeNull();
		expect(publicadas.every((provincia) => provincia.palabras === null)).toBe(true);
	});

	it('suma región, símbolos y las ocho palabras cuando esas fuentes están', () => {
		const publicada = publicarProvincias([completaRioNegro()], disponibles)[0];
		expect(publicada?.region).toBe('Patagonia');
		expect(publicada?.palabras).toHaveLength(8);
		expect(publicada?.bandera?.src.startsWith('https://upload.wikimedia.org/')).toBe(true);
	});

	it('publica la ficha sin la flor si esa fuente no es una URL', () => {
		const base = completaRioNegro();
		base.flor_provincial = {
			valor: 'Notro',
			fuente: ['web.legisrn.gov.ar, sin URL'],
			verificado: true,
			norma: 'Ley B 3.387 (2000)',
		};
		expect(publicarProvincias([base], disponibles)[0]?.flor).toBeNull();
	});

	it('omite la bandera si la licencia no es libre', () => {
		const base = completaRioNegro();
		base.bandera = { ...base.bandera, licencia: 'CC BY-NC 4.0' };
		expect(publicarProvincias([base], disponibles)[0]?.bandera).toBeNull();
	});

	it('no publica la jurisdicción si no hay silueta', () => {
		expect(publicarProvincias([completaRioNegro()], new Set())).toEqual([]);
	});
});

describe('sopaDeFicha', () => {
	it('coloca las ocho palabras', () => {
		const palabras = ['VIEDMA', 'NOTRO', 'CIPRES', 'PATAGONIA', 'NEGRO', 'MANZANA', 'LAGO', 'VALLE'];
		const sopa = sopaDeFicha(palabras, 3387);
		expect(sopa.omitted).toEqual([]);
		expect(sopa.placements.map((lugar) => lugar.original).sort()).toEqual([...palabras].sort());
	});
});
