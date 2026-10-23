import { useEffect, useMemo, useState } from 'preact/hooks';
import frases from '../data/frases.json';
import { track } from '../lib/analytics';
import { altoDeRenglon, altoDeX, lineasDePauta, muestraTexto, type ModoCaligrafia, type Pauta, type TipoPauta } from '../lib/handwriting';
import { MarcoGenerador, NombreFecha, PreviewFrame, escribirUrl, useImprimir, useSemilla } from './preview';

interface Props {
	initialSeed: number | null;
}

export default function CaligrafiaGenerator({ initialSeed }: Props) {
	const { seed, ready } = useSemilla(initialSeed);
	const [letra, setLetra] = useState<'cursiva' | 'imprenta'>('cursiva');
	const [fraseId, setFraseId] = useState(frases[0]?.id ?? '');
	const [propia, setPropia] = useState(false);
	const [texto, setTexto] = useState(frases[0]?.texto ?? '');
	const [pauta, setPauta] = useState<Pauta>('media');
	const [modo, setModo] = useState<ModoCaligrafia>('mixto');
	const [tipo, setTipo] = useState<TipoPauta>('doble');
	const [renglones, setRenglones] = useState(6);
	const [titulo, setTitulo] = useState('Caligrafía');
	const [nombre, setNombre] = useState(true);
	const { pdfHint, imprimir } = useImprimir(titulo);

	useEffect(() => {
		if (!ready) return;
		try {
			const guardado = localStorage.getItem('fp-caligrafia');
			if (!guardado) return;
			const prefs = JSON.parse(guardado) as { letra?: 'cursiva' | 'imprenta'; pauta?: Pauta; modo?: ModoCaligrafia; tipo?: TipoPauta };
			if (prefs.letra) setLetra(prefs.letra);
			if (prefs.pauta) setPauta(prefs.pauta);
			if (prefs.modo) setModo(prefs.modo);
			if (prefs.tipo) setTipo(prefs.tipo);
		} catch {
			/* sigue con la pauta inicial */
		}
	}, [ready]);

	useEffect(() => {
		if (!ready) return;
		escribirUrl(seed, {});
		localStorage.setItem('fp-caligrafia', JSON.stringify({ letra, pauta, modo, tipo }));
	}, [ready, seed, letra, pauta, modo, tipo]);

	const frase = useMemo(() => (propia ? texto : (frases.find((item) => item.id === fraseId)?.texto ?? texto)), [propia, texto, fraseId]);
	const origen = frases.find((item) => item.id === fraseId)?.origen;

	return (
		<MarcoGenerador
			pdfHint={pdfHint}
			onPrint={() => {
				track('print_click', { tool: 'caligrafia' });
				imprimir(false);
			}}
			onPdf={() => {
				track('pdf_click', { tool: 'caligrafia' });
				imprimir(true);
			}}
			opciones={
				<>
					<p class="text-sm font-medium text-azul">Tipo de letra</p>
					<div class="mt-1.5 grid grid-cols-2 gap-1 rounded-control border border-borde p-1">
						<button type="button" class={letra === 'cursiva' ? 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white' : 'rounded-md px-2 py-1.5 text-sm'} aria-pressed={letra === 'cursiva'} onClick={() => setLetra('cursiva')}>
							Cursiva
						</button>
						<button type="button" class={letra === 'imprenta' ? 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white' : 'rounded-md px-2 py-1.5 text-sm'} aria-pressed={letra === 'imprenta'} onClick={() => setLetra('imprenta')}>
							Imprenta
						</button>
					</div>
					<label class="mt-4 block text-sm font-medium text-azul" for="frase">
						Frase
					</label>
					<select
						id="frase"
						class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
						value={propia ? 'propia' : fraseId}
						onChange={(event) => {
							const valor = event.currentTarget.value;
							if (valor === 'propia') {
								setPropia(true);
								return;
							}
							setPropia(false);
							setFraseId(valor);
							setTexto(frases.find((item) => item.id === valor)?.texto ?? '');
						}}
					>
						{frases.map((item) => (
							<option key={item.id} value={item.id}>
								{item.texto.slice(0, 42)}
							</option>
						))}
						<option value="propia">Texto propio</option>
					</select>
					{propia && (
						<textarea
							class="mt-2 w-full rounded-control border border-borde px-3 py-2 text-sm"
							rows={3}
							value={texto}
							onInput={(event) => setTexto(event.currentTarget.value)}
						/>
					)}
					{!propia && origen && <p class="mt-2 text-xs leading-relaxed text-muted">{origen}</p>}
					<label class="mt-4 block text-sm font-medium text-azul" for="pauta">
						Tamaño de pauta
					</label>
					<select id="pauta" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={pauta} onChange={(event) => setPauta(event.currentTarget.value as Pauta)}>
						<option value="grande">Grande</option>
						<option value="media">Media</option>
						<option value="chica">Chica</option>
					</select>
					<label class="mt-4 block text-sm font-medium text-azul" for="modo">
						Modo
					</label>
					<select id="modo" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={modo} onChange={(event) => setModo(event.currentTarget.value as ModoCaligrafia)}>
						<option value="calcar">Calcar</option>
						<option value="copiar">Copiar</option>
						<option value="mixto">Mixto</option>
					</select>
					<label class="mt-4 block text-sm font-medium text-azul" for="tipo-pauta">
						Pauta
					</label>
					<select id="tipo-pauta" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={tipo} onChange={(event) => setTipo(event.currentTarget.value as TipoPauta)}>
						<option value="simple">Simple</option>
						<option value="doble">Doble</option>
					</select>
					<label class="mt-4 block text-sm font-medium text-azul" for="renglones">
						Renglones: {renglones}
					</label>
					<input id="renglones" type="range" min={4} max={12} value={renglones} class="mt-1.5 w-full" onChange={(event) => setRenglones(Number(event.currentTarget.value))} />
					<label class="mt-4 block text-sm font-medium text-azul" for="titulo-cali">
						Título
					</label>
					<input id="titulo-cali" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={titulo} onInput={(event) => setTitulo(event.currentTarget.value)} />
					<label class="mt-3 flex items-center gap-2 text-sm">
						<input type="checkbox" checked={nombre} onChange={(event) => setNombre(event.currentTarget.checked)} />
						Campos nombre y fecha
					</label>
				</>
			}
			vista={
				<PreviewFrame>
					<PautaHoja titulo={titulo} frase={frase} letra={letra} pauta={pauta} modo={modo} tipo={tipo} renglones={renglones} nombre={nombre} />
				</PreviewFrame>
			}
		/>
	);
}

function PautaHoja({
	titulo,
	frase,
	letra,
	pauta,
	modo,
	tipo,
	renglones,
	nombre,
}: {
	titulo: string;
	frase: string;
	letra: 'cursiva' | 'imprenta';
	pauta: Pauta;
	modo: ModoCaligrafia;
	tipo: TipoPauta;
	renglones: number;
	nombre: boolean;
}) {
	const x = altoDeX(pauta);
	const alto = altoDeRenglon(tipo, x);
	const ancho = 680;
	const lineas = lineasDePauta(tipo, x);
	const familia = letra === 'cursiva' ? 'Playwrite AR' : 'Andika';

	return (
		<div>
			{nombre && <NombreFecha />}
			<h2 class="text-center text-[22px] font-bold">{titulo.trim() || 'Caligrafía'}</h2>
			<p class="mt-1 text-center text-[13px]">{modo === 'copiar' ? 'Copiá la frase en cada renglón.' : 'Seguí el trazo gris o copiá el renglón vacío.'}</p>
			<svg viewBox={`0 0 ${ancho} ${alto * renglones + 8}`} class="mt-4 h-auto w-full" role="img" aria-label="Pauta de caligrafía">
				<line x1="24" y1="0" x2="24" y2={alto * renglones} stroke="#d64545" stroke-width="1.2" />
				{Array.from({ length: renglones }, (_, renglon) => {
					const base = renglon * alto;
					return (
						<g key={renglon}>
							{lineas.map((linea) => (
								<line key={linea} x1="32" y1={base + linea} x2={ancho - 8} y2={base + linea} stroke={linea === lineas[1] || linea === lineas[2] ? '#9aa4b2' : '#d5dbe3'} stroke-width="1" />
							))}
							{muestraTexto(modo, renglon) && (
								<text x="36" y={base + (lineas[1] ?? x)} fill="#c9ced6" font-family={`${familia}, sans-serif`} font-size={x * 1.35}>
									{frase}
								</text>
							)}
						</g>
					);
				})}
			</svg>
		</div>
	);
}
