import type { ComponentChildren } from 'preact';
import { LEY_FERIADOS, nombreMes } from '../../lib/calendario';
import {
	areasDePlanificador,
	diaDeMes,
	diasDeAsistencia,
	textoHabiles,
	type DiaLectivo,
	type MesLectivo,
	type NivelPlanificador,
	type PlanLectivo,
	type OrientacionPlan,
	type SemanaLectiva,
	type VariantePlanificador,
} from '../../lib/planificador';

export interface ContextoHoja {
	docente: string;
	escuela: string;
	grado: string;
	nivel: string;
	turno: string;
	lugar: string;
	provincia: string;
	slug: string;
	provisorio: boolean;
	organizacion: string;
	nivelId: NivelPlanificador;
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const CORTOS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const ASPECTOS = ['Contenidos', 'Propósitos', 'Actividades', 'Evaluación'] as const;

export function MarcoHoja({ corte, apaisada = false, children }: { corte: boolean; apaisada?: boolean; children: ComponentChildren }) {
	return (
		<div class="preview-frame w-full min-w-0">
			<article class={`a4 hoja-plan flex flex-col bg-white text-azul shadow-card ${apaisada ? 'hoja-apaisada' : ''} ${corte ? 'corte' : ''}`}>{children}</article>
		</div>
	);
}

export function HojaPortada({
	ctx,
	plan,
	variante = 'planificador',
}: {
	ctx: ContextoHoja;
	plan: PlanLectivo;
	variante?: VariantePlanificador;
}) {
	if (variante === 'agenda') return <PortadaAgenda ctx={ctx} plan={plan} />;
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<div class="flex flex-1 flex-col justify-center py-8">
				<p class="text-sm font-semibold uppercase tracking-[0.16em] text-celeste">Aulita</p>
				<h2 class="mt-3 text-4xl font-bold leading-tight tracking-tight">Planificador docente</h2>
				<p class="mt-1 text-3xl font-bold text-celeste">{plan.anio}</p>
				<p class="mt-6 text-lg font-semibold">{ctx.lugar}</p>
				<p class="mt-1 text-base">
					Nivel {ctx.nivel.toLocaleLowerCase('es-AR')} · {ctx.grado} · Turno {ctx.turno.toLocaleLowerCase('es-AR')}
				</p>
				<div class="mt-8 max-w-xs rounded-card border border-borde px-4 py-3">
					<p class="text-[11px] font-semibold uppercase tracking-wide text-muted">Días hábiles del ciclo</p>
					<p class="mt-1 text-4xl font-bold leading-none">{plan.totalHabiles}</p>
					<p class="mt-1 text-sm text-muted">{plan.estimados ? 'estimados' : 'de clase'}</p>
				</div>
				{ctx.provisorio && <AvisoFecha ctx={ctx} className="mt-6 max-w-sm" />}
			</div>
			<p class="text-center text-[11px] text-muted">aulita.com.ar</p>
		</div>
	);
}

export function HojaMes({
	ctx,
	mes,
	cumpleanos,
	mostrarActos,
	mostrarCumpleanos,
}: {
	ctx: ContextoHoja;
	mes: MesLectivo;
	cumpleanos: { nombre: string; dia: number }[];
	mostrarActos: boolean;
	mostrarCumpleanos: boolean;
}) {
	const cajas = 1 + (mostrarActos ? 1 : 0) + (mostrarCumpleanos ? 1 : 0);
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<div class="mt-3 flex items-start justify-between gap-3">
				<div>
					<h2 class="text-2xl font-bold tracking-tight">
						{mes.nombre} {mes.anio}
					</h2>
					<p class="mt-0.5 text-[12px]">
						{ctx.lugar} · Nivel {ctx.nivel.toLocaleLowerCase('es-AR')} · Turno {ctx.turno.toLocaleLowerCase('es-AR')}
					</p>
				</div>
				{ctx.provisorio && <AvisoFecha ctx={ctx} />}
			</div>
			<table class="mt-3 w-full table-fixed border-collapse text-left">
				<caption class="sr-only">
					{mes.nombre} {mes.anio}
				</caption>
				<thead>
					<tr>
						{CORTOS.map((dia, indice) => (
							<th key={dia} scope="col" class="pb-1 text-center text-[10px] font-semibold tracking-wide text-muted">
								<span class="sr-only">{DIAS[indice]}</span>
								<span aria-hidden="true">{dia}</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{mes.semanas.map((semana, indice) => (
						<tr key={`${mes.mes}-${indice}`}>
							{semana.map((dia, columna) => (
								<CeldaDia key={dia?.iso ?? `vacio-${indice}-${columna}`} dia={dia} />
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div class={`mt-3 grid gap-2 ${cajas === 3 ? 'grid-cols-3' : cajas === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
				<Caja titulo={mes.estimados ? 'Días hábiles estimados' : 'Días hábiles'}>
					<p class="text-3xl font-bold leading-none">{mes.habiles}</p>
					<p class="mt-1 text-[11px] leading-snug">de clase en {mes.nombre.toLocaleLowerCase('es-AR')}</p>
					{mes.estimados && <p class="text-[11px] text-muted">(estimado)</p>}
				</Caja>
				{mostrarActos && (
					<Caja titulo="Actos y reuniones">
						<Renglones cantidad={3} />
					</Caja>
				)}
				{mostrarCumpleanos && (
					<Caja titulo="Cumpleaños del mes">
						{cumpleanos.map((item) => (
							<p key={`${item.nombre}-${item.dia}`} class="truncate text-[11px] leading-5">
								{item.nombre} · {item.dia}
							</p>
						))}
						<Renglones cantidad={Math.max(0, 3 - cumpleanos.length)} />
					</Caja>
				)}
			</div>
			<Leyenda />
			<PieFuente ctx={ctx} />
		</div>
	);
}

export function HojaSemana({ ctx, semana }: { ctx: ContextoHoja; semana: SemanaLectiva }) {
	const lunes = semana.dias[0];
	const viernes = semana.dias[4];
	const titulo =
		lunes && viernes
			? lunes.mes === viernes.mes
				? `Semana del ${lunes.dia} al ${viernes.dia} de ${nombreMes(lunes.mes).toLocaleLowerCase('es-AR')}`
				: `Semana del ${diaDeMes(lunes.dia, lunes.mes)} al ${diaDeMes(viernes.dia, viernes.mes)}`
			: 'Semana';
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<h2 class="mt-3 text-xl font-bold tracking-tight">{titulo}</h2>
			<p class="text-[12px]">
				{ctx.lugar} · {ctx.grado}
			</p>
			<div class="mt-3 grid min-h-0 flex-1 grid-cols-5 gap-1.5">
				{semana.dias.slice(0, 5).map((dia, indice) => (
					<div key={dia?.iso ?? `s-${indice}`} class={`flex min-h-[150mm] flex-col rounded-md border border-borde p-1.5 ${fondoDia(dia)}`}>
						<p class="text-[10px] font-semibold text-muted">{CORTOS[indice]}</p>
						<p class={`text-lg font-bold ${dia?.feriado ? 'text-[#9a3412]' : ''}`}>{dia?.dia ?? ''}</p>
						<TextosDia dia={dia} />
						{dia && !dia.feriado && !dia.receso && dia.habil && <div class="renglones-dia mt-1 flex-1" />}
					</div>
				))}
			</div>
			<PieFuente ctx={ctx} />
		</div>
	);
}

export function HojaPlan({ ctx, plan }: { ctx: ContextoHoja; plan: PlanLectivo }) {
	const areas = areasDePlanificador(ctx.nivelId);
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<div class="mt-3 flex items-start justify-between gap-3">
				<div>
					<h2 class="text-2xl font-bold tracking-tight">Planificación anual {plan.anio}</h2>
					<p class="mt-0.5 text-[12px]">
						{ctx.provincia} · {ctx.grado} · {ctx.organizacion}
					</p>
				</div>
				{ctx.provisorio && <AvisoFecha ctx={ctx} texto="Días hábiles estimados" />}
			</div>
			<table class="mt-3 w-full flex-1 border-collapse text-left">
				<thead>
					<tr>
						<th scope="col" class="w-[22%] border border-borde bg-celeste-50 px-2 py-1.5 text-[11px] font-semibold">
							Área
						</th>
						{plan.periodos.map((periodo) => (
							<th key={periodo.clave} scope="col" class="border border-borde bg-celeste-50 px-2 py-1.5 text-[11px] font-semibold">
								{periodo.nombre}
								<span class="mt-0.5 block font-normal text-muted">
									{periodo.etiquetaMeses} · {textoHabiles(periodo.habiles, periodo.estimados)}
								</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{areas.map((area) => (
						<tr key={area} class="h-[28mm]">
							<th scope="row" class="border border-borde px-2 py-2 align-top text-[12px] font-semibold">
								{area}
							</th>
							{plan.periodos.map((periodo) => (
								<td key={periodo.clave} class="border border-borde" />
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div class="mt-3 rounded-md border border-borde px-3 py-2">
				<p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Proyectos y actos del año</p>
				<p class="mt-1 text-[12px]">{plan.actos.map((acto) => diaDeMes(acto.dia, acto.mes)).join(' · ')}</p>
			</div>
			<PieFuente ctx={ctx} />
		</div>
	);
}

export function HojaPlanificacionAnual({
	ctx,
	plan,
	areas,
	orientacion,
	pagina,
	total,
}: {
	ctx: ContextoHoja;
	plan: PlanLectivo;
	areas: string[];
	orientacion: OrientacionPlan;
	pagina: number;
	total: number;
}) {
	const alto = orientacion === 'horizontal' ? (areas.length <= 5 ? 'h-[24mm]' : 'h-[14mm]') : areas.length <= 2 ? 'h-[68mm]' : 'h-[46mm]';
	const ultima = pagina === total;
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<div class="mt-3 flex items-start justify-between gap-3">
				<div>
					<h2 class="text-2xl font-bold tracking-tight">
						Planificación anual {plan.anio}
						{total > 1 ? <span class="ml-2 text-sm font-semibold text-muted">{pagina}/{total}</span> : null}
					</h2>
					<p class="mt-0.5 text-[12px]">
						{ctx.provincia} · {ctx.grado} · {ctx.organizacion}
					</p>
				</div>
				{ctx.provisorio && <AvisoFecha ctx={ctx} texto="Días hábiles estimados (fechas de ejemplo)" />}
			</div>
			{orientacion === 'horizontal' ? (
				<TablaApaisada plan={plan} areas={areas} alto={alto} />
			) : (
				<TablaVertical plan={plan} areas={areas} alto={alto} />
			)}
			{ultima && (
				<div class="mt-3 rounded-md border border-borde px-3 py-2">
					<p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Proyectos y actos del año</p>
					<p class="mt-1 text-[12px]">{plan.actos.map((acto) => diaDeMes(acto.dia, acto.mes)).join(' · ')}</p>
				</div>
			)}
			<PieFuente ctx={ctx} />
		</div>
	);
}

function TablaVertical({ plan, areas, alto }: { plan: PlanLectivo; areas: string[]; alto: string }) {
	return (
		<table class="mt-3 w-full flex-1 border-collapse text-left">
			<thead>
				<tr>
					<th scope="col" class="w-[22%] border border-borde bg-celeste-50 px-2 py-1.5 text-[11px] font-semibold">
						Área
					</th>
					{plan.periodos.map((periodo) => (
						<th key={periodo.clave} scope="col" class="border border-borde bg-celeste-50 px-2 py-1.5 text-[11px] font-semibold">
							{periodo.nombre}
							<span class="mt-0.5 block font-normal text-muted">
								{periodo.etiquetaMeses} · {textoHabiles(periodo.habiles, periodo.estimados)}
							</span>
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{areas.map((area) => (
					<tr key={area} class={alto}>
						<th scope="row" class="border border-borde px-2 py-2 align-top text-[12px] font-semibold">
							{area}
						</th>
						{plan.periodos.map((periodo) => (
							<td key={periodo.clave} class="border border-borde p-1 align-top">
								{ASPECTOS.map((aspecto) => (
									<p key={aspecto} class="mt-1 border-b border-borde pb-1 text-[8px] leading-tight text-muted">
										{aspecto}
									</p>
								))}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function TablaApaisada({ plan, areas, alto }: { plan: PlanLectivo; areas: string[]; alto: string }) {
	return (
		<table class="mt-3 w-full flex-1 border-collapse text-left">
			<thead>
				<tr>
					<th scope="col" rowSpan={2} class="w-[18%] border border-borde bg-celeste-50 px-1.5 py-1 text-[10px] font-semibold">
						Área
					</th>
					{plan.periodos.map((periodo) => (
						<th key={periodo.clave} scope="col" colSpan={ASPECTOS.length} class="border border-borde bg-celeste-50 px-1 py-1 text-center text-[10px] font-semibold">
							{periodo.nombre}
							<span class="mt-0.5 block font-normal text-muted">
								{periodo.etiquetaMeses} · {textoHabiles(periodo.habiles, periodo.estimados)}
							</span>
						</th>
					))}
				</tr>
				<tr>
					{plan.periodos.map((periodo) =>
						ASPECTOS.map((aspecto) => (
							<th key={`${periodo.clave}-${aspecto}`} scope="col" class="border border-borde bg-celeste-50 px-0.5 py-1 text-center text-[7px] font-semibold leading-tight text-muted">
								{aspecto}
							</th>
						)),
					)}
				</tr>
			</thead>
			<tbody>
				{areas.map((area) => (
					<tr key={area} class={alto}>
						<th scope="row" class="border border-borde px-1.5 py-1 align-top text-[10px] font-semibold">
							{area}
						</th>
						{plan.periodos.map((periodo) =>
							ASPECTOS.map((aspecto) => <td key={`${periodo.clave}-${aspecto}`} class="border border-borde" />),
						)}
					</tr>
				))}
			</tbody>
		</table>
	);
}

export function HojaAsistencia({
	ctx,
	plan,
	nombres,
	desde,
}: {
	ctx: ContextoHoja;
	plan: PlanLectivo;
	nombres: string[];
	desde: number;
}) {
	const columnas = plan.mesesCiclo.filter((mes) => mes.habiles > 0);
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<h2 class="mt-3 text-xl font-bold tracking-tight">Registro de asistencia {plan.anio}</h2>
			<p class="text-[12px]">
				{ctx.lugar} · {ctx.grado} · Turno {ctx.turno.toLocaleLowerCase('es-AR')}
			</p>
			<table class="mt-3 w-full table-fixed border-collapse text-left">
				<thead>
					<tr>
						<th scope="col" class="w-8 border border-borde bg-celeste-50 px-1 py-1 text-center text-[10px]">
							N.º
						</th>
						<th scope="col" class="border border-borde bg-celeste-50 px-1.5 py-1 text-[10px]">
							Alumno
						</th>
						{columnas.map((mes) => (
							<th key={mes.mes} scope="col" class="border border-borde bg-celeste-50 px-0.5 py-1 text-center text-[9px] font-semibold">
								{mes.nombre.slice(0, 3)}
								<span class="block font-normal text-muted">{mes.habiles}</span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{nombres.map((nombre, indice) => (
						<tr key={`${desde}-${indice}`}>
							<td class="border border-borde px-1 py-1 text-center text-[10px] text-muted">{nombre ? desde + indice + 1 : ''}</td>
							<td class="border border-borde px-1.5 py-1 text-[11px]">{nombre}</td>
							{columnas.map((mes) => (
								<td key={mes.mes} class="border border-borde" />
							))}
						</tr>
					))}
				</tbody>
			</table>
			<p class="mt-2 text-[10px] text-muted">Referencias: P presente · A ausente · T tarde · J justificada. El número de cada mes es la cantidad de días hábiles.</p>
			<PieFuente ctx={ctx} />
		</div>
	);
}

export function HojaAsistenciaMes({
	ctx,
	mes,
	nombres,
	desde,
	pagina,
	total,
}: {
	ctx: ContextoHoja;
	mes: MesLectivo;
	nombres: string[];
	desde: number;
	pagina: number;
	total: number;
}) {
	const dias = diasDeAsistencia(mes);
	const alto = nombres.length <= 20 ? 'h-[6.5mm]' : nombres.length <= 25 ? 'h-[5.2mm]' : nombres.length <= 30 ? 'h-[4.4mm]' : 'h-[3.5mm]';
	return (
		<div class="flex flex-1 flex-col">
			<div class="flex items-start justify-between gap-3">
				<div>
					<h2 class="text-xl font-bold tracking-tight">
						Registro de asistencia {mes.anio}
						{total > 1 ? <span class="ml-2 text-sm font-semibold text-muted">{pagina}/{total}</span> : null}
					</h2>
					<p class="mt-0.5 text-[12px]">
						{ctx.provincia} · {ctx.nivel} · {mes.nombre}
						<span class="text-muted">
							{' '}
							· {mes.estimados ? textoHabiles(mes.habiles, true) : textoHabiles(mes.habiles, false)}
						</span>
					</p>
				</div>
				<p class="text-right text-[11px]">
					<span class="block">Docente: {ctx.docente || '________________'}</span>
					<span class="mt-1 block">Escuela: {ctx.escuela || '________________'}</span>
				</p>
			</div>
			{ctx.provisorio && mes.estimados && <AvisoFecha ctx={ctx} texto="Días hábiles estimados" className="mt-2 max-w-xs" />}
			{mes.habiles === 0 && <p class="mt-2 text-[11px] text-muted">Este mes no tiene días hábiles en el ciclo.</p>}
			<table class="mt-2 w-full table-fixed border-collapse text-left">
				<thead>
					<tr>
						<th scope="col" class="w-6 border border-borde bg-celeste-50 px-0.5 py-1 text-center text-[8px]">
							N.º
						</th>
						<th scope="col" class="w-[32mm] border border-borde bg-celeste-50 px-1 py-1 text-left text-[8px]">
							Alumno
						</th>
						{dias.map((dia) => {
							const tachado = !dia.habil;
							const titulo = [dia.feriado, dia.receso, dia.hito].filter(Boolean).join('. ');
							const fondo = dia.feriado ? 'bg-[#fff6e8]' : tachado ? 'bg-[#f3f4f6]' : '';
							return (
								<th
									key={dia.iso}
									scope="col"
									title={titulo || undefined}
									class={`border border-borde px-0 py-0.5 text-center text-[8px] font-semibold ${fondo} ${tachado ? 'line-through' : ''} ${dia.feriado ? 'text-[#9a3412]' : tachado ? 'text-muted' : ''}`}
								>
									<span class="sr-only">
										{diaDeMes(dia.dia, dia.mes)}
										{titulo ? `, ${titulo}` : ''}
									</span>
									<span aria-hidden="true">{dia.dia}</span>
								</th>
							);
						})}
						<th scope="col" class="w-6 border border-borde bg-celeste-50 px-0 py-1 text-center text-[8px]" title="Presentes">
							P
						</th>
						<th scope="col" class="w-6 border border-borde bg-celeste-50 px-0 py-1 text-center text-[8px]" title="Ausentes">
							A
						</th>
					</tr>
				</thead>
				<tbody>
					{nombres.map((nombre, indice) => (
						<tr key={`${mes.mes}-${desde}-${indice}`} class={alto}>
							<td class="border border-borde text-center text-[8px] text-muted">{desde + indice + 1}</td>
							<td class="truncate border border-borde px-1 text-[8px]">{nombre}</td>
							{dias.map((dia) => (
								<td key={dia.iso} class={`border border-borde ${dia.feriado ? 'bg-[#fff6e8]' : dia.habil ? '' : 'bg-[#f3f4f6]'}`} />
							))}
							<td class="border border-borde" />
							<td class="border border-borde" />
						</tr>
					))}
				</tbody>
			</table>
			<p class="mt-1.5 text-[9px] text-muted">Referencias: P presente · A ausente · T tarde · J justificada. Los días tachados no se cuentan: son feriado, receso o quedan fuera del ciclo.</p>
			<PieFuente ctx={ctx} />
		</div>
	);
}

export function HojaCumpleanos({ ctx, grupos }: { ctx: ContextoHoja; grupos: { mes: string; items: { nombre: string; dia: number }[] }[] }) {
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<h2 class="mt-3 text-xl font-bold tracking-tight">Cumpleaños del año</h2>
			<div class="mt-3 grid grid-cols-2 gap-2">
				{grupos.map((grupo) => (
					<section key={grupo.mes} class="rounded-md border border-borde px-2 py-1.5">
						<h3 class="text-[12px] font-semibold">{grupo.mes}</h3>
						{grupo.items.length === 0 ? (
							<Renglones cantidad={2} />
						) : (
							grupo.items.map((item) => (
								<p key={`${item.nombre}-${item.dia}`} class="text-[11px] leading-5">
									{item.dia} · {item.nombre}
								</p>
							))
						)}
					</section>
				))}
			</div>
			<PieFuente ctx={ctx} />
		</div>
	);
}

export function HojaActos({ ctx, plan }: { ctx: ContextoHoja; plan: PlanLectivo }) {
	return (
		<div class="flex flex-1 flex-col">
			<LineaDatos ctx={ctx} />
			<h2 class="mt-3 text-xl font-bold tracking-tight">Actos y reuniones {plan.anio}</h2>
			<ul class="mt-3 space-y-1 text-[12px]">
				{plan.actos.map((acto) => (
					<li key={acto.slug}>
						{diaDeMes(acto.dia, acto.mes)} · {acto.titulo}
					</li>
				))}
			</ul>
			<div class="mt-4">
				<Caja titulo="Reuniones y notas">
					<Renglones cantidad={8} />
				</Caja>
			</div>
			<PieFuente ctx={ctx} />
		</div>
	);
}

function CeldaDia({ dia }: { dia: DiaLectivo | null }) {
	if (!dia) return <td class="border border-borde bg-white" />;
	const titulo = [dia.hito, dia.feriado, dia.receso, ...dia.notas].filter(Boolean).join('. ');
	return (
		<td title={titulo || undefined} class={`h-[18mm] overflow-hidden border border-borde p-0.5 align-top ${fondoDia(dia)} ${dia.hito ? 'ring-2 ring-inset ring-azul' : ''}`}>
			<span class={`block text-[12px] font-semibold leading-none ${dia.feriado ? 'text-[#9a3412]' : dia.finDeSemana ? 'text-muted' : 'text-azul'}`}>{dia.dia}</span>
			<TextosDia dia={dia} />
		</td>
	);
}

function TextosDia({ dia }: { dia: DiaLectivo | null }) {
	if (!dia) return null;
	return (
		<>
			{dia.hito && <span class="mt-0.5 block text-[8px] font-semibold leading-tight">{dia.hito}</span>}
			{dia.feriado && <span class="mt-0.5 block text-[8px] font-semibold leading-tight text-[#9a3412]">{dia.feriado}</span>}
			{dia.receso && !dia.feriado && <span class="mt-0.5 block text-[8px] leading-tight text-muted">{dia.receso}</span>}
			{dia.notas.slice(0, 2).map((nota) => (
				<span key={nota} class="mt-0.5 block text-[8px] leading-tight text-[#0f6798]">
					{nota}
				</span>
			))}
		</>
	);
}

function fondoDia(dia: DiaLectivo | null): string {
	if (!dia) return '';
	if (dia.feriado) return 'bg-[#fff6e8]';
	if (dia.receso) return 'bg-[#f3f4f6]';
	return 'bg-white';
}

function PortadaAgenda({ ctx, plan }: { ctx: ContextoHoja; plan: PlanLectivo }) {
	return (
		<div class="flex flex-1 flex-col">
			<div class="bg-azul px-6 py-8 text-white">
				<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-sol">Aulita</p>
				<h2 class="mt-2 text-4xl font-bold leading-none tracking-tight">Agenda docente</h2>
				<p class="mt-3 text-3xl font-bold text-sol">{plan.anio}</p>
			</div>
			<div class="h-1.5 bg-celeste" />
			<div class="mt-8 grid grid-cols-2 gap-x-8 gap-y-6">
				<DatoPortada etiqueta="Docente" valor={ctx.docente} />
				<DatoPortada etiqueta="Escuela" valor={ctx.escuela} />
				<DatoPortada etiqueta="Grado" valor={ctx.grado} />
				<DatoPortada etiqueta="Año" valor={String(plan.anio)} />
			</div>
			<p class="mt-6 text-base">
				{ctx.lugar} · Nivel {ctx.nivel.toLocaleLowerCase('es-AR')} · Turno {ctx.turno.toLocaleLowerCase('es-AR')}
			</p>
			<div class="mt-8 max-w-xs rounded-card border border-borde px-4 py-3">
				<p class="text-[11px] font-semibold uppercase tracking-wide text-muted">Días hábiles del ciclo</p>
				<p class="mt-1 text-4xl font-bold leading-none">{plan.totalHabiles}</p>
				<p class="mt-1 text-sm text-muted">{plan.estimados ? 'estimados' : 'de clase'}</p>
			</div>
			{ctx.provisorio && <AvisoFecha ctx={ctx} className="mt-6 max-w-sm" />}
			<p class="mt-auto pt-8 text-center text-[11px] text-muted">aulita.com.ar</p>
		</div>
	);
}

function DatoPortada({ etiqueta, valor }: { etiqueta: string; valor: string }) {
	return (
		<div class="border-b-2 border-azul pb-1">
			<p class="text-[10px] font-semibold uppercase tracking-wide text-muted">{etiqueta}</p>
			<p class="mt-1 min-h-7 text-xl font-semibold">{valor || '\u00a0'}</p>
		</div>
	);
}

function LineaDatos({ ctx }: { ctx: ContextoHoja }) {
	return (
		<p class="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px]">
			<span>Docente: {ctx.docente || '________________'}</span>
			<span>Grado: {ctx.grado}</span>
			<span>Escuela: {ctx.escuela || '________________'}</span>
		</p>
	);
}

function AvisoFecha({ ctx, className = '', texto }: { ctx: ContextoHoja; className?: string; texto?: string }) {
	return (
		<p class={`max-w-[13rem] rounded-md border border-dashed border-sol bg-sol-50 px-2 py-1 text-[10px] leading-snug ${className}`}>
			{texto ?? `Fechas provisorias · ${ctx.provincia} aún no publicó su calendario 2027`}
		</p>
	);
}

function Caja({ titulo, children }: { titulo: string; children: ComponentChildren }) {
	return (
		<section class="rounded-md border border-borde px-2 py-1.5">
			<h3 class="text-[10px] font-semibold uppercase tracking-wide text-muted">{titulo}</h3>
			<div class="mt-1">{children}</div>
		</section>
	);
}

function Renglones({ cantidad }: { cantidad: number }) {
	if (cantidad <= 0) return null;
	return (
		<div>
			{Array.from({ length: cantidad }, (_, indice) => (
				<div key={indice} class="mt-2 border-b border-borde" />
			))}
		</div>
	);
}

function Leyenda() {
	return (
		<ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
			<li class="inline-flex items-center gap-1">
				<span class="inline-block size-2.5 bg-[#fff6e8] ring-1 ring-[#f4a531]" /> Feriado
			</li>
			<li class="inline-flex items-center gap-1">
				<span class="font-semibold text-[#0f6798]">Efeméride</span>
			</li>
			<li class="inline-flex items-center gap-1">
				<span class="inline-block size-2.5 ring-2 ring-azul" /> Inicio/fin de clases
			</li>
		</ul>
	);
}

function PieFuente({ ctx }: { ctx: ContextoHoja }) {
	return (
		<p class="mt-auto pt-3 text-center text-[10px] leading-snug text-muted">
			aulita.com.ar · Fechas oficiales:{' '}
			<a class="text-azul underline" href={`/calendario-escolar-2027/${ctx.slug}/`}>
				calendario escolar 2027 de {ctx.provincia}
			</a>
			. Feriados por <a class="text-azul underline" href={LEY_FERIADOS}>Ley 27.399</a>.
		</p>
	);
}
