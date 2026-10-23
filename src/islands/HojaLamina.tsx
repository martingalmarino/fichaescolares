import { useEffect, useRef, useState } from 'preact/hooks';
import { track } from '../lib/analytics';
import { NombreFecha, PreviewFrame, useBarraFija, useImprimir } from './preview';

interface Props {
	slug: string;
	categoria: string;
	tituloInicial: string;
	alt: string;
	svg: string;
	ancho: number;
	alto: number;
}

export default function HojaLamina({ slug, categoria, tituloInicial, alt, svg, ancho, alto }: Props) {
	const [titulo, setTitulo] = useState(tituloInicial);
	const [consigna, setConsigna] = useState('Coloreá la lámina y escribí una oración.');
	const [nombre, setNombre] = useState(true);
	const { pdfHint, imprimir } = useImprimir(titulo);
	const barra = useRef<HTMLDivElement>(null);
	useBarraFija(barra);

	useEffect(() => {
		track('lamina_ver', { slug, categoria });
	}, [slug, categoria]);

	function salir(desdePdf: boolean) {
		track('lamina_imprimir', { slug, categoria, con_nombre: nombre });
		imprimir(desdePdf);
	}

	return (
		<div>
			<div class="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
				<label class="flex min-h-11 items-center gap-2 text-sm text-azul">
					<input type="checkbox" checked={nombre} onChange={(event) => setNombre(event.currentTarget.checked)} />
					Nombre y fecha
				</label>
				<div class="hidden gap-3 xl:flex">
					<Botones hint={pdfHint} onPrint={() => salir(false)} onPdf={() => salir(true)} />
				</div>
			</div>
			<div class="rounded-card bg-celeste-50 p-3 sm:p-5">
				<PreviewFrame className="hoja-lamina">
					<div class="flex min-h-[250mm] flex-col">
						{nombre && <NombreFecha />}
						<input
							class="w-full border-0 bg-transparent text-center text-[22px] font-bold text-azul outline-none"
							aria-label="Título de la lámina"
							value={titulo}
							onInput={(event) => setTitulo(event.currentTarget.value)}
						/>
						<textarea
							class="mt-2 w-full resize-none border-0 bg-transparent text-center text-sm leading-relaxed text-azul outline-none"
							aria-label="Consigna de la hoja"
							rows={2}
							value={consigna}
							onInput={(event) => setConsigna(event.currentTarget.value)}
						/>
						<img
							src={svg}
							alt={alt}
							width={ancho}
							height={alto}
							decoding="async"
							class="mx-auto mt-4 h-auto max-h-[190mm] w-full flex-1 object-contain"
							style={`aspect-ratio: ${ancho} / ${alto}`}
						/>
					</div>
				</PreviewFrame>
			</div>
			<div
				ref={barra}
				class="barra-fija no-print print:hidden fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t border-borde bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] xl:hidden"
			>
				<Botones hint={pdfHint} onPrint={() => salir(false)} onPdf={() => salir(true)} />
			</div>
		</div>
	);
}

function Botones({ hint, onPrint, onPdf }: { hint: boolean; onPrint: () => void; onPdf: () => void }) {
	return (
		<>
			<button type="button" class="inline-flex min-h-11 items-center gap-2 rounded-control border border-borde bg-white px-4 py-2.5 text-sm font-semibold text-azul" onClick={onPrint}>
				<span aria-hidden="true">🖨</span>
				Imprimir
			</button>
			<div class="relative">
				<button type="button" class="inline-flex min-h-11 items-center gap-2 rounded-control bg-sol px-4 py-2.5 text-sm font-semibold text-azul shadow-sm" onClick={onPdf}>
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
