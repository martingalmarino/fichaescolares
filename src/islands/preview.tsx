import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

const A4_WIDTH_PX = (210 * 96) / 25.4;

export function useSemilla(initial: number | null) {
	const [seed, setSeed] = useState<number | null>(initial);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const fromUrl = params.get('s');
		if (fromUrl && /^\d+$/.test(fromUrl)) setSeed(Number(fromUrl) >>> 0);
		else if (initial === null) {
			const bytes = new Uint32Array(1);
			crypto.getRandomValues(bytes);
			setSeed(bytes[0] ?? 1);
		}
		setReady(true);
	}, [initial]);

	return { seed: seed ?? 1, ready, setSeed };
}

export function escribirUrl(seed: number, extras: Record<string, string | null>) {
	const url = new URL(window.location.href);
	url.searchParams.set('s', String(seed >>> 0));
	for (const [clave, valor] of Object.entries(extras)) {
		if (valor) url.searchParams.set(clave, valor);
		else url.searchParams.delete(clave);
	}
	history.replaceState(null, '', `${url.pathname}${url.search}`);
}

export function nuevaSemilla(): number {
	const bytes = new Uint32Array(1);
	crypto.getRandomValues(bytes);
	return bytes[0] ?? 1;
}

export function useImprimir(titulo: string) {
	const [pdfHint, setPdfHint] = useState(false);

	function imprimir(desdePdf: boolean) {
		const anterior = document.title;
		document.title = titulo.trim() || anterior;
		const restaurar = () => {
			document.title = anterior;
			window.removeEventListener('afterprint', restaurar);
		};
		window.addEventListener('afterprint', restaurar);
		if (!desdePdf) {
			window.print();
			return;
		}
		setPdfHint(true);
		window.setTimeout(() => window.print(), 700);
		window.setTimeout(() => setPdfHint(false), 4000);
	}

	return { pdfHint, imprimir };
}

export function NombreFecha() {
	return (
		<div class="mb-4 flex items-end justify-between gap-4 text-[13px]">
			<p>Nombre: ______________________________</p>
			<p>Fecha: ___/___/______</p>
		</div>
	);
}

export function PreviewFrame({ children, solution = false }: { children: ComponentChildren; solution?: boolean }) {
	const frame = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const element = frame.current;
		if (!element) return;
		const update = () => {
			const next = Math.min(1, element.clientWidth / A4_WIDTH_PX);
			setScale(next > 0 ? next : 1);
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={frame} class="w-full">
			<div class="preview-slot relative overflow-hidden" style={{ height: `${297 * scale}mm` }}>
				<div
					class={`a4 absolute left-0 top-0 bg-white text-azul shadow-card ${solution ? 'solutions' : ''}`}
					style={{
						width: '210mm',
						minHeight: '297mm',
						padding: '10mm',
						transform: `scale(${scale})`,
						transformOrigin: 'top left',
					}}
				>
					{children}
				</div>
			</div>
		</div>
	);
}

function Botones({ hint, onPrint, onPdf }: { hint: boolean; onPrint: () => void; onPdf: () => void }) {
	return (
		<>
			<button
				type="button"
				class="inline-flex items-center gap-2 rounded-control border border-borde bg-white px-4 py-2.5 text-sm font-semibold text-azul"
				onClick={onPrint}
			>
				<span aria-hidden="true">🖨</span>
				Imprimir
			</button>
			<div class="relative">
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-control bg-sol px-4 py-2.5 text-sm font-semibold text-azul shadow-sm"
					onClick={onPdf}
				>
					<span aria-hidden="true">⬇</span>
					Descargar PDF
				</button>
				{hint && (
					<p class="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-control bg-azul px-3 py-2 text-center text-xs text-white">
						Elegí “Guardar como PDF” como destino
					</p>
				)}
			</div>
		</>
	);
}

export function MarcoGenerador({
	opciones,
	vista,
	pdfHint,
	onPrint,
	onPdf,
}: {
	opciones: ComponentChildren;
	vista: ComponentChildren;
	pdfHint: boolean;
	onPrint: () => void;
	onPdf: () => void;
}) {
	const [abierto, setAbierto] = useState(true);

	return (
		<div class="pb-24 xl:pb-0">
			<div class="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)_160px]">
				<aside class="panel rounded-card border border-borde bg-white p-4 shadow-card">
					<button
						type="button"
						class="flex w-full items-center justify-between text-left text-sm font-semibold text-azul xl:hidden"
						aria-expanded={abierto}
						onClick={() => setAbierto((valor) => !valor)}
					>
						Opciones
						<span aria-hidden="true">{abierto ? '−' : '+'}</span>
					</button>
					<div class={abierto ? 'mt-4 block xl:mt-0' : 'mt-4 hidden xl:block'}>
						{opciones}
						<div
							class="ad no-print mt-4 flex h-[250px] w-full items-center justify-center rounded-card border border-dashed border-borde bg-[#f3f5f7] text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted"
							role="complementary"
							aria-label="Espacio publicitario"
						>
							Publicidad · 300×250
						</div>
					</div>
				</aside>
				<div class="min-w-0">
					<div class="no-print mb-4 hidden justify-center gap-3 xl:flex">
						<Botones hint={pdfHint} onPrint={onPrint} onPdf={onPdf} />
					</div>
					<div class="rounded-card bg-celeste-50 p-3 sm:p-5">{vista}</div>
				</div>
				<div
					class="ad no-print hidden h-[600px] w-[160px] shrink-0 items-center justify-center rounded-card border border-dashed border-borde bg-[#f3f5f7] text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted xl:flex"
					role="complementary"
					aria-label="Espacio publicitario"
				>
					Publicidad · 160×600
				</div>
			</div>
			<div class="no-print fixed inset-x-0 bottom-0 z-20 flex justify-center gap-3 border-t border-borde bg-white p-3 xl:hidden">
				<Botones hint={pdfHint} onPrint={onPrint} onPdf={onPdf} />
			</div>
		</div>
	);
}
