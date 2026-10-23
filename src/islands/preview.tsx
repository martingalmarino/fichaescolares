import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren, RefObject } from 'preact';

/** Publica la altura de la barra fija para que el contenido y el aviso queden por encima. */
export function useBarraFija(ref: RefObject<HTMLDivElement>) {
	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		const aplicar = () => {
			if (getComputedStyle(element).display === 'none') {
				document.documentElement.style.setProperty('--fp-barra', '0px');
				return;
			}
			const alto = element.getBoundingClientRect().height;
			if (alto > 0) document.documentElement.style.setProperty('--fp-barra', `${alto}px`);
		};
		aplicar();
		const observer = new ResizeObserver(aplicar);
		observer.observe(element);
		return () => {
			observer.disconnect();
			document.documentElement.style.removeProperty('--fp-barra');
		};
	}, [ref]);
}

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
		<div class="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 text-[13px]">
			<p class="min-w-0">Nombre: ______________________________</p>
			<p class="min-w-0">Fecha: ___/___/______</p>
		</div>
	);
}

export function PieHoja() {
	return <p class="pie-hoja">aulita.com.ar</p>;
}

export function PreviewFrame({ children, solution = false, className = '' }: { children: ComponentChildren; solution?: boolean; className?: string }) {
	return (
		<div class="preview-frame w-full min-w-0">
			<div class={`a4 flex flex-col bg-white text-azul shadow-card ${solution ? 'solutions' : ''} ${className}`}>
				<div class="min-h-0 flex-1">{children}</div>
				<PieHoja />
			</div>
		</div>
	);
}

function Botones({ hint, onPrint, onPdf }: { hint: boolean; onPrint: () => void; onPdf: () => void }) {
	return (
		<>
			<button
				type="button"
				class="inline-flex min-h-11 items-center gap-2 rounded-control border border-borde bg-white px-4 py-2.5 text-sm font-semibold text-azul"
				onClick={onPrint}
			>
				<span aria-hidden="true">🖨</span>
				Imprimir
			</button>
			<div class="relative">
				<button
					type="button"
					class="inline-flex min-h-11 items-center gap-2 rounded-control bg-sol px-4 py-2.5 text-sm font-semibold text-azul shadow-sm"
					onClick={onPdf}
				>
					<span aria-hidden="true">⬇</span>
					Descargar PDF
				</button>
				{hint && (
					<p class="absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[min(14rem,calc(100vw-2rem))] -translate-x-1/2 rounded-control bg-azul px-3 py-2 text-center text-xs text-white">
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
	const barra = useRef<HTMLDivElement>(null);
	useBarraFija(barra);

	return (
		<div>
			<div class="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
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
					</div>
				</aside>
				<div class="min-w-0">
					<div class="no-print mb-4 hidden justify-center gap-3 xl:flex">
						<Botones hint={pdfHint} onPrint={onPrint} onPdf={onPdf} />
					</div>
					<div class="rounded-card bg-celeste-50 p-3 sm:p-5">{vista}</div>
				</div>
			</div>
			<div
				ref={barra}
				class="barra-fija no-print fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t border-borde bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] xl:hidden"
			>
				<Botones hint={pdfHint} onPrint={onPrint} onPdf={onPdf} />
			</div>
		</div>
	);
}
