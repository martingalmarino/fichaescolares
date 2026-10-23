import { describe, expect, it } from 'vitest';
import { normalizeWord } from './normalize';
import { mulberry32 } from './prng';
import { createWordSearch, directionsFor, hasBannedSubstring } from './wordsearch';

const MAYO = [
	'CABILDO',
	'JUNTA',
	'VIRREY',
	'PATRIA',
	'PUEBLO',
	'SAAVEDRA',
	'MORENO',
	'FRENCH',
	'BERUTI',
	'LIBERTAD',
	'MAYO',
	'REVOLUCIÓN',
];

describe('normalizeWord', () => {
	it('saca tildes y espacios y conserva la Ñ', () => {
		expect(normalizeWord('SAN MARTÍN')).toBe('SANMARTIN');
		expect(normalizeWord('ñoño')).toBe('ÑOÑO');
		expect(normalizeWord('Revolución')).toBe('REVOLUCION');
	});
});

describe('mulberry32', () => {
	it('repite la serie con la misma semilla', () => {
		const first = mulberry32(1234);
		const second = mulberry32(1234);
		const sample = Array.from({ length: 5 }, () => first());
		expect(sample).toEqual(Array.from({ length: 5 }, () => second()));
	});
});

describe('directionsFor', () => {
	it('limita las direcciones según la dificultad', () => {
		expect(directionsFor('facil', false)).toEqual([
			{ dr: 0, dc: 1 },
			{ dr: 1, dc: 0 },
		]);
		expect(directionsFor('media', false)).toHaveLength(3);
		expect(directionsFor('media', true).some((direction) => direction.dc < 0 || direction.dr < 0)).toBe(true);
		expect(directionsFor('dificil', false)).toHaveLength(8);
	});
});

describe('createWordSearch', () => {
	it('arma la misma grilla con la misma semilla', () => {
		const input = { words: MAYO, size: 14, difficulty: 'media' as const, reverseDiagonals: false, seed: 1234 };
		expect(createWordSearch(input).grid).toEqual(createWordSearch(input).grid);
	});

	it('coloca cada palabra en la celda indicada', () => {
		const result = createWordSearch({
			words: MAYO,
			size: 14,
			difficulty: 'dificil',
			reverseDiagonals: false,
			seed: 42,
		});

		for (const placement of result.placements) {
			for (let index = 0; index < placement.word.length; index++) {
				const row = placement.row + placement.dr * index;
				const col = placement.col + placement.dc * index;
				expect(result.grid[row]?.[col]).toBe(placement.word[index]);
			}
		}
	});

	it('en fácil solo avanza a la derecha o abajo', () => {
		const result = createWordSearch({
			words: MAYO,
			size: 12,
			difficulty: 'facil',
			reverseDiagonals: false,
			seed: 7,
		});

		for (const placement of result.placements) {
			const forward = (placement.dr === 0 && placement.dc === 1) || (placement.dr === 1 && placement.dc === 0);
			expect(forward).toBe(true);
		}
	});

	it('deja afuera la palabra más larga que la grilla', () => {
		const result = createWordSearch({
			words: ['INDEPENDENCIA', 'MAYO'],
			size: 10,
			difficulty: 'facil',
			reverseDiagonals: false,
			seed: 3,
		});

		expect(result.omitted).toEqual([{ word: 'INDEPENDENCIA', reason: 'larga' }]);
		expect(result.placements.map((placement) => placement.word)).toContain('MAYO');
	});

	it('no deja groserías obvias en la grilla', () => {
		const result = createWordSearch({
			words: ['PATRIA', 'PUEBLO', 'MAYO'],
			size: 10,
			difficulty: 'media',
			reverseDiagonals: false,
			seed: 99,
		});
		const lines = [
			...result.grid.map((row) => row.join('')),
			...result.grid[0]!.map((_, col) => result.grid.map((row) => row[col]).join('')),
		];
		expect(lines.some(hasBannedSubstring)).toBe(false);
	});
});

describe('hasBannedSubstring', () => {
	it('detecta una palabra de la lista negra', () => {
		expect(hasBannedSubstring('XXPUTAYY')).toBe(true);
		expect(hasBannedSubstring('PATRIA')).toBe(false);
	});
});
