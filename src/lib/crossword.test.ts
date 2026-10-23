import { describe, expect, it } from 'vitest';
import { createCrossword } from './crossword';

const entradas = [
	{ word: 'PATRIA', clue: 'Nombre de la tierra propia.' },
	{ word: 'ANDES', clue: 'Cordillera que cruzó el ejército.' },
	{ word: 'SALTA', clue: 'Provincia del norte.' },
	{ word: 'MESA', clue: 'Mueble de cuatro patas.' },
	{ word: 'SOL', clue: 'Está en el centro de la bandera.' },
];

describe('createCrossword', () => {
	it('repite el mismo armado con la misma semilla', () => {
		const primero = createCrossword(entradas, 1234);
		const segundo = createCrossword(entradas, 1234);
		expect(segundo).toEqual(primero);
	});

	it('cruza letras iguales y deja vacías las celdas de antes y después', () => {
		const resultado = createCrossword(entradas, 99);
		expect(resultado.placements.length).toBeGreaterThan(1);
		const ocupadas = new Set<string>();
		for (const puesta of resultado.placements) {
			const dr = puesta.dir === 'V' ? 1 : 0;
			const dc = puesta.dir === 'H' ? 1 : 0;
			expect(resultado.grid[puesta.row - dr]?.[puesta.col - dc] ?? null).toBeNull();
			expect(resultado.grid[puesta.row + dr * puesta.word.length]?.[puesta.col + dc * puesta.word.length] ?? null).toBeNull();
			for (let index = 0; index < puesta.word.length; index += 1) {
				const row = puesta.row + dr * index;
				const col = puesta.col + dc * index;
				expect(resultado.grid[row]?.[col]).toBe(puesta.word[index]);
				ocupadas.add(`${row},${col}`);
			}
		}
		expect(ocupadas.size).toBeLessThan(resultado.placements.reduce((total, item) => total + item.word.length, 0));
	});

	it('numera de izquierda a derecha y de arriba abajo', () => {
		const resultado = createCrossword(entradas, 7);
		const numeros = resultado.placements.map((item) => item.number);
		expect(numeros.every((numero) => numero > 0)).toBe(true);
		const orden = [...resultado.placements].sort((a, b) => a.row - b.row || a.col - b.col || a.number - b.number);
		let anterior = 0;
		for (const item of orden) {
			expect(item.number).toBeGreaterThanOrEqual(anterior);
			anterior = item.number;
		}
	});

	it('deja afuera una palabra sin letras en común', () => {
		const resultado = createCrossword(
			[
				{ word: 'CASA', clue: 'Vivienda.' },
				{ word: 'QQQ', clue: 'No comparte letras.' },
			],
			3,
		);
		expect(resultado.placements.map((item) => item.word)).toEqual(['CASA']);
		expect(resultado.omitted.map((item) => item.word)).toEqual(['QQQ']);
	});
});
