import { mulberry32 } from './prng';

export interface CrosswordEntry {
	word: string;
	clue: string;
}

export interface PlacedWord {
	word: string;
	clue: string;
	row: number;
	col: number;
	dir: 'H' | 'V';
	number: number;
}

export interface CrosswordResult {
	grid: (string | null)[][];
	placements: PlacedWord[];
	across: PlacedWord[];
	down: PlacedWord[];
	omitted: CrosswordEntry[];
}

const GRID = 40;

interface Draft {
	word: string;
	clue: string;
	row: number;
	col: number;
	dir: 'H' | 'V';
}

function mixSeed(seed: number, attempt: number): number {
	return (Math.imul(seed >>> 0, 0x9e3779b1) + attempt * 0x85ebca6b) >>> 0;
}

function key(row: number, col: number): string {
	return `${row},${col}`;
}

function letterAt(board: Map<string, string>, row: number, col: number): string | undefined {
	return board.get(key(row, col));
}

function canPlace(board: Map<string, string>, word: string, row: number, col: number, dir: 'H' | 'V'): boolean {
	const dr = dir === 'V' ? 1 : 0;
	const dc = dir === 'H' ? 1 : 0;
	const pr = dir === 'H' ? 1 : 0;
	const pc = dir === 'V' ? 1 : 0;

	if (letterAt(board, row - dr, col - dc)) return false;
	if (letterAt(board, row + dr * word.length, col + dc * word.length)) return false;

	let fresh = 0;
	for (let index = 0; index < word.length; index += 1) {
		const nextRow = row + dr * index;
		const nextCol = col + dc * index;
		if (nextRow < 0 || nextCol < 0 || nextRow >= GRID || nextCol >= GRID) return false;
		const existing = letterAt(board, nextRow, nextCol);
		if (existing) {
			if (existing !== word[index]) return false;
			if (index > 0 && letterAt(board, nextRow - dr, nextCol - dc)) return false;
		} else {
			fresh += 1;
			if (letterAt(board, nextRow + pr, nextCol + pc) || letterAt(board, nextRow - pr, nextCol - pc)) return false;
		}
	}

	return fresh > 0;
}

function crossings(board: Map<string, string>, word: string, row: number, col: number, dir: 'H' | 'V'): number {
	const dr = dir === 'V' ? 1 : 0;
	const dc = dir === 'H' ? 1 : 0;
	let count = 0;
	for (let index = 0; index < word.length; index += 1) {
		if (letterAt(board, row + dr * index, col + dc * index)) count += 1;
	}
	return count;
}

function bounds(placed: Draft[], extra?: Draft): { area: number } {
	const items = extra ? [...placed, extra] : placed;
	let minRow = GRID;
	let minCol = GRID;
	let maxRow = 0;
	let maxCol = 0;
	for (const item of items) {
		const dr = item.dir === 'V' ? 1 : 0;
		const dc = item.dir === 'H' ? 1 : 0;
		minRow = Math.min(minRow, item.row);
		minCol = Math.min(minCol, item.col);
		maxRow = Math.max(maxRow, item.row + dr * (item.word.length - 1));
		maxCol = Math.max(maxCol, item.col + dc * (item.word.length - 1));
	}
	return { area: (maxRow - minRow + 1) * (maxCol - minCol + 1) };
}

function candidatesFor(board: Map<string, string>, placed: Draft[], entry: CrosswordEntry): Draft[] {
	const found: Draft[] = [];
	const seen = new Set<string>();
	for (const other of placed) {
		const odr = other.dir === 'V' ? 1 : 0;
		const odc = other.dir === 'H' ? 1 : 0;
		const dir: 'H' | 'V' = other.dir === 'H' ? 'V' : 'H';
		for (let index = 0; index < entry.word.length; index += 1) {
			for (let otherIndex = 0; otherIndex < other.word.length; otherIndex += 1) {
				if (entry.word[index] !== other.word[otherIndex]) continue;
				const crossRow = other.row + odr * otherIndex;
				const crossCol = other.col + odc * otherIndex;
				const row = dir === 'V' ? crossRow - index : crossRow;
				const col = dir === 'H' ? crossCol - index : crossCol;
				const id = `${dir}:${row}:${col}`;
				if (seen.has(id)) continue;
				seen.add(id);
				if (!canPlace(board, entry.word, row, col, dir)) continue;
				found.push({ word: entry.word, clue: entry.clue, row, col, dir });
			}
		}
	}
	return found;
}

function writeWord(board: Map<string, string>, draft: Draft) {
	const dr = draft.dir === 'V' ? 1 : 0;
	const dc = draft.dir === 'H' ? 1 : 0;
	for (let index = 0; index < draft.word.length; index += 1) {
		board.set(key(draft.row + dr * index, draft.col + dc * index), draft.word[index] ?? '');
	}
}

function layoutOnce(entries: CrosswordEntry[], rand: () => number): { placed: Draft[]; omitted: CrosswordEntry[] } {
	const board = new Map<string, string>();
	const placed: Draft[] = [];
	const pending = [...entries];
	const first = pending.shift();
	if (!first) return { placed, omitted: [] };

	const start = Math.floor((GRID - first.word.length) / 2);
	const opening: Draft = { word: first.word, clue: first.clue, row: Math.floor(GRID / 2), col: start, dir: 'H' };
	writeWord(board, opening);
	placed.push(opening);

	const skipped: CrosswordEntry[] = [];
	const queue = [...pending];
	for (let pass = 0; pass < 2; pass += 1) {
		const round = pass === 0 ? queue : skipped.splice(0);
		for (const entry of round) {
			const options = candidatesFor(board, placed, entry);
			if (options.length === 0) {
				skipped.push(entry);
				continue;
			}
			let bestScore = -Infinity;
			const best: Draft[] = [];
			for (const option of options) {
				const score = crossings(board, option.word, option.row, option.col, option.dir) * 100 - bounds(placed, option).area;
				if (score > bestScore) {
					bestScore = score;
					best.length = 0;
					best.push(option);
				} else if (score === bestScore) {
					best.push(option);
				}
			}
			const chosen = best[Math.floor(rand() * best.length)] ?? best[0];
			if (!chosen) {
				skipped.push(entry);
				continue;
			}
			writeWord(board, chosen);
			placed.push(chosen);
		}
	}

	return { placed, omitted: skipped };
}

function crop(placed: Draft[], omitted: CrosswordEntry[]): CrosswordResult {
	let minRow = GRID;
	let minCol = GRID;
	let maxRow = 0;
	let maxCol = 0;
	for (const item of placed) {
		const dr = item.dir === 'V' ? 1 : 0;
		const dc = item.dir === 'H' ? 1 : 0;
		minRow = Math.min(minRow, item.row);
		minCol = Math.min(minCol, item.col);
		maxRow = Math.max(maxRow, item.row + dr * (item.word.length - 1));
		maxCol = Math.max(maxCol, item.col + dc * (item.word.length - 1));
	}

	const rows = maxRow - minRow + 1;
	const cols = maxCol - minCol + 1;
	const grid: (string | null)[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
	const shifted = placed.map((item) => ({ ...item, row: item.row - minRow, col: item.col - minCol, number: 0 }));

	for (const item of shifted) {
		const dr = item.dir === 'V' ? 1 : 0;
		const dc = item.dir === 'H' ? 1 : 0;
		for (let index = 0; index < item.word.length; index += 1) {
			grid[item.row + dr * index]![item.col + dc * index] = item.word[index] ?? null;
		}
	}

	const starts = [...new Set(shifted.map((item) => key(item.row, item.col)))]
		.map((id) => {
			const [row, col] = id.split(',').map(Number);
			return { row: row ?? 0, col: col ?? 0 };
		})
		.sort((a, b) => a.row - b.row || a.col - b.col);

	const numbers = new Map<string, number>();
	starts.forEach((start, index) => numbers.set(key(start.row, start.col), index + 1));
	const placements = shifted.map((item) => ({ ...item, number: numbers.get(key(item.row, item.col)) ?? 0 }));

	return {
		grid,
		placements,
		across: placements.filter((item) => item.dir === 'H').sort((a, b) => a.number - b.number || a.col - b.col),
		down: placements.filter((item) => item.dir === 'V').sort((a, b) => a.number - b.number || a.row - b.row),
		omitted,
	};
}

export function createCrossword(entries: CrosswordEntry[], seed: number): CrosswordResult {
	const prepared = entries
		.map((entry) => ({ word: entry.word, clue: entry.clue.trim() }))
		.filter((entry) => entry.word.length >= 2 && entry.clue.length > 0)
		.sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word, 'es'));

	let best: { placed: Draft[]; omitted: CrosswordEntry[] } | null = null;
	for (let attempt = 0; attempt < 30; attempt += 1) {
		const rand = mulberry32(mixSeed(seed >>> 0, attempt));
		const current = layoutOnce(prepared, rand);
		if (!best || current.placed.length > best.placed.length) {
			best = current;
			continue;
		}
		if (current.placed.length === best.placed.length && bounds(current.placed).area < bounds(best.placed).area) {
			best = current;
		}
	}

	if (!best || best.placed.length === 0) {
		return { grid: [], placements: [], across: [], down: [], omitted: prepared };
	}
	return crop(best.placed, best.omitted);
}
