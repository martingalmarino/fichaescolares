import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { efemerides, etiquetaFecha, tieneFicha } from '../data/efemerides';
import { track } from '../lib/analytics';
import { toSeed } from '../lib/prng';
import { createWordSearch, type Difficulty, type Placement } from '../lib/wordsearch';
import { PreviewFrame, useBarraFija } from './preview';

interface Props {
	initialSlug: string | null;
	initialSeed: number | null;
}

type GridSize = 10 | 12 | 14 | 16;

const SIZES: GridSize[] = [10, 12, 14, 16];
const fechasConFicha = efemerides.filter(tieneFicha);

export default function SopaGenerator({ initialSlug, initialSeed }: Props) {
	const fallback = fechasConFicha.find((item) => item.slug === '25-de-mayo') ?? fechasConFicha[0];
	const starting = fechasConFicha.find((item) => item.slug === initialSlug) ?? fallback;

	const [slug, setSlug] = useState(starting?.slug ?? '25-de-mayo');
	const [seed, setSeed] = useState<number | null>(initialSeed);
	const [ready, setReady] = useState(false);
	const [difficulty, setDifficulty] = useState<Difficulty>('media');
	const [size, setSize] = useState<GridSize>(14);
	const [title, setTitle] = useState(starting?.titulo ?? 'Sopa de letras');
	const [uppercase, setUppercase] = useState(true);
	const [solutions, setSolutions] = useState(true);
	const [showName, setShowName] = useState(true);
	const [reverseDiagonals, setReverseDiagonals] = useState(false);
	const [optionsOpen, setOptionsOpen] = useState(true);
	const [pdfHint, setPdfHint] = useState(false);
	const barra = useRef<HTMLDivElement>(null);
	useBarraFija(barra);

	const efemeride = fechasConFicha.find((item) => item.slug === slug) ?? starting ?? fechasConFicha[0];

	useEffect(() => {
		const url = new URL(window.location.href);
		const fromSlug = url.searchParams.get('e');
		const fromSeed = url.searchParams.get('s');

		if (fromSlug && fechasConFicha.some((item) => item.slug === fromSlug)) {
			setSlug(fromSlug);
			const match = fechasConFicha.find((item) => item.slug === fromSlug);
			if (match) setTitle(match.titulo);
		}

		if (fromSeed && /^\d+$/.test(fromSeed)) {
			setSeed(toSeed(Number(fromSeed)));
		} else if (initialSeed == null) {
			const bytes = new Uint32Array(1);
			crypto.getRandomValues(bytes);
			setSeed(bytes[0] ?? 1);
		}

		setReady(true);
	}, [initialSeed]);

	useEffect(() => {
		if (!ready || seed == null || !efemeride) return;
		const url = new URL(window.location.href);
		url.searchParams.set('e', efemeride.slug);
		url.searchParams.set('s', String(seed));
		const next = `${url.pathname}${url.search}`;
		if (`${window.location.pathname}${window.location.search}` !== next) {
			window.history.replaceState({}, '', next);
		}
	}, [ready, seed, efemeride]);

	useEffect(() => {
		const onPop = () => {
			const url = new URL(window.location.href);
			const nextSlug = url.searchParams.get('e');
			const nextSeed = url.searchParams.get('s');
			if (nextSlug && fechasConFicha.some((item) => item.slug === nextSlug)) {
				setSlug(nextSlug);
				const match = fechasConFicha.find((item) => item.slug === nextSlug);
				if (match) setTitle(match.titulo);
			}
			if (nextSeed && /^\d+$/.test(nextSeed)) setSeed(toSeed(Number(nextSeed)));
		};
		window.addEventListener('popstate', onPop);
		return () => window.removeEventListener('popstate', onPop);
	}, []);

	const result = useMemo(() => {
		if (!ready || seed == null || !efemeride) return null;
		return createWordSearch({
			words: efemeride.vocabulario,
			size,
			difficulty,
			reverseDiagonals,
			seed,
		});
	}, [ready, efemeride, size, difficulty, reverseDiagonals, seed]);

	if (!efemeride) return null;

	const placed = result
		? efemeride.vocabulario.filter((word) => result.placements.some((placement) => placement.original === word))
		: [];
	const instruction = instructionFor(placed.length, efemeride.tema);

	function chooseEfemeride(nextSlug: string) {
		track('select_efemeride', { slug: nextSlug, from: 'sopa' });
		setSlug(nextSlug);
		const match = fechasConFicha.find((item) => item.slug === nextSlug);
		if (match) setTitle(match.titulo);
	}

	function another() {
		const bytes = new Uint32Array(1);
		crypto.getRandomValues(bytes);
		setSeed(bytes[0] ?? 1);
		track('regenerate', { tool: 'sopa' });
	}

	function printSheet(fromPdf: boolean) {
		const previous = document.title;
		document.title = title.trim() || 'Sopa de letras';
		const restore = () => {
			document.title = previous;
			window.removeEventListener('afterprint', restore);
		};
		window.addEventListener('afterprint', restore);
		track(fromPdf ? 'pdf_click' : 'print_click', { tool: 'sopa' });
		if (!fromPdf) {
			window.print();
			return;
		}
		setPdfHint(true);
		window.setTimeout(() => window.print(), 700);
		window.setTimeout(() => setPdfHint(false), 4000);
	}

	return (
		<div>
			<div class="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
				<aside class="panel rounded-card border border-borde bg-white p-4 shadow-card">
					<button
						type="button"
						class="flex w-full items-center justify-between text-left text-sm font-semibold text-azul xl:hidden"
						aria-expanded={optionsOpen}
						onClick={() => setOptionsOpen((open) => !open)}
					>
						Opciones
						<span aria-hidden="true">{optionsOpen ? '−' : '+'}</span>
					</button>

					<div class={optionsOpen ? 'mt-4 block xl:mt-0' : 'mt-4 hidden xl:block'}>
						<label class="block text-sm font-medium text-azul" for="efemeride">
							Efeméride
						</label>
						<select
							id="efemeride"
							class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
							value={efemeride.slug}
							onChange={(event) => chooseEfemeride(event.currentTarget.value)}
						>
							{fechasConFicha.map((item) => (
								<option key={item.slug} value={item.slug}>
									{etiquetaFecha(item.dia, item.mes, item.nombre)}
								</option>
							))}
						</select>

						<p class="mt-4 text-sm font-medium text-azul">Dificultad</p>
						<div class="mt-1.5 grid grid-cols-3 gap-1 rounded-control border border-borde p-1">
							{(
								[
									['facil', 'Fácil'],
									['media', 'Media'],
									['dificil', 'Difícil'],
								] as const
							).map(([value, label]) => (
								<button
									key={value}
									type="button"
									class={
										difficulty === value
											? 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white'
											: 'rounded-md px-2 py-1.5 text-sm text-texto'
									}
									aria-pressed={difficulty === value}
									onClick={() => setDifficulty(value)}
								>
									{label}
								</button>
							))}
						</div>

						<label class="mt-4 block text-sm font-medium text-azul" for="tamano">
							Tamaño de grilla
						</label>
						<select
							id="tamano"
							class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
							value={size}
							onChange={(event) => setSize(Number(event.currentTarget.value) as GridSize)}
						>
							{SIZES.map((value) => (
								<option key={value} value={value}>
									{value} × {value}
								</option>
							))}
						</select>

						<label class="mt-4 block text-sm font-medium text-azul" for="titulo">
							Título de la ficha
						</label>
						<input
							id="titulo"
							class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm"
							value={title}
							maxLength={60}
							onInput={(event) => setTitle(event.currentTarget.value)}
						/>

						<p class="mt-4 text-sm font-medium text-azul">Letras</p>
						<div class="mt-1.5 grid grid-cols-2 gap-1 rounded-control border border-borde p-1">
							<button
								type="button"
								class={
									uppercase
										? 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white'
										: 'rounded-md px-2 py-1.5 text-sm text-texto'
								}
								aria-pressed={uppercase}
								onClick={() => setUppercase(true)}
							>
								MAYÚSCULAS
							</button>
							<button
								type="button"
								class={
									uppercase
										? 'rounded-md px-2 py-1.5 text-sm text-texto'
										: 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white'
								}
								aria-pressed={!uppercase}
								onClick={() => setUppercase(false)}
							>
								minúsculas
							</button>
						</div>

						<div class="mt-4 space-y-2 text-sm text-texto">
							<Check
								label="Incluir hoja de soluciones"
								checked={solutions}
								onChange={(value) => {
									setSolutions(value);
									track('toggle_solutions', { tool: 'sopa', value });
								}}
							/>
							<Check label="Campos nombre y fecha" checked={showName} onChange={setShowName} />
							<Check
								label="Palabras diagonales inversas"
								checked={reverseDiagonals}
								onChange={setReverseDiagonals}
							/>
						</div>

						<button
							type="button"
							class="mt-4 flex w-full items-center justify-center gap-2 rounded-control border border-borde px-3 py-2.5 text-sm font-semibold text-azul hover:border-celeste"
							onClick={another}
						>
							<span aria-hidden="true">↻</span>
							Generar otra
						</button>
						{result && result.omitted.length > 0 && (
							<p class="no-print mt-3 text-sm leading-relaxed text-muted" role="status">
								No entraron:{' '}
								{result.omitted
									.map((item) =>
										item.reason === 'larga' ? `${item.word} (más larga que la grilla)` : item.word,
									)
									.join(', ')}
								. Probá un tamaño mayor o generá otra.
							</p>
						)}
					</div>
				</aside>

				<div class="min-w-0">
					<div class="no-print mb-4 hidden justify-center gap-3 xl:flex">
						<PrintButtons hint={pdfHint} onPrint={() => printSheet(false)} onPdf={() => printSheet(true)} />
					</div>
					<div class="rounded-card bg-celeste-50 p-3 sm:p-5">
						{result ? (
							<div class="space-y-8">
								<PreviewFrame>
									<Sheet
										title={title.trim() || 'Sopa de letras'}
										instruction={instruction}
										grid={result.grid}
										words={placed}
										uppercase={uppercase}
										showName={showName}
										solution={false}
										placements={result.placements}
									/>
								</PreviewFrame>
								{solutions && (
									<PreviewFrame solution>
										<Sheet
											title={`${title.trim() || 'Sopa de letras'} · Soluciones`}
											instruction={instruction}
											grid={result.grid}
											words={placed}
											uppercase={uppercase}
											showName={false}
											solution
											placements={result.placements}
										/>
									</PreviewFrame>
								)}
							</div>
						) : (
							<p class="py-16 text-center text-sm text-muted">Armando la ficha…</p>
						)}
					</div>
				</div>
			</div>

			<div
				ref={barra}
				class="barra-fija no-print fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t border-borde bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] xl:hidden"
			>
				<PrintButtons hint={pdfHint} onPrint={() => printSheet(false)} onPdf={() => printSheet(true)} />
			</div>
		</div>
	);
}

function instructionFor(count: number, tema: string): string {
	if (count === 1) return `Encontrá la palabra relacionada con ${tema}.`;
	return `Encontrá las ${count} palabras relacionadas con ${tema}.`;
}

function formatText(value: string, uppercase: boolean): string {
	return uppercase ? value.toLocaleUpperCase('es-AR') : value.toLocaleLowerCase('es-AR');
}

function Check({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<label class="flex items-center gap-2">
			<input
				type="checkbox"
				class="size-4 accent-celeste"
				checked={checked}
				onChange={(event) => onChange(event.currentTarget.checked)}
			/>
			{label}
		</label>
	);
}

function PrintButtons({
	hint,
	onPrint,
	onPdf,
}: {
	hint: boolean;
	onPrint: () => void;
	onPdf: () => void;
}) {
	return (
		<>
			<button
				type="button"
				class="inline-flex min-h-11 items-center gap-2 rounded-control border border-borde bg-white px-4 py-2.5 text-sm font-semibold text-azul shadow-sm"
				onClick={onPrint}
			>
				<span aria-hidden="true">⎙</span>
				Imprimir
			</button>
			<div class="relative">
				{hint && (
					<p
						role="status"
						class="absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[min(14rem,calc(100vw-2rem))] -translate-x-1/2 rounded-control bg-azul px-3 py-2 text-center text-xs font-medium text-white"
					>
						Elegí “Guardar como PDF” como destino.
					</p>
				)}
				<button
					type="button"
					class="inline-flex min-h-11 items-center gap-2 rounded-control bg-sol px-4 py-2.5 text-sm font-semibold text-azul shadow-sm"
					onClick={onPdf}
				>
					<span aria-hidden="true">⬇</span>
					Descargar PDF
				</button>
			</div>
		</>
	);
}

function Sheet({
	title,
	instruction,
	grid,
	words,
	uppercase,
	showName,
	solution,
	placements,
}: {
	title: string;
	instruction: string;
	grid: string[][];
	words: string[];
	uppercase: boolean;
	showName: boolean;
	solution: boolean;
	placements: Placement[];
}) {
	const size = grid.length;

	return (
		<div>
			{showName && (
				<div class="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 text-[13px]">
					<p class="min-w-0">Nombre: ______________________________</p>
					<p class="min-w-0">Fecha: ___/___/______</p>
				</div>
			)}
			<h2 class="text-center text-[22px] font-bold leading-tight">{title}</h2>
			<p class="mt-1 text-center text-[13px] text-texto">{instruction}</p>
			<div class="mx-auto mt-4 w-full max-w-[min(100%,170mm)]">
				<svg viewBox={`0 0 ${size} ${size}`} class="h-auto w-full" role="img" aria-label="Grilla de la sopa de letras">
					<rect width={size} height={size} fill="#ffffff" />
					{solution &&
						placements.map((placement) => (
							<line
								key={`${placement.word}-${placement.row}-${placement.col}`}
								x1={placement.col + 0.5}
								y1={placement.row + 0.5}
								x2={placement.col + placement.dc * (placement.word.length - 1) + 0.5}
								y2={placement.row + placement.dr * (placement.word.length - 1) + 0.5}
								stroke="#4aa3df"
								stroke-opacity="0.45"
								stroke-width="0.78"
								stroke-linecap="round"
							/>
						))}
					{Array.from({ length: size + 1 }, (_, index) => (
						<g key={index}>
							<line x1={index} y1="0" x2={index} y2={size} stroke="#1d3557" stroke-width="0.025" />
							<line x1="0" y1={index} x2={size} y2={index} stroke="#1d3557" stroke-width="0.025" />
						</g>
					))}
					{grid.flatMap((row, rowIndex) =>
						row.map((letter, colIndex) => (
							<text
								key={`${rowIndex}-${colIndex}`}
								x={colIndex + 0.5}
								y={rowIndex + 0.68}
								text-anchor="middle"
								font-size="0.5"
								font-family="Inter, system-ui, sans-serif"
								font-weight="600"
								fill="#1d3557"
							>
								{formatText(letter, uppercase)}
							</text>
						)),
					)}
				</svg>
			</div>
			<ul class="mt-4 grid grid-cols-3 gap-x-3 gap-y-1.5 text-[12px]">
				{words.map((word) => (
					<li key={word} class="flex min-w-0 items-start gap-1.5">
						<span class="mt-0.5 inline-block size-3 shrink-0 border border-azul" aria-hidden="true" />
						<span class="min-w-0 break-words">{formatText(word, uppercase)}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
