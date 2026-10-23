import { normalizeWord } from './normalize';
import { createWordSearch, type WordSearchResult } from './wordsearch';

export function sopaDeFicha(palabras: string[], semilla: number): WordSearchResult {
	const largo = Math.max(...palabras.map((palabra) => normalizeWord(palabra).length));
	let ultima = createWordSearch({
		words: palabras,
		size: Math.max(12, largo),
		difficulty: 'facil',
		reverseDiagonals: false,
		seed: semilla,
	});
	for (let size = Math.max(12, largo); size <= 18; size += 1) {
		const resultado = createWordSearch({
			words: palabras,
			size,
			difficulty: 'facil',
			reverseDiagonals: false,
			seed: semilla,
		});
		ultima = resultado;
		if (resultado.omitted.length === 0 && resultado.placements.length === palabras.length) return resultado;
	}
	return ultima;
}

export function semillaDeFicha(slug: string): number {
	let hash = 2166136261;
	for (const caracter of slug) hash = Math.imul(hash ^ caracter.charCodeAt(0), 16777619);
	return hash >>> 0;
}
