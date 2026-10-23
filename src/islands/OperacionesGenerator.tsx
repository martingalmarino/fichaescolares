import { useEffect, useMemo, useState } from 'preact/hooks';
import { track } from '../lib/analytics';
import { crearOperaciones, type FormatoCuenta, type TipoCuenta } from '../lib/math';
import { MarcoGenerador, NombreFecha, PreviewFrame, escribirUrl, nuevaSemilla, useImprimir, useSemilla } from './preview';

interface Props {
	initialSeed: number | null;
}

const tipos: { id: TipoCuenta; label: string }[] = [
	{ id: 'tablas', label: 'Tablas' },
	{ id: 'suma', label: 'Suma' },
	{ id: 'resta', label: 'Resta' },
	{ id: 'multiplicacion', label: 'Multiplicación' },
	{ id: 'division', label: 'División' },
];

export default function OperacionesGenerator({ initialSeed }: Props) {
	const { seed, ready, setSeed } = useSemilla(initialSeed);
	const [tipo, setTipo] = useState<TipoCuenta>('suma');
	const [minimo, setMinimo] = useState(1);
	const [maximo, setMaximo] = useState(20);
	const [cantidad, setCantidad] = useState(16);
	const [llevar, setLlevar] = useState(false);
	const [resto, setResto] = useState(false);
	const [formato, setFormato] = useState<FormatoCuenta>('vertical');
	const [soluciones, setSoluciones] = useState(true);
	const [nombre, setNombre] = useState(true);
	const [titulo, setTitulo] = useState('Cuentas');
	const { pdfHint, imprimir } = useImprimir(titulo);

	useEffect(() => {
		if (!ready) return;
		try {
			const guardado = localStorage.getItem('fp-operaciones');
			if (!guardado) return;
			const prefs = JSON.parse(guardado) as { tipo?: TipoCuenta; formato?: FormatoCuenta; llevar?: boolean };
			if (prefs.tipo) setTipo(prefs.tipo);
			if (prefs.formato) setFormato(prefs.formato);
			if (typeof prefs.llevar === 'boolean') setLlevar(prefs.llevar);
		} catch {
			/* sigue con las cuentas iniciales */
		}
	}, [ready]);

	useEffect(() => {
		if (!ready) return;
		escribirUrl(seed, {});
		localStorage.setItem('fp-operaciones', JSON.stringify({ tipo, formato, llevar }));
	}, [ready, seed, tipo, formato, llevar]);

	const problemas = useMemo(
		() => crearOperaciones({ tipo, minimo, maximo, cantidad, llevar: tipo === 'tablas' ? true : llevar, conResto: resto }, seed),
		[tipo, minimo, maximo, cantidad, llevar, resto, seed],
	);

	return (
		<MarcoGenerador
			pdfHint={pdfHint}
			onPrint={() => {
				track('print_click', { tool: 'operaciones' });
				imprimir(false);
			}}
			onPdf={() => {
				track('pdf_click', { tool: 'operaciones' });
				imprimir(true);
			}}
			opciones={
				<>
					<label class="block text-sm font-medium text-azul" for="tipo">
						Tipo
					</label>
					<select id="tipo" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={tipo} onChange={(event) => setTipo(event.currentTarget.value as TipoCuenta)}>
						{tipos.map((item) => (
							<option key={item.id} value={item.id}>
								{item.label}
							</option>
						))}
					</select>
					{tipo !== 'tablas' && (
						<div class="mt-4 grid grid-cols-2 gap-2">
							<label class="text-sm font-medium text-azul">
								Desde
								<input type="number" min={0} max={999} class="mt-1 w-full rounded-control border border-borde px-2 py-1.5" value={minimo} onChange={(event) => setMinimo(Number(event.currentTarget.value))} />
							</label>
							<label class="text-sm font-medium text-azul">
								Hasta
								<input type="number" min={0} max={999} class="mt-1 w-full rounded-control border border-borde px-2 py-1.5" value={maximo} onChange={(event) => setMaximo(Number(event.currentTarget.value))} />
							</label>
						</div>
					)}
					<label class="mt-4 block text-sm font-medium text-azul" for="cuentas">
						Cantidad: {cantidad}
					</label>
					<input id="cuentas" type="range" min={12} max={40} value={cantidad} class="mt-1.5 w-full" onChange={(event) => setCantidad(Number(event.currentTarget.value))} />
					{tipo !== 'tablas' && tipo !== 'division' && (
						<label class="mt-3 flex items-center gap-2 text-sm">
							<input type="checkbox" checked={llevar} onChange={(event) => setLlevar(event.currentTarget.checked)} />
							Permitir llevarse o pedir prestado
						</label>
					)}
					{tipo === 'division' && (
						<label class="mt-3 flex items-center gap-2 text-sm">
							<input type="checkbox" checked={resto} onChange={(event) => setResto(event.currentTarget.checked)} />
							Permitir resto
						</label>
					)}
					<p class="mt-4 text-sm font-medium text-azul">Formato</p>
					<div class="mt-1.5 grid grid-cols-2 gap-1 rounded-control border border-borde p-1">
						<button type="button" class={formato === 'vertical' ? 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white' : 'rounded-md px-2 py-1.5 text-sm'} aria-pressed={formato === 'vertical'} onClick={() => setFormato('vertical')}>
							Vertical
						</button>
						<button type="button" class={formato === 'horizontal' ? 'rounded-md bg-celeste px-2 py-1.5 text-sm font-semibold text-white' : 'rounded-md px-2 py-1.5 text-sm'} aria-pressed={formato === 'horizontal'} onClick={() => setFormato('horizontal')}>
							Horizontal
						</button>
					</div>
					<label class="mt-4 block text-sm font-medium text-azul" for="titulo-cuentas">
						Título
					</label>
					<input id="titulo-cuentas" class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm" value={titulo} onInput={(event) => setTitulo(event.currentTarget.value)} />
					<label class="mt-3 flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={soluciones}
							onChange={(event) => {
								setSoluciones(event.currentTarget.checked);
								track('toggle_solutions', { tool: 'operaciones', value: event.currentTarget.checked });
							}}
						/>
						Hoja de respuestas
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
							track('regenerate', { tool: 'operaciones' });
						}}
					>
						Generar otra
					</button>
				</>
			}
			vista={
				<div class="space-y-8">
					<PreviewFrame>
						<HojaCuentas titulo={titulo} nombre={nombre} problemas={problemas} formato={formato} solucion={false} resto={resto && tipo === 'division'} />
					</PreviewFrame>
					{soluciones && (
						<PreviewFrame solution>
							<HojaCuentas titulo={`${titulo} · Respuestas`} nombre={false} problemas={problemas} formato={formato} solucion resto={resto && tipo === 'division'} />
						</PreviewFrame>
					)}
				</div>
			}
		/>
	);
}

function HojaCuentas({
	titulo,
	nombre,
	problemas,
	formato,
	solucion,
	resto,
}: {
	titulo: string;
	nombre: boolean;
	problemas: ReturnType<typeof crearOperaciones>;
	formato: FormatoCuenta;
	solucion: boolean;
	resto: boolean;
}) {
	return (
		<div>
			{nombre && <NombreFecha />}
			<h2 class="text-center text-[22px] font-bold">{titulo.trim() || 'Cuentas'}</h2>
			<p class="mt-1 text-center text-[13px]">Resolvé las cuentas. Mostrá la cuenta si hace falta.</p>
			<ul class={formato === 'vertical' ? 'mt-4 grid grid-cols-2 gap-x-6 gap-y-5 text-[16px] sm:grid-cols-4' : 'mt-4 grid grid-cols-1 gap-3 text-[16px] sm:grid-cols-2'}>
				{problemas.map((problema, index) => (
					<li key={`${problema.a}-${problema.b}-${index}`}>
						{formato === 'vertical' ? (
							<div class="inline-block min-w-16 border-b-2 border-azul pr-2 text-right leading-tight">
								<div>{problema.a}</div>
								<div>
									{problema.operador} {problema.b}
								</div>
							</div>
						) : (
							<p>
								{index + 1}. {problema.a} {problema.operador} {problema.b} = {solucion ? problema.resultado : '____'}
								{resto ? (solucion ? ` (resto ${problema.resto})` : ' resto ____') : ''}
							</p>
						)}
						{formato === 'vertical' && solucion && (
							<p class="mt-1 text-right text-[14px] font-semibold">
								{problema.resultado}
								{resto ? ` r ${problema.resto}` : ''}
							</p>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
