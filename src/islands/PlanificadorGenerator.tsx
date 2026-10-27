import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { provincias } from '../data/provincias';
import { track } from '../lib/analytics';
import {
	GRADOS,
	NIVEL_LABEL,
	SECCIONES,
	TURNOS,
	etiquetaGrado,
	etiquetaTurno,
	gradoValido,
	leerAlumnos,
	leerCumpleanos,
	lugarProvincia,
	nombreCorto,
	opcionesDesdeParams,
	paramsDesdeOpciones,
	planDe,
	sujetoProvincia,
	type DatosDocente,
	type NivelPlanificador,
	type OpcionesPlanificador,
	type OrganizacionPeriodos,
	type SeccionPlanificador,
	type TurnoPlanificador,
	type VariantePlanificador,
} from '../lib/planificador';
import { useBarraFija, useImprimir } from './preview';
import {
	HojaActos,
	HojaAsistencia,
	HojaCumpleanos,
	HojaMes,
	HojaPlan,
	HojaPortada,
	HojaSemana,
	MarcoHoja,
	type ContextoHoja,
} from './planificador/Hojas';

const SLUGS = provincias.map((provincia) => provincia.slug);
const CLAVE = 'aulita-planificador-2027';
const FILAS = 22;
const VACIO: DatosDocente = { docente: '', escuela: '', alumnos: '', cumpleanos: '' };

export default function PlanificadorGenerator({ variante = 'planificador' }: { variante?: VariantePlanificador }) {
	const [opciones, setOpciones] = useState<OpcionesPlanificador>(() => opcionesDesdeParams(new URLSearchParams(), SLUGS, variante));
	const [datos, setDatos] = useState<DatosDocente>(VACIO);
	const [hidratado, setHidratado] = useState(false);
	const [aviso, setAviso] = useState('');
	const [abierto, setAbierto] = useState(true);
	const barra = useRef<HTMLDivElement>(null);
	useBarraFija(barra);

	const provincia = provincias.find((item) => item.slug === opciones.prov) ?? provincias.find((item) => item.slug === 'cordoba') ?? provincias[0];
	const plan = useMemo(() => (provincia ? planDe(provincia.slug, opciones.periodos) : null), [provincia, opciones.periodos]);
	const tituloPdf = `${variante === 'agenda' ? 'Agenda docente 2027' : 'Planificador docente 2027'} ${provincia ? nombreCorto(provincia) : ''}`.trim();
	const { pdfHint, imprimir } = useImprimir(tituloPdf);

	useEffect(() => {
		setOpciones(opcionesDesdeParams(new URLSearchParams(window.location.search), SLUGS, variante));
		setDatos(cargarDatos());
		setHidratado(true);
	}, [variante]);

	useEffect(() => {
		if (!hidratado) return;
		const consulta = paramsDesdeOpciones(opciones, variante);
		const siguiente = `${location.pathname}?${consulta}`;
		if (`${location.pathname}${location.search}` !== siguiente) history.replaceState(null, '', siguiente);
	}, [opciones, hidratado, variante]);

	useEffect(() => {
		if (!hidratado) return;
		try {
			if (!datos.docente && !datos.escuela && !datos.alumnos && !datos.cumpleanos) {
				localStorage.removeItem(CLAVE);
				return;
			}
			localStorage.setItem(CLAVE, JSON.stringify(datos));
		} catch {
			/* el navegador puede rechazar el almacenamiento */
		}
	}, [datos, hidratado]);

	useEffect(() => {
		const alVolver = () => setOpciones(opcionesDesdeParams(new URLSearchParams(location.search), SLUGS, variante));
		window.addEventListener('popstate', alVolver);
		return () => window.removeEventListener('popstate', alVolver);
	}, [variante]);

	if (!provincia || !plan) return null;

	const incluye = (id: SeccionPlanificador) => opciones.secciones.includes(id);
	const alumnos = leerAlumnos(datos.alumnos);
	const cumpleanos = leerCumpleanos(datos.cumpleanos);
	const ctx: ContextoHoja = {
		docente: datos.docente.trim(),
		escuela: datos.escuela.trim(),
		grado: etiquetaGrado(opciones.nivel, opciones.grado),
		nivel: NIVEL_LABEL[opciones.nivel],
		turno: etiquetaTurno(opciones.turno),
		lugar: lugarProvincia(provincia),
		provincia: nombreCorto(provincia),
		slug: provincia.slug,
		provisorio: plan.estimados,
		organizacion: opciones.periodos === 'trimestres' ? 'Organización por trimestres' : 'Organización por cuatrimestres',
		nivelId: opciones.nivel,
	};

	const hojas: { id: string; nodo: ComponentChildren }[] = [];
	if (incluye('portada')) hojas.push({ id: 'portada', nodo: <HojaPortada ctx={ctx} plan={plan} variante={variante} /> });
	if (incluye('meses')) {
		for (const mes of plan.mesesCiclo) {
			hojas.push({
				id: `mes-${mes.mes}`,
				nodo: (
					<HojaMes
						ctx={ctx}
						mes={mes}
						mostrarActos={incluye('actos')}
						mostrarCumpleanos={incluye('cumpleanos')}
						cumpleanos={cumpleanos.filter((item) => item.mes === mes.mes)}
					/>
				),
			});
		}
	} else if (incluye('cumpleanos')) {
		hojas.push({
			id: 'cumpleanos',
			nodo: (
				<HojaCumpleanos
					ctx={ctx}
					grupos={plan.mesesCiclo.map((mes) => ({
						mes: mes.nombre,
						items: cumpleanos.filter((item) => item.mes === mes.mes),
					}))}
				/>
			),
		});
	}
	if (incluye('actos') && !incluye('meses')) hojas.push({ id: 'actos', nodo: <HojaActos ctx={ctx} plan={plan} /> });
	if (incluye('semanas')) {
		for (const semana of plan.semanas) {
			hojas.push({ id: `semana-${semana.desde}`, nodo: <HojaSemana ctx={ctx} semana={semana} /> });
		}
	}
	if (incluye('planificacion')) hojas.push({ id: 'plan', nodo: <HojaPlan ctx={ctx} plan={plan} /> });
	if (incluye('asistencia')) {
		const paginas = trozos(alumnos);
		paginas.forEach((nombres, indice) => {
			hojas.push({
				id: `asistencia-${indice}`,
				nodo: <HojaAsistencia ctx={ctx} plan={plan} nombres={nombres} desde={indice * FILAS} />,
			});
		});
	}

	function pedirImpresion(pdf: boolean) {
		track(pdf ? 'pdf_click' : 'print_click', { tool: variante, hojas: hojas.length });
		imprimir(pdf);
	}

	function cambiarNivel(nivel: NivelPlanificador) {
		setOpciones((prev) => ({ ...prev, nivel, grado: gradoValido(nivel, prev.grado) }));
	}

	function alternar(id: SeccionPlanificador) {
		setOpciones((prev) => {
			const tiene = prev.secciones.includes(id);
			const secciones = tiene ? prev.secciones.filter((item) => item !== id) : [...prev.secciones, id];
			return { ...prev, secciones };
		});
	}

	function borrarDatos() {
		setDatos(VACIO);
		setAviso('Se borraron los datos de este navegador.');
	}

	const botones = (
		<>
			<button
				type="button"
				class="inline-flex min-h-11 items-center gap-2 rounded-control border border-borde bg-white px-4 py-2.5 text-sm font-semibold text-azul disabled:opacity-50"
				disabled={hojas.length === 0}
				onClick={() => pedirImpresion(false)}
			>
				<span aria-hidden="true">🖨</span>
				Imprimir
			</button>
			<div class="relative">
				<button
					type="button"
					class="inline-flex min-h-11 items-center gap-2 rounded-control bg-sol px-4 py-2.5 text-sm font-semibold text-azul shadow-sm disabled:opacity-50"
					disabled={hojas.length === 0}
					onClick={() => pedirImpresion(true)}
				>
					<span aria-hidden="true">⬇</span>
					Descargar PDF ({hojas.length} {hojas.length === 1 ? 'hoja' : 'hojas'})
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
		<div>
			{plan.estimados && (
				<p class="no-print mb-4 rounded-card border border-sol bg-sol-50 px-4 py-3 text-sm leading-relaxed text-azul">
					{sujetoProvincia(provincia)} todavía no publicó su calendario 2027. Usamos fechas provisorias y las actualizamos cuando salga. Las fechas oficiales están en el{' '}
					<a class="font-semibold underline" href={`/calendario-escolar-2027/${provincia.slug}/`}>
						calendario escolar 2027 de {nombreCorto(provincia)}
					</a>
					.
				</p>
			)}
			<div class="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
				<aside class="panel rounded-card border border-borde bg-white p-4 shadow-card">
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
							<label class="text-sm font-medium text-azul" for="provincia-plan">
								Provincia
							</label>
							<select
								id="provincia-plan"
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
								{ id: 'inicial', label: 'Inicial' },
								{ id: 'primario', label: 'Primario' },
							]}
							onChange={(valor) => cambiarNivel(valor as NivelPlanificador)}
						/>
						<div>
							<label class="text-sm font-medium text-azul" for="grado-plan">
								Grado o sala
							</label>
							<select
								id="grado-plan"
								class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm text-azul"
								value={opciones.grado}
								onChange={(event) => setOpciones((prev) => ({ ...prev, grado: event.currentTarget.value }))}
							>
								{GRADOS[opciones.nivel].map((item) => (
									<option key={item.id} value={item.id}>
										{item.label}
									</option>
								))}
							</select>
						</div>
						<Segmentos etiqueta="Turno" valor={opciones.turno} opciones={TURNOS} onChange={(valor) => setOpciones((prev) => ({ ...prev, turno: valor as TurnoPlanificador }))} />
						<Segmentos
							etiqueta="Períodos"
							valor={opciones.periodos}
							opciones={[
								{ id: 'trimestres', label: 'Trimestres' },
								{ id: 'cuatrimestres', label: 'Cuatrimestres' },
							]}
							onChange={(valor) => setOpciones((prev) => ({ ...prev, periodos: valor as OrganizacionPeriodos }))}
						/>
						<fieldset>
							<legend class="text-sm font-medium text-azul">Qué incluir</legend>
							<div class="mt-2 space-y-2">
								{SECCIONES.map((item) => (
									<label key={item.id} class="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-texto">
										<input type="checkbox" class="size-4 accent-celeste" checked={incluye(item.id)} onChange={() => alternar(item.id)} />
										{item.label}
									</label>
								))}
							</div>
						</fieldset>
						<div class="border-t border-borde pt-4">
							<p class="text-sm font-medium text-azul">Tus datos</p>
							<p class="mt-1 text-xs leading-relaxed text-muted">Se guardan solo en este navegador.</p>
							<label class="mt-3 block text-sm text-azul" for="docente-plan">
								Docente
							</label>
							<input
								id="docente-plan"
								class="mt-1 w-full rounded-control border border-borde px-3 py-2 text-sm"
								maxLength={80}
								value={datos.docente}
								onInput={(event) => setDatos((prev) => ({ ...prev, docente: event.currentTarget.value }))}
							/>
							<label class="mt-3 block text-sm text-azul" for="escuela-plan">
								Escuela
							</label>
							<input
								id="escuela-plan"
								class="mt-1 w-full rounded-control border border-borde px-3 py-2 text-sm"
								maxLength={80}
								value={datos.escuela}
								onInput={(event) => setDatos((prev) => ({ ...prev, escuela: event.currentTarget.value }))}
							/>
							<label class="mt-3 block text-sm text-azul" for="alumnos-plan">
								Alumnos
							</label>
							<textarea
								id="alumnos-plan"
								class="mt-1 w-full rounded-control border border-borde px-3 py-2 text-sm"
								rows={4}
								maxLength={4000}
								placeholder="Un nombre por línea"
								value={datos.alumnos}
								onInput={(event) => setDatos((prev) => ({ ...prev, alumnos: event.currentTarget.value }))}
							/>
							<label class="mt-3 block text-sm text-azul" for="cumple-plan">
								Cumpleaños
							</label>
							<textarea
								id="cumple-plan"
								class="mt-1 w-full rounded-control border border-borde px-3 py-2 text-sm"
								rows={3}
								maxLength={4000}
								placeholder={'Ana Pérez, 12/3'}
								value={datos.cumpleanos}
								onInput={(event) => setDatos((prev) => ({ ...prev, cumpleanos: event.currentTarget.value }))}
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
				</aside>
				<div class="min-w-0">
					<div class="no-print mb-4 hidden flex-wrap justify-center gap-3 xl:flex">{botones}</div>
					<div class="vista-plan rounded-card bg-celeste-50 p-3 sm:p-5">
						{hojas.length === 0 ? (
							<p class="py-16 text-center text-sm text-muted">Elegí al menos una sección para armar la hoja.</p>
						) : (
							<div class="grilla-hojas grid gap-6 xl:grid-cols-2">
								{hojas.map((hoja, indice) => (
									<MarcoHoja key={hoja.id} corte={indice < hojas.length - 1}>
										{hoja.nodo}
									</MarcoHoja>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
			<div
				ref={barra}
				class="barra-fija no-print fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 border-t border-borde bg-white px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] xl:hidden"
			>
				{botones}
			</div>
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

function trozos(nombres: string[]): string[][] {
	if (nombres.length === 0) return [Array.from({ length: FILAS }, () => '')];
	const paginas: string[][] = [];
	for (let i = 0; i < nombres.length; i += FILAS) {
		const pagina = nombres.slice(i, i + FILAS);
		while (pagina.length < FILAS) pagina.push('');
		paginas.push(pagina);
	}
	return paginas;
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
