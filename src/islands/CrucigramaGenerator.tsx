import { useEffect, useMemo, useState } from 'preact/hooks';
import proceresData from '../data/proceres.json';
import { efemerides, tieneFicha } from '../data/efemerides';
import { track } from '../lib/analytics';
import { createCrossword, type PlacedWord } from '../lib/crossword';
import { normalizeWord } from '../lib/normalize';
import { MarcoGenerador, NombreFecha, PreviewFrame, escribirUrl, nuevaSemilla, useImprimir, useSemilla } from './preview';

interface Procer {
	slug: string;
	nombre: string;
	pistas: string[];
	palabras: string[];
}

const proceres = proceresData as Procer[];
const fechasConFicha = efemerides.filter(tieneFicha);

interface Props {
	initialSeed: number | null;
	initialSlug: string | null;
}

function entradasDe(slugs: string[], cantidad: number) {
	const vistos = new Set<string>();
	const entradas: { word: string; label: string; clue: string }[] = [];
	for (const procer of proceres) {
		if (!slugs.includes(procer.slug)) continue;
		procer.palabras.forEach((palabra, index) => {
			const word = normalizeWord(palabra);
			const clue = procer.pistas[index];
			if (!clue || word.length < 2 || vistos.has(word)) return;
			vistos.add(word);
			entradas.push({ word, label: palabra, clue });
		});
	}
	return entradas.sort((a, b) => b.word.length - a.word.length || a.word.localeCompare(b.word, 'es')).slice(0, cantidad);
}

export default function CrucigramaGenerator({ initialSeed, initialSlug }: Props) {
	const { seed, ready, setSeed } = useSemilla(initialSeed);
	const [slug, setSlug] = useState(fechasConFicha.some((item) => item.slug === initialSlug) ? (initialSlug ?? '') : '');
	const [elegidos, setElegidos] = useState<string[]>(['jose-de-san-martin', 'manuel-belgrano', 'domingo-faustino-sarmiento']);
	const [cantidad, setCantidad] = useState(8);
	const [titulo, setTitulo] = useState('Crucigrama de próceres');
	const [banco, setBanco] = useState(false);
	const [soluciones, setSoluciones] = useState(true);
	const [nombre, setNombre] = useState(true);

	useEffect(() => {
		if (!ready) return;
		const params = new URLSearchParams(window.location.search);
		const desdeUrl = params.get('e');
		if (desdeUrl && fechasConFicha.some((item) => item.slug === desdeUrl)) {
			const fecha = fechasConFicha.find((item) => item.slug === desdeUrl);
			setSlug(desdeUrl);
			if (fecha && fecha.proceres.length > 0) setElegidos(fecha.proceres);
		}
		try {
			const guardado = localStorage.getItem('fp-crucigrama');
			if (guardado && !desdeUrl) {
				const prefs = JSON.parse(guardado) as { elegidos?: string[]; cantidad?: number; banco?: boolean };
				if (prefs.elegidos?.length) setElegidos(prefs.elegidos);
				if (prefs.cantidad) setCantidad(prefs.cantidad);
				if (typeof prefs.banco === 'boolean') setBanco(prefs.banco);
			}
		} catch {
			/* la ficha sigue con los valores iniciales */
		}
	}, [ready]);

	useEffect(() => {
		if (!ready) return;
		escribirUrl(seed, { e: slug || null });
		localStorage.setItem('fp-crucigrama', JSON.stringify({ elegidos, cantidad, banco }));
	}, [ready, seed, slug, elegidos, cantidad, banco]);

	const entradas = useMemo(() => entradasDe(elegidos, cantidad), [elegidos, cantidad]);
	const resultado = useMemo(
		() => createCrossword(entradas.map((item) => ({ word: item.word, clue: item.clue })), seed),
		[entradas, seed],
	);
	const { pdfHint, imprimir } = useImprimir(titulo);

	function elegirFecha(valor: string) {
		const anterior = slug;
		setSlug(valor);
		const fecha = fechasConFicha.find((item) => item.slug === valor);
		if (fecha && fecha.proceres.length > 0) setElegidos(fecha.proceres);
		track('select_efemeride', { slug: valor, from: 'crucigrama', anterior });
	}

	function alternar(id: string) {
		setElegidos((actual) => (actual.includes(id) ? actual.filter((item) => item !== id) : [...actual, id]));
	}

	return (
		<MarcoGenerador
			pdfHint={pdfHint}
			onPrint={() => {
				track('print_click', { tool: 'crucigrama' });
				imprimir(false);
			}}
			onPdf={() => {
				track('pdf_click', { tool: 'crucigrama' });
				imprimir(true);
			}}
			opciones={
				<>
					<label class="block text-sm font-medium text-azul" for="efemeride-cruz">
						Efeméride
					</label>
					<select
						id="efemeride-cruz"
						class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
						value={slug}
						onChange={(event) => elegirFecha(event.currentTarget.value)}
					>
						<option value="">Elegir próceres a mano</option>
						{fechasConFicha.map((item) => (
							<option key={item.slug} value={item.slug}>
								{item.nombre}
							</option>
						))}
					</select>
					<fieldset class="mt-4">
						<legend class="text-sm font-medium text-azul">Próceres</legend>
						<div class="mt-2 max-h-40 space-y-1 overflow-auto pr-1">
							{proceres.map((procer) => (
								<label key={procer.slug} class="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={elegidos.includes(procer.slug)}
										onChange={() => alternar(procer.slug)}
									/>
									{procer.nombre}
								</label>
							))}
						</div>
					</fieldset>
					<label class="mt-4 block text-sm font-medium text-azul" for="cantidad">
						Cantidad de palabras
					</label>
					<input
						id="cantidad"
						class="mt-1.5 w-full"
						type="range"
						min={6}
						max={12}
						value={cantidad}
						onChange={(event) => setCantidad(Number(event.currentTarget.value))}
					/>
					<p class="text-xs text-muted">{cantidad} palabras como máximo</p>
					<label class="mt-4 block text-sm font-medium text-azul" for="titulo-cruz">
						Título
					</label>
					<input
						id="titulo-cruz"
						class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm"
						value={titulo}
						onInput={(event) => setTitulo(event.currentTarget.value)}
					/>
					<div class="mt-4 grid grid-cols-2 gap-1 rounded-control border border-borde p-1">
						<button
							type="button"
							class={banco ? 'rounded-md px-2 py-1.5 text-sm' : 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white'}
							aria-pressed={!banco}
							onClick={() => setBanco(false)}
						>
							Pistas
						</button>
						<button
							type="button"
							class={banco ? 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white' : 'rounded-md px-2 py-1.5 text-sm'}
							aria-pressed={banco}
							onClick={() => setBanco(true)}
						>
							Banco
						</button>
					</div>
					<label class="mt-4 flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={soluciones}
							onChange={(event) => {
								setSoluciones(event.currentTarget.checked);
								track('toggle_solutions', { tool: 'crucigrama', value: event.currentTarget.checked });
							}}
						/>
						Incluir hoja de soluciones
					</label>
					<label class="mt-2 flex items-center gap-2 text-sm">
						<input type="checkbox" checked={nombre} onChange={(event) => setNombre(event.currentTarget.checked)} />
						Campos nombre y fecha
					</label>
					<button
						type="button"
						class="mt-4 flex w-full items-center justify-center gap-2 rounded-control border border-borde px-3 py-2.5 text-sm font-semibold text-azul"
						onClick={() => {
							setSeed(nuevaSemilla());
							track('regenerate', { tool: 'crucigrama' });
						}}
					>
						Generar otra
					</button>
					{resultado.omitted.length > 0 && (
						<p class="mt-3 text-sm text-muted" role="status">
							No entraron: {resultado.omitted.map((item) => item.word).join(', ')}.
						</p>
					)}
				</>
			}
			vista={
				resultado.placements.length > 0 ? (
					<div class="space-y-8">
						<PreviewFrame>
							<Hoja titulo={titulo} nombre={nombre} resultado={resultado} banco={banco} entradas={entradas} solucion={false} />
						</PreviewFrame>
						{soluciones && (
							<PreviewFrame solution>
								<Hoja
									titulo={`${titulo} · Soluciones`}
									nombre={false}
									resultado={resultado}
									banco={banco}
									entradas={entradas}
									solucion
								/>
							</PreviewFrame>
						)}
					</div>
				) : (
					<p class="py-16 text-center text-sm text-muted">Elegí al menos dos palabras que compartan una letra.</p>
				)
			}
		/>
	);
}

function Hoja({
	titulo,
	nombre,
	resultado,
	banco,
	entradas,
	solucion,
}: {
	titulo: string;
	nombre: boolean;
	resultado: ReturnType<typeof createCrossword>;
	banco: boolean;
	entradas: { word: string; label: string }[];
	solucion: boolean;
}) {
	const filas = resultado.grid.length;
	const columnas = resultado.grid[0]?.length ?? 0;
	const etiquetas = new Map(entradas.map((item) => [item.word, item.label]));

	return (
		<div>
			{nombre && <NombreFecha />}
			<h2 class="text-center text-[22px] font-bold">{titulo.trim() || 'Crucigrama'}</h2>
			<p class="mt-1 text-center text-[13px]">Completá con las pistas. Una letra por casillero.</p>
			<svg viewBox={`0 0 ${columnas} ${filas}`} class="mx-auto mt-4 block h-auto w-full max-w-[min(100%,170mm)]" role="img" aria-label="Crucigrama">
				{resultado.grid.flatMap((fila, row) =>
					fila.map((letra, col) => {
						if (!letra) {
							return <rect key={`${row}-${col}`} x={col} y={row} width="1" height="1" fill="#1d3557" />;
						}
						const numero = resultado.placements.find((item) => item.row === row && item.col === col)?.number;
						return (
							<g key={`${row}-${col}`}>
								<rect x={col} y={row} width="1" height="1" fill="#ffffff" stroke="#1d3557" stroke-width="0.03" />
								{numero ? (
									<text x={col + 0.08} y={row + 0.28} font-size="0.22" fill="#1d3557">
										{numero}
									</text>
								) : null}
								{solucion ? (
									<text x={col + 0.5} y={row + 0.72} text-anchor="middle" font-size="0.5" font-weight="700" fill="#1d3557">
										{letra}
									</text>
								) : null}
							</g>
						);
					}),
				)}
			</svg>
			{banco ? (
				<ul class="mt-4 grid grid-cols-2 gap-1 text-[12px]">
					{resultado.placements.map((item) => (
						<li key={`${item.dir}-${item.word}`}>{etiquetas.get(item.word) ?? item.word}</li>
					))}
				</ul>
			) : (
				<div class="mt-4 grid gap-3 text-[12px] sm:grid-cols-2">
					<Lista titulo="Horizontales" items={resultado.across} />
					<Lista titulo="Verticales" items={resultado.down} />
				</div>
			)}
		</div>
	);
}

function Lista({ titulo, items }: { titulo: string; items: PlacedWord[] }) {
	return (
		<div>
			<h3 class="font-semibold">{titulo}</h3>
			<ol class="mt-1 space-y-1">
				{items.map((item) => (
					<li key={`${item.dir}-${item.number}-${item.word}`}>
						{item.number}. {item.clue}
					</li>
				))}
			</ol>
		</div>
	);
}
