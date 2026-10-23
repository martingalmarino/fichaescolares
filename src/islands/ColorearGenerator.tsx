import { useEffect, useState } from 'preact/hooks';
import { track } from '../lib/analytics';
import { MarcoGenerador, NombreFecha, PreviewFrame, escribirUrl, useImprimir, useSemilla } from './preview';
import { TrazoLamina, laminas, type LaminaId } from './trazos';

interface Props {
	initialSeed: number | null;
	initialLamina: string | null;
}

export default function ColorearGenerator({ initialSeed, initialLamina }: Props) {
	const { seed, ready } = useSemilla(initialSeed);
	const inicial = laminas.some((item) => item.id === initialLamina) ? (initialLamina as LaminaId) : 'escarapela';
	const [lamina, setLamina] = useState<LaminaId>(inicial);
	const [titulo, setTitulo] = useState('Lámina para colorear');
	const [grosor, setGrosor] = useState(1.6);
	const [renglones, setRenglones] = useState(3);
	const [nombre, setNombre] = useState(true);
	const { pdfHint, imprimir } = useImprimir(titulo);

	useEffect(() => {
		if (!ready) return;
		const params = new URLSearchParams(window.location.search);
		const desde = params.get('l');
		if (laminas.some((item) => item.id === desde)) setLamina(desde as LaminaId);
		escribirUrl(seed, { l: lamina });
	}, [ready, seed, lamina]);

	return (
		<MarcoGenerador
			pdfHint={pdfHint}
			onPrint={() => {
				track('print_click', { tool: 'laminas' });
				imprimir(false);
			}}
			onPdf={() => {
				track('pdf_click', { tool: 'laminas' });
				imprimir(true);
			}}
			opciones={
				<>
					<label class="block text-sm font-medium text-azul" for="lamina">
						Lámina
					</label>
					<select id="lamina" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={lamina} onChange={(event) => setLamina(event.currentTarget.value as LaminaId)}>
						{laminas.map((item) => (
							<option key={item.id} value={item.id}>
								{item.nombre}
							</option>
						))}
					</select>
					<label class="mt-4 block text-sm font-medium text-azul" for="titulo-lamina">
						Título
					</label>
					<input id="titulo-lamina" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={titulo} onInput={(event) => setTitulo(event.currentTarget.value)} />
					<label class="mt-4 block text-sm font-medium text-azul" for="grosor">
						Grosor de línea
					</label>
					<input id="grosor" type="range" min={1} max={3} step={0.4} value={grosor} class="mt-1.5 w-full" onChange={(event) => setGrosor(Number(event.currentTarget.value))} />
					<label class="mt-4 block text-sm font-medium text-azul" for="lineas">
						Renglones para escribir: {renglones}
					</label>
					<input id="lineas" type="range" min={0} max={6} value={renglones} class="mt-1.5 w-full" onChange={(event) => setRenglones(Number(event.currentTarget.value))} />
					<label class="mt-3 flex items-center gap-2 text-sm">
						<input type="checkbox" checked={nombre} onChange={(event) => setNombre(event.currentTarget.checked)} />
						Campos nombre y fecha
					</label>
				</>
			}
			vista={
				<PreviewFrame>
					<div>
						{nombre && <NombreFecha />}
						<h2 class="text-center text-[22px] font-bold">{titulo.trim() || 'Lámina'}</h2>
						<svg viewBox="0 0 160 150" class="mx-auto mt-4 h-auto w-full max-w-[150mm]" role="img" aria-label={titulo}>
							<TrazoLamina id={lamina} grosor={grosor} />
						</svg>
						<div class="mt-6 space-y-4">
							{Array.from({ length: renglones }, (_, index) => (
								<div key={index} class="border-b border-azul/40" />
							))}
						</div>
					</div>
				</PreviewFrame>
			}
		/>
	);
}
