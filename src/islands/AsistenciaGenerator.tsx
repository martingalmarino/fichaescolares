import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { provincias } from '../data/provincias';
import { track } from '../lib/analytics';
import {
	FILAS_OPCIONES,
	leerAlumnos,
	nombreCorto,
	opcionesAsistenciaDesdeParams,
	paginasDeNombres,
	paramsAsistencia,
	planDe,
	sujetoProvincia,
	type DatosDocente,
	type MesAsistencia,
	type NivelAsistencia,
	type OpcionesAsistencia,
} from '../lib/planificador';
import { sincronizarAviso } from './planificador/aviso';
import { useBarraFija, useImprimir } from './preview';

const SLUGS = provincias.map((provincia) => provincia.slug);
const CLAVE = 'aulita-planificador-2027';
const VACIO: DatosDocente = { docente: '', escuela: '', alumnos: '', cumpleanos: '' };

function paramsDe(search: string) {
	return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
}

export default function AsistenciaGenerator({ search = '' }: { search?: string }) {
	const [opciones, setOpciones] = useState<OpcionesAsistencia>(() => opcionesAsistenciaDesdeParams(paramsDe(search), SLUGS));
	const [datos, setDatos] = useState<DatosDocente>(VACIO);
	const [aviso, setAviso] = useState('');
	const [abierto, setAbierto] = useState(true);
	const barra = useRef<HTMLDivElement>(null);
	const saltearUrl = useRef(true);
	const saltearGuardado = useRef(true);
	const saltearPintado = useRef(true);
	useBarraFija(barra);

	const provincia = provincias.find((item) => item.slug === opciones.prov) ?? provincias.find((item) => item.slug === 'cordoba') ?? provincias[0];
	const plan = useMemo(() => (provincia ? planDe(provincia.slug, 'trimestres') : null), [provincia]);
	const tituloPdf = `Registro de asistencia 2027 ${provincia ? nombreCorto(provincia) : ''}`.trim();
	const { pdfHint, imprimir } = useImprimir(tituloPdf);

	useEffect(() => {
		const prop = search.startsWith('?') || search === '' ? search : `?${search}`;
		if (window.location.search !== prop) setOpciones(opcionesAsistenciaDesdeParams(paramsDe(window.location.search), SLUGS));
		const locales = cargarDatos();
		if (locales.docente || locales.escuela || locales.alumnos || locales.cumpleanos) setDatos(locales);
	}, [search]);

	useEffect(() => {
		if (saltearUrl.current) {
			saltearUrl.current = false;
			return;
		}
		const consulta = paramsAsistencia(opciones);
		const siguiente = `${location.pathname}?${consulta}`;
		if (`${location.pathname}${location.search}` !== siguiente) history.replaceState(null, '', siguiente);
	}, [opciones]);

	useEffect(() => {
		if (saltearGuardado.current) {
			saltearGuardado.current = false;
			return;
		}
		try {
			const previo = cargarDatos();
			const siguiente = { ...previo, docente: datos.docente, escuela: datos.escuela, alumnos: datos.alumnos };
			if (!siguiente.docente && !siguiente.escuela && !siguiente.alumnos && !siguiente.cumpleanos) {
				localStorage.removeItem(CLAVE);
				return;
			}
			localStorage.setItem(CLAVE, JSON.stringify(siguiente));
		} catch {
			/* el navegador puede rechazar el almacenamiento */
		}
	}, [datos]);

	useEffect(() => {
		const alVolver = () => setOpciones(opcionesAsistenciaDesdeParams(new URLSearchParams(location.search), SLUGS));
		window.addEventListener('popstate', alVolver);
		return () => window.removeEventListener('popstate', alVolver);
	}, []);

	useEffect(() => {
		if (!provincia || !plan) return;
		sincronizarAviso(provincia.slug, nombreCorto(provincia), sujetoProvincia(provincia), plan.estimados);
	}, [provincia, plan]);

	useEffect(() => {
		if (saltearPintado.current) {
			saltearPintado.current = false;
			return;
		}
		let vivo = true;
		void import('./planificador/vistas').then(({ pintarAsistencia }) => {
			if (!vivo) return;
			const destino = document.getElementById('vista-hojas');
			if (!destino) return;
			pintarAsistencia(destino, opciones, datos, false);
		});
		return () => {
			vivo = false;
		};
	}, [opciones, datos]);

	if (!provincia || !plan) return null;

	const meses = opciones.mes === 'anio' ? plan.mesesCiclo : plan.mesesCiclo.filter((mes) => mes.mes === opciones.mes);
	const tandas = paginasDeNombres(leerAlumnos(datos.alumnos), opciones.filas);
	const total = meses.length * tandas.length;

	async function pedirImpresion(pdf: boolean) {
		track(pdf ? 'pdf_click' : 'print_click', { tool: 'asistencia', hojas: total });
		const destino = document.getElementById('vista-hojas');
		if (!destino || total === 0) return;
		const { pintarAsistencia } = await import('./planificador/vistas');
		pintarAsistencia(destino, opciones, datos, true);
		imprimir(pdf);
	}

	function borrarDatos() {
		setDatos(VACIO);
		try {
			localStorage.removeItem(CLAVE);
		} catch {
			/* el navegador puede rechazar el almacenamiento */
		}
		setAviso('Se borraron los datos de este navegador.');
	}

	const botones = (
		<>
			<button
				type="button"
				class="inline-flex min-h-11 items-center gap-2 rounded-control border border-borde bg-white px-4 py-2.5 text-sm font-semibold text-azul disabled:opacity-50"
				disabled={total === 0}
				onClick={() => pedirImpresion(false)}
			>
				<span aria-hidden="true">🖨</span>
				Imprimir
			</button>
			<div class="relative">
				<button
					type="button"
					class="inline-flex min-h-11 items-center gap-2 rounded-control bg-sol px-4 py-2.5 text-sm font-semibold text-azul shadow-sm disabled:opacity-50"
					disabled={total === 0}
					onClick={() => pedirImpresion(true)}
				>
					<span aria-hidden="true">⬇</span>
					Descargar PDF ({total} {total === 1 ? 'hoja' : 'hojas'})
				</button>
				{pdfHint && (
					<p class="absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-control bg-azul px-3 py-2 text-center text-xs text-white">
						Elegí “Guardar como PDF” como destino
					</p>
				)}
			</div>
		</>
	);

	return (
		<div class="plan-contents">
			<aside class="panel rounded-card border border-borde bg-white p-4 shadow-card xl:col-start-1 xl:row-start-1 xl:row-span-2">
					<button
						type="button"
						class="flex min-h-11 w-full items-center justify-between text-left text-sm font-semibold text-azul xl:hidden"
						aria-expanded={abierto}
						onClick={() => setAbierto((valor) => !valor)}
					>
						Opciones
						<span aria-hidden="true">{abierto ? '−' : '+'}</span>
					</button>
					<div class={abierto ? 'mt-4 space-y-4 xl:mt-0' : 'mt-4 hidden space-y-4 xl:block'}>
						<div>
							<label class="text-sm font-medium text-azul" for="provincia-asist">
								Provincia
							</label>
							<select
								id="provincia-asist"
								class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm text-azul"
								value={opciones.prov}
								onChange={(event) => setOpciones((prev) => ({ ...prev, prov: event.currentTarget.value }))}
							>
								{provincias.map((item) => (
									<option key={item.slug} value={item.slug}>
										{item.nombre}
									</option>
								))}
							</select>
						</div>
						<Segmentos
							etiqueta="Nivel"
							valor={opciones.nivel}
							opciones={[
								{ id: 'primario', label: 'Primaria' },
								{ id: 'secundario', label: 'Secundaria' },
							]}
							onChange={(valor) => setOpciones((prev) => ({ ...prev, nivel: valor as NivelAsistencia }))}
						/>
						<div>
							<label class="text-sm font-medium text-azul" for="mes-asist">
								Mes
							</label>
							<select
								id="mes-asist"
								class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm text-azul"
								value={opciones.mes === 'anio' ? 'anio' : String(opciones.mes)}
								onChange={(event) => {
									const valor = event.currentTarget.value;
									const mes: MesAsistencia = valor === 'anio' ? 'anio' : Number(valor);
									setOpciones((prev) => ({ ...prev, mes }));
								}}
							>
								<option value="anio">Año completo</option>
								{plan.mesesCiclo.map((mes) => (
									<option key={mes.mes} value={mes.mes}>
										{mes.nombre}
									</option>
								))}
							</select>
						</div>
						<div>
							<label class="text-sm font-medium text-azul" for="filas-asist">
								Cantidad de filas
							</label>
							<select
								id="filas-asist"
								class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm text-azul"
								value={String(opciones.filas)}
								onChange={(event) => setOpciones((prev) => ({ ...prev, filas: Number(event.currentTarget.value) }))}
							>
								{FILAS_OPCIONES.map((filas) => (
									<option key={filas} value={filas}>
										{filas}
									</option>
								))}
							</select>
						</div>
						<div>
							<label class="text-sm font-medium text-azul" for="docente-asist">
								Docente
							</label>
							<input
								id="docente-asist"
								class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm"
								maxLength={80}
								value={datos.docente}
								onInput={(event) => setDatos((prev) => ({ ...prev, docente: event.currentTarget.value }))}
							/>
							<label class="mt-3 block text-sm font-medium text-azul" for="escuela-asist">
								Escuela
							</label>
							<input
								id="escuela-asist"
								class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm"
								maxLength={80}
								value={datos.escuela}
								onInput={(event) => setDatos((prev) => ({ ...prev, escuela: event.currentTarget.value }))}
							/>
							<label class="mt-3 block text-sm font-medium text-azul" for="alumnos-asist">
								Alumnos
							</label>
							<textarea
								id="alumnos-asist"
								class="mt-1.5 w-full rounded-control border border-borde px-3 py-2 text-sm"
								rows={6}
								maxLength={4000}
								placeholder="Un nombre por línea"
								value={datos.alumnos}
								onInput={(event) => setDatos((prev) => ({ ...prev, alumnos: event.currentTarget.value }))}
							/>
							<button type="button" class="mt-3 min-h-11 text-sm font-semibold text-celeste underline" onClick={borrarDatos}>
								Borrar mis datos
							</button>
							{aviso && (
								<p class="mt-2 text-xs text-muted" role="status">
									{aviso}
								</p>
							)}
						</div>
					</div>
				<div
					ref={barra}
					class="barra-fija no-print fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t border-borde bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] xl:hidden"
				>
					{botones}
				</div>
				</aside>
			<div class="no-print mb-4 hidden flex-wrap justify-center gap-3 xl:col-start-2 xl:row-start-1 xl:flex">{botones}</div>
		</div>
	);
}

function Segmentos({
	etiqueta,
	valor,
	opciones,
	onChange,
}: {
	etiqueta: string;
	valor: string;
	opciones: { id: string; label: string }[];
	onChange: (valor: string) => void;
}) {
	return (
		<div>
			<p class="text-sm font-medium text-azul">{etiqueta}</p>
			<div class="mt-1.5 flex flex-wrap gap-1" role="group" aria-label={etiqueta}>
				{opciones.map((item) => (
					<button
						key={item.id}
						type="button"
						aria-pressed={valor === item.id}
						class={
							valor === item.id
								? 'min-h-11 rounded-control bg-azul px-3 text-sm font-semibold text-white'
								: 'min-h-11 rounded-control border border-borde bg-white px-3 text-sm text-azul'
						}
						onClick={() => onChange(item.id)}
					>
						{item.label}
					</button>
				))}
			</div>
		</div>
	);
}

function cargarDatos(): DatosDocente {
	try {
		const crudo = localStorage.getItem(CLAVE);
		if (!crudo) return VACIO;
		const dato = JSON.parse(crudo) as Partial<DatosDocente>;
		return {
			docente: texto(dato.docente, 80),
			escuela: texto(dato.escuela, 80),
			alumnos: texto(dato.alumnos, 4000),
			cumpleanos: texto(dato.cumpleanos, 4000),
		};
	} catch {
		return VACIO;
	}
}

function texto(valor: unknown, tope: number): string {
	return typeof valor === 'string' ? valor.slice(0, tope) : '';
}
