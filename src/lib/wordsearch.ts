import { mulberry32 } from './prng';
import { normalizeWord } from './normalize';

export type Difficulty = 'facil' | 'media' | 'dificil';

export interface Direction {
	dr: number;
	dc: number;
}

export interface Placement {
	word: string;
	original: string;
	row: number;
	col: number;
	dr: number;
	dc: number;
}

export interface OmittedWord {
	word: string;
	reason: 'larga' | 'sin-lugar';
}

export interface WordSearchResult {
	grid: string[][];
	placements: Placement[];
	omitted: OmittedWord[];
}

export interface WordSearchInput {
	words: string[];
	size: number;
	difficulty: Difficulty;
	reverseDiagonals: boolean;
	seed: number;
}

const EAST: Direction = { dr: 0, dc: 1 };
const SOUTH: Direction = { dr: 1, dc: 0 };
const SOUTH_EAST: Direction = { dr: 1, dc: 1 };
const WEST: Direction = { dr: 0, dc: -1 };
const NORTH: Direction = { dr: -1, dc: 0 };
const NORTH_WEST: Direction = { dr: -1, dc: -1 };
const SOUTH_WEST: Direction = { dr: 1, dc: -1 };
const NORTH_EAST: Direction = { dr: -1, dc: 1 };

const ALL_DIRECTIONS = [EAST, SOUTH, SOUTH_EAST, WEST, NORTH, NORTH_WEST, SOUTH_WEST, NORTH_EAST];

const BANNED = [
	'MIERDA',
	'PUTA',
	'PUTO',
	'CULO',
	'PENDEJO',
	'CONCHA',
	'FORRO',
	'PELOTUDO',
	'BOLUDO',
	'VERGA',
	'CHOTA',
	'IDIOTA',
];

const LETTERS: ReadonlyArray<readonly [string, number]> = [
	['E', 137],
	['A', 125],
	['O', 87],
	['S', 80],
	['R', 69],
	['N', 67],
	['I', 62],
	['D', 59],
	['L', 50],
	['T', 46],
	['C', 40],
	['U', 39],
	['M', 32],
	['P', 25],
	['B', 14],
	['G', 10],
	['V', 9],
	['Y', 9],
	['Q', 9],
	['H', 7],
	['F', 7],
	['Z', 5],
	['J', 4],
	['Ñ', 3],
	['X', 2],
	['K', 1],
	['W', 1],
];

const LETTER_TOTAL = LETTERS.reduce((sum, [, weight]) => sum + weight, 0);

export function directionsFor(difficulty: Difficulty, reverseDiagonals: boolean): Direction[] {
	if (difficulty === 'dificil') return ALL_DIRECTIONS;

	const base = difficulty === 'facil' ? [EAST, SOUTH] : [EAST, SOUTH, SOUTH_EAST];
	if (!reverseDiagonals) return base;

	const reversed = base.map((direction) => ({ dr: -direction.dr, dc: -direction.dc }));
	return [...base, ...reversed];
}

export function hasBannedSubstring(text: string): boolean {
	return BANNED.some((word) => text.includes(word));
}

export function createWordSearch(input: WordSearchInput): WordSearchResult {
	const size = input.size;
	const directions = directionsFor(input.difficulty, input.reverseDiagonals);
	const seen = new Set<string>();
	const usable: { original: string; word: string }[] = [];
	const omitted: OmittedWord[] = [];

	for (const original of input.words) {
		const word = normalizeWord(original);
		if (word.length < 2 || seen.has(word)) continue;
		seen.add(word);
		if (word.length > size) {
			omitted.push({ word: original, reason: 'larga' });
			continue;
		}
		usable.push({ original, word });
	}

	usable.sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word, 'es'));

	for (let attempt = 0; attempt < 20; attempt++) {
		const placed = placeAll(usable, size, directions, mixSeed(input.seed, attempt));
		if (placed) {
			fillEmpty(placed.grid, placed.rng);
			return { grid: placed.grid, placements: placed.placements, omitted };
		}
	}

	const fallback = placeGreedy(usable, size, directions, mixSeed(input.seed, 20));
	fillEmpty(fallback.grid, fallback.rng);
	return {
		grid: fallback.grid,
		placements: fallback.placements,
		omitted: [...omitted, ...fallback.omitted],
	};
}

function mixSeed(seed: number, attempt: number): number {
	return (Math.imul(seed >>> 0, 0x9e3779b1) + attempt * 0x85ebca6b) >>> 0;
}

function placeAll(
	words: { original: string; word: string }[],
	size: number,
	directions: Direction[],
	seed: number,
): { grid: string[][]; placements: Placement[]; rng: () => number } | null {
	const rng = mulberry32(seed);
	const grid = emptyGrid(size);
	const placements: Placement[] = [];

	for (const entry of words) {
		const placement = tryPlace(grid, entry, directions, rng);
		if (!placement) return null;
		placements.push(placement);
	}

	return { grid, placements, rng };
}

function placeGreedy(
	words: { original: string; word: string }[],
	size: number,
	directions: Direction[],
	seed: number,
): { grid: string[][]; placements: Placement[]; omitted: OmittedWord[]; rng: () => number } {
	const rng = mulberry32(seed);
	const grid = emptyGrid(size);
	const placements: Placement[] = [];
	const omitted: OmittedWord[] = [];

	for (const entry of words) {
		const placement = tryPlace(grid, entry, directions, rng);
		if (placement) placements.push(placement);
		else omitted.push({ word: entry.original, reason: 'sin-lugar' });
	}

	return { grid, placements, omitted, rng };
}

function tryPlace(
	grid: string[][],
	entry: { original: string; word: string },
	directions: Direction[],
	rng: () => number,
): Placement | null {
	const size = grid.length;

	for (let attempt = 0; attempt < 200; attempt++) {
		const direction = directions[Math.floor(rng() * directions.length)] ?? EAST;
		const row = Math.floor(rng() * size);
		const col = Math.floor(rng() * size);
		if (!canPlace(grid, entry.word, row, col, direction)) continue;
		writeWord(grid, entry.word, row, col, direction);
		return {
			word: entry.word,
			original: entry.original,
			row,
			col,
			dr: direction.dr,
			dc: direction.dc,
		};
	}

	return null;
}

function canPlace(grid: string[][], word: string, row: number, col: number, direction: Direction): boolean {
	const size = grid.length;

	for (let index = 0; index < word.length; index++) {
		const nextRow = row + direction.dr * index;
		const nextCol = col + direction.dc * index;
		if (nextRow < 0 || nextCol < 0 || nextRow >= size || nextCol >= size) return false;
		const cell = grid[nextRow]?.[nextCol] ?? '';
		const letter = word[index] ?? '';
		if (cell !== '' && cell !== letter) return false;
	}

	return true;
}

function writeWord(grid: string[][], word: string, row: number, col: number, direction: Direction): void {
	for (let index = 0; index < word.length; index++) {
		const line = grid[row + direction.dr * index];
		if (!line) continue;
		line[col + direction.dc * index] = word[index] ?? '';
	}
}

function emptyGrid(size: number): string[][] {
	return Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
}

function fillEmpty(grid: string[][], rng: () => number): void {
	for (let row = 0; row < grid.length; row++) {
		const line = grid[row];
		if (!line) continue;
		for (let col = 0; col < line.length; col++) {
			if (line[col] !== '') continue;
			line[col] = pickLetter(grid, row, col, rng);
		}
	}
}

function pickLetter(grid: string[][], row: number, col: number, rng: () => number): string {
	const line = grid[row];
	if (!line) return 'E';

	for (let attempt = 0; attempt < 24; attempt++) {
		const letter = weightedLetter(rng);
		line[col] = letter;
		if (!linesThrough(grid, row, col).some(hasBannedSubstring)) return letter;
	}

	line[col] = 'E';
	if (linesThrough(grid, row, col).some(hasBannedSubstring)) line[col] = 'A';
	return line[col] ?? 'E';
}

function weightedLetter(rng: () => number): string {
	let cursor = rng() * LETTER_TOTAL;
	for (const [letter, weight] of LETTERS) {
		cursor -= weight;
		if (cursor <= 0) return letter;
	}
	return 'E';
}

function linesThrough(grid: string[][], row: number, col: number): string[] {
	const size = grid.length;
	const lines = [readLine(grid, row, 0, 0, 1, size), readLine(grid, 0, col, 1, 0, size)];

	const diagonalStart = Math.min(row, col);
	lines.push(readLine(grid, row - diagonalStart, col - diagonalStart, 1, 1, size));

	const antiStart = Math.min(row, size - 1 - col);
	lines.push(readLine(grid, row - antiStart, col + antiStart, 1, -1, size));

	return lines;
}

function readLine(
	grid: string[][],
	row: number,
	col: number,
	dr: number,
	dc: number,
	size: number,
): string {
	let text = '';
	let nextRow = row;
	let nextCol = col;

	while (nextRow >= 0 && nextCol >= 0 && nextRow < size && nextCol < size) {
		text += grid[nextRow]?.[nextCol] ?? '';
		nextRow += dr;
		nextCol += dc;
	}

	return text;
}
