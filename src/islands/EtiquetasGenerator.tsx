import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { track } from '../lib/analytics';
import {
	DISENOS,
	MATERIAS,
	TAMANOS,
	borrarEtiquetas,
	guardarEtiquetas,
	hojasDeEtiquetas,
	leerEtiquetas,
	pxDelNombre,
	type DatosEtiqueta,
	type DisenoId,
	type LetraEtiqueta,
	type PresetEtiquetas,
	type TamanoId,
} from '../lib/etiquetas';
import { MarcoGenerador, useImprimir } from './preview';

interface Props {
	preset: PresetEtiquetas;
}

const clienteAnuncio = import.meta.env.PUBLIC_ADSENSE_CLIENT || 'ca-pub-6771833588582297';
const slotAnuncio = import.meta.env.PUBLIC_ADSENSE_SLOT || '';

function AnuncioEtiquetas() {
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		const nodo = ref.current;
		if (!nodo || nodo.dataset.cargado === '1') return;
		nodo.dataset.cargado = '1';
		const anuncio = window as Window & { adsbygoogle?: unknown[] };
		anuncio.adsbygoogle = anuncio.adsbygoogle || [];
		try {
			anuncio.adsbygoogle.push({});
		} catch {
			/* el script todavía no está */
		}
	}, []);

	return (
		<aside class="ad no-print print:hidden mt-6" aria-label="Anuncio">
			<ins
				ref={ref}
				class="adsbygoogle"
				style={{ display: 'block' }}
				data-ad-client={clienteAnuncio}
				data-ad-slot={slotAnuncio || undefined}
				data-ad-format="auto"
				data-full-width-responsive="true"
			/>
		</aside>
	);
}

function BandaGuarda({ arriba, chica }: { arriba: boolean; chica: boolean }) {
	const dientes = chica ? 7 : 12;
	return (
		<div
			aria-hidden="true"
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				height: chica ? '1.8mm' : '4.2mm',
				top: arriba ? 0 : undefined,
				bottom: arriba ? undefined : 0,
				display: 'flex',
			}}
		>
			{Array.from({ length: dientes }, (_, indice) => (
				<span
					key={indice}
					style={{
						flex: 1,
						background: '#1a1a1a',
						clipPath: arriba
							? 'polygon(0 100%, 0 42%, 24% 42%, 24% 0, 76% 0, 76% 42%, 100% 42%, 100% 100%)'
							: 'polygon(0 0, 0 58%, 24% 58%, 24% 100%, 76% 100%, 76% 58%, 100% 58%, 100% 0)',
					}}
				/>
			))}
		</div>
	);
}

function Escarapela({ chica }: { chica: boolean }) {
	const medida = chica ? '8mm' : '16mm';
	return (
		<svg aria-hidden="true" viewBox="0 0 40 40" style={{ width: medida, height: medida, flex: 'none' }}>
			<circle cx="20" cy="20" r="18" fill="#5eb6e4" />
			<circle cx="20" cy="20" r="12" fill="#ffffff" />
			<circle cx="20" cy="20" r="6" fill="#5eb6e4" />
		</svg>
	);
}

function TextoEtiqueta({ item, tamano, letra, color }: { item: DatosEtiqueta; tamano: TamanoId; letra: LetraEtiqueta; color: string }) {
	const spec = TAMANOS[tamano];
	const chica = tamano === 'utiles';
	const nombre = item.nombre || 'Nombre y apellido';
	const base = chica ? 11 : tamano === 'carpeta' ? 22 : 16;
	const margen = chica ? 4 : 12;
	const px = pxDelNombre(nombre, spec.ancho - margen, base, letra === 'cursiva');
	const detalle = [item.grado, item.turno].filter(Boolean).join(' · ');
	return (
		<div
			style={{
				color,
				fontFamily: letra === 'cursiva' ? 'Playwrite AR, cursive' : 'Andika, sans-serif',
				textTransform: letra === 'imprenta' ? 'uppercase' : 'none',
				lineHeight: 1.15,
				minWidth: 0,
			}}
		>
			<p style={{ margin: 0, fontSize: `${px}px`, fontWeight: letra === 'imprenta' ? 700 : 400, opacity: item.nombre ? 1 : 0.45, overflow: 'hidden', whiteSpace: 'nowrap' }}>{nombre}</p>
			{!chica && detalle && <p style={{ margin: '0.6mm 0 0', fontSize: tamano === 'carpeta' ? '12px' : '9px' }}>{detalle}</p>}
			{!chica && item.materia && <p style={{ margin: '0.4mm 0 0', fontSize: tamano === 'carpeta' ? '13px' : '10px', fontWeight: 700 }}>{item.materia}</p>}
			{!chica && item.escuela && <p style={{ margin: '0.4mm 0 0', fontSize: tamano === 'carpeta' ? '11px' : '8px' }}>{item.escuela}</p>}
		</div>
	);
}

function Celda({ item, tamano, diseno, letra }: { item: DatosEtiqueta; tamano: TamanoId; diseno: DisenoId; letra: LetraEtiqueta }) {
	if (item.vacia) return <div />;
	const chica = tamano === 'utiles';
	const color = diseno === 'pizarron' ? '#f7f4ea' : diseno === 'minimal' ? '#111111' : '#1d3557';
	const fondo =
		diseno === 'pizarron'
			? '#1b4332'
			: diseno === 'guarda'
				? '#f6f1e6'
				: diseno === 'cuadricula'
					? undefined
					: '#ffffff';
	const cuadricula =
		diseno === 'cuadricula'
			? {
					backgroundColor: '#ffffff',
					backgroundImage: 'linear-gradient(to right, #c5d8ef 0.2mm, transparent 0.2mm), linear-gradient(to bottom, #c5d8ef 0.2mm, transparent 0.2mm)',
					backgroundSize: chica ? '4mm 4mm' : '5mm 5mm',
				}
			: {};
	return (
		<div
			style={{
				background: fondo,
				boxShadow: diseno === 'pizarron' ? 'inset 0 0 0 1.2mm rgba(255,255,255,0.35)' : diseno === 'minimal' ? 'inset 0 0 0 0.35mm #111' : undefined,
				...cuadricula,
			}}
		>
			{diseno === 'rivadavia' && (
				<>
					<div aria-hidden="true" style={{ position: 'absolute', left: chica ? '2.5mm' : '8mm', top: 0, bottom: 0, width: '0.4mm', background: '#e24b4b' }} />
					{Array.from({ length: chica ? 2 : Math.floor(TAMANOS[tamano].alto / 8) }, (_, indice) => (
						<div
							key={indice}
							aria-hidden="true"
							style={{ position: 'absolute', left: 0, right: 0, top: `${(indice + 1) * (chica ? 5 : 8)}mm`, height: '0.25mm', background: '#7eb6e0' }}
						/>
					))}
				</>
			)}
			{diseno === 'guarda' && (
				<>
					<BandaGuarda arriba chica={chica} />
					<BandaGuarda arriba={false} chica={chica} />
				</>
			)}
			<div
				style={{
					position: 'relative',
					zIndex: 1,
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					gap: chica ? '1mm' : '3mm',
					padding: diseno === 'rivadavia' ? (chica ? '1mm 1.5mm 1mm 5mm' : '3mm 3mm 3mm 12mm') : diseno === 'guarda' ? (chica ? '2.4mm 1.5mm' : '6mm 4mm') : chica ? '1mm 1.5mm' : '3mm 4mm',
				}}
			>
				{diseno === 'escarapela' && <Escarapela chica={chica} />}
				<TextoEtiqueta item={item} tamano={tamano} letra={letra} color={color} />
			</div>
		</div>
	);
}

export default function EtiquetasGenerator({ preset }: Props) {
	const [nombre, setNombre] = useState('');
	const [grado, setGrado] = useState('');
	const [escuela, setEscuela] = useState('');
	const [turno, setTurno] = useState('');
	const [materia, setMateria] = useState('');
	const [materias, setMaterias] = useState<string[]>([]);
	const [porMateria, setPorMateria] = useState(preset === 'cuadernos');
	const [tamano, setTamano] = useState<TamanoId>(preset === 'utiles' ? 'utiles' : 'cuaderno');
	const [diseno, setDiseno] = useState<DisenoId>('rivadavia');
	const [letra, setLetra] = useState<LetraEtiqueta>('imprenta');
	const [recordar, setRecordar] = useState(false);
	const [listo, setListo] = useState(false);
	const [error, setError] = useState('');
	const titulo = nombre.trim() ? `Etiquetas de ${nombre.trim()}` : 'Etiquetas escolares';
	const { pdfHint, imprimir } = useImprimir(titulo);

	useEffect(() => {
		const guardado = leerEtiquetas();
		if (guardado) {
			setNombre(guardado.nombre);
			setGrado(guardado.grado);
			setEscuela(guardado.escuela);
			setTurno(guardado.turno);
			setMateria(guardado.materia);
			setMaterias(guardado.materias);
			setDiseno(guardado.diseno);
			setLetra(guardado.letra);
			setRecordar(true);
			if (preset === 'general') {
				setTamano(guardado.tamano);
				setPorMateria(guardado.porMateria);
			}
		}
		if (preset === 'cuadernos') {
			setTamano('cuaderno');
			setPorMateria(true);
		}
		if (preset === 'utiles') {
			setTamano('utiles');
			setPorMateria(false);
		}
		setListo(true);
	}, [preset]);

	useEffect(() => {
		if (!listo) return;
		if (!recordar) {
			borrarEtiquetas();
			return;
		}
		guardarEtiquetas({ nombre, grado, escuela, turno, materia, materias, porMateria, tamano, diseno, letra });
	}, [listo, recordar, nombre, grado, escuela, turno, materia, materias, porMateria, tamano, diseno, letra]);

	const hojas = useMemo(
		() => hojasDeEtiquetas({ nombre, grado, escuela, turno, materia, materias, porMateria, tamano }),
		[nombre, grado, escuela, turno, materia, materias, porMateria, tamano],
	);
	const spec = TAMANOS[tamano];

	function pedirImpresion(pdf: boolean) {
		if (!nombre.trim()) {
			setError('Escribí el nombre y el apellido para imprimir.');
			document.getElementById('etiqueta-nombre')?.focus();
			return;
		}
		setError('');
		track(pdf ? 'pdf_click' : 'print_click', { tool: 'etiquetas', tamano });
		imprimir(pdf);
	}

	function alternarMateria(item: string) {
		setMaterias((actual) => (actual.includes(item) ? actual.filter((valor) => valor !== item) : [...actual, item]));
	}

	function borrar() {
		borrarEtiquetas();
		setRecordar(false);
		setNombre('');
		setGrado('');
		setEscuela('');
		setTurno('');
		setMateria('');
		setMaterias([]);
		setDiseno('rivadavia');
		setLetra('imprenta');
		setError('');
		if (preset === 'general') {
			setTamano('cuaderno');
			setPorMateria(false);
		}
	}

	return (
		<MarcoGenerador
			pdfHint={pdfHint}
			onPrint={() => pedirImpresion(false)}
			onPdf={() => pedirImpresion(true)}
			debajo={<AnuncioEtiquetas />}
			opciones={
				<>
					<label class="block text-sm font-medium text-azul" for="etiqueta-nombre">
						Nombre y apellido
					</label>
					<input
						id="etiqueta-nombre"
						class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
						value={nombre}
						autocomplete="off"
						required
						aria-invalid={error ? 'true' : undefined}
						onInput={(event) => {
							setNombre(event.currentTarget.value);
							if (error) setError('');
						}}
					/>
					{error && <p class="mt-1 text-sm text-azul">{error}</p>}

					<label class="mt-4 block text-sm font-medium text-azul" for="etiqueta-grado">
						Grado o sala
					</label>
					<input id="etiqueta-grado" class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm" value={grado} autocomplete="off" placeholder="3.º grado" onInput={(event) => setGrado(event.currentTarget.value)} />

					<label class="mt-4 flex items-start gap-2 text-sm text-azul">
						<input type="checkbox" class="mt-1" checked={porMateria} onChange={(event) => setPorMateria(event.currentTarget.checked)} />
						<span>Una etiqueta por materia, con el mismo nombre</span>
					</label>

					{porMateria ? (
						<fieldset class="mt-3">
							<legend class="text-sm font-medium text-azul">Materias</legend>
							<div class="mt-1.5 max-h-48 space-y-1 overflow-auto">
								{MATERIAS.map((item) => (
									<label key={item} class="flex min-h-11 items-center gap-2 text-sm">
										<input type="checkbox" checked={materias.includes(item)} onChange={() => alternarMateria(item)} />
										{item}
									</label>
								))}
							</div>
							{materias.length === 0 && <p class="mt-1 text-sm text-muted">Tildá las materias para armar una etiqueta por cada una.</p>}
						</fieldset>
					) : (
						<>
							<label class="mt-4 block text-sm font-medium text-azul" for="etiqueta-materia">
								Materia
							</label>
							<input
								id="etiqueta-materia"
								class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
								list="materias-sugeridas"
								value={materia}
								placeholder="Opcional"
								onInput={(event) => setMateria(event.currentTarget.value)}
							/>
							<datalist id="materias-sugeridas">
								{MATERIAS.map((item) => (
									<option key={item} value={item} />
								))}
							</datalist>
						</>
					)}

					<label class="mt-4 block text-sm font-medium text-azul" for="etiqueta-escuela">
						Escuela
					</label>
					<input id="etiqueta-escuela" class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm" value={escuela} autocomplete="off" onInput={(event) => setEscuela(event.currentTarget.value)} />

					<label class="mt-4 block text-sm font-medium text-azul" for="etiqueta-turno">
						Turno
					</label>
					<select id="etiqueta-turno" class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm" value={turno} onChange={(event) => setTurno(event.currentTarget.value)}>
						<option value="">Sin indicar</option>
						<option value="Mañana">Mañana</option>
						<option value="Tarde">Tarde</option>
						<option value="Completo">Completo</option>
					</select>

					<label class="mt-4 block text-sm font-medium text-azul" for="etiqueta-tamano">
						Tamaño
					</label>
					<select
						id="etiqueta-tamano"
						class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm"
						value={tamano}
						onChange={(event) => setTamano(event.currentTarget.value as TamanoId)}
					>
						{Object.values(TAMANOS).map((item) => (
							<option key={item.id} value={item.id}>
								{item.nombre} · {item.detalle}
							</option>
						))}
					</select>

					<fieldset class="mt-4">
						<legend class="text-sm font-medium text-azul">Diseño</legend>
						<div class="mt-1.5 grid grid-cols-2 gap-1">
							{DISENOS.map((item) => (
								<button
									key={item.id}
									type="button"
									class={diseno === item.id ? 'min-h-11 rounded-md bg-celeste px-2 py-1.5 text-left text-sm font-semibold text-white' : 'min-h-11 rounded-md border border-borde px-2 py-1.5 text-left text-sm'}
									aria-pressed={diseno === item.id}
									onClick={() => setDiseno(item.id)}
								>
									{item.nombre}
								</button>
							))}
						</div>
					</fieldset>

					<p class="mt-4 text-sm font-medium text-azul">Tipografía</p>
					<div class="mt-1.5 grid grid-cols-2 gap-1 rounded-control border border-borde p-1">
						<button type="button" class={letra === 'imprenta' ? 'min-h-11 rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white' : 'min-h-11 rounded-md px-2 py-1.5 text-sm'} aria-pressed={letra === 'imprenta'} onClick={() => setLetra('imprenta')}>
							Imprenta
						</button>
						<button type="button" class={letra === 'cursiva' ? 'min-h-11 rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white' : 'min-h-11 rounded-md px-2 py-1.5 text-sm'} aria-pressed={letra === 'cursiva'} onClick={() => setLetra('cursiva')}>
							Cursiva
						</button>
					</div>

					<label class="mt-4 flex items-start gap-2 text-sm text-azul">
						<input type="checkbox" class="mt-1" checked={recordar} onChange={(event) => setRecordar(event.currentTarget.checked)} />
						<span>Recordar en este navegador</span>
					</label>
					<button type="button" class="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-azul underline" onClick={borrar}>
						Borrar datos de este navegador
					</button>
				</>
			}
			vista={
				<div class="flex flex-col gap-4">
					{hojas.map((hoja, indice) => (
						<div class="preview-frame" key={indice}>
							<div class={`a4 hoja-etiquetas flex items-center justify-center ${indice < hojas.length - 1 ? 'corte-hoja' : ''}`}>
								<div
									class="grilla-etiquetas"
									style={{
										gridTemplateColumns: `repeat(${spec.columnas}, ${spec.ancho}mm)`,
										gridTemplateRows: `repeat(${spec.filas}, ${spec.alto}mm)`,
									}}
								>
									{hoja.map((item, lugar) => (
										<Celda key={lugar} item={item} tamano={tamano} diseno={diseno} letra={letra} />
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			}
		/>
	);
}
