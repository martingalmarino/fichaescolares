import { render, type ComponentChildren } from 'preact';
import { provincias } from '../../data/provincias';
import {
	AREAS_POR_NIVEL,
	NIVEL_LABEL,
	etiquetaGrado,
	etiquetaTurno,
	leerAlumnos,
	leerCumpleanos,
	lugarProvincia,
	nombreCorto,
	opcionesDesdeParams,
	opcionesPlanificacionDesdeParams,
	opcionesAsistenciaDesdeParams,
	paginasDeAreas,
	paginasDeNombres,
	planDe,
	type DatosDocente,
	type OpcionesAsistencia,
	type OpcionesPlanificacion,
	type OpcionesPlanificador,
	type SeccionPlanificador,
	type VariantePlanificador,
} from '../../lib/planificador';
import { AvisoVistaPrevia, HOJAS_EN_VISTA } from '../preview';
import {
	HojaActos,
	HojaAsistencia,
	HojaAsistenciaMes,
	HojaCumpleanos,
	HojaMes,
	HojaPlan,
	HojaPlanificacionAnual,
	HojaPortada,
	HojaSemana,
	MarcoHoja,
	type ContextoHoja,
} from './Hojas';

const SLUGS = provincias.map((provincia) => provincia.slug);
const FILAS = 22;
const VACIO: DatosDocente = { docente: '', escuela: '', alumnos: '', cumpleanos: '' };

function paramsDe(search: string) {
	return new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
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

function contextoPlan(opciones: OpcionesPlanificador, datos: DatosDocente, estimados: boolean): ContextoHoja | null {
	const provincia = provincias.find((item) => item.slug === opciones.prov) ?? provincias.find((item) => item.slug === 'cordoba');
	if (!provincia) return null;
	return {
		docente: datos.docente.trim(),
		escuela: datos.escuela.trim(),
		grado: etiquetaGrado(opciones.nivel, opciones.grado),
		nivel: NIVEL_LABEL[opciones.nivel],
		turno: etiquetaTurno(opciones.turno),
		lugar: lugarProvincia(provincia),
		provincia: nombreCorto(provincia),
		slug: provincia.slug,
		provisorio: estimados,
		organizacion: opciones.periodos === 'trimestres' ? 'Organización por trimestres' : 'Organización por cuatrimestres',
		nivelId: opciones.nivel,
	};
}

function arbolPlanificador(variante: VariantePlanificador, opciones: OpcionesPlanificador, datos: DatosDocente, completas: boolean) {
	const provincia = provincias.find((item) => item.slug === opciones.prov) ?? provincias.find((item) => item.slug === 'cordoba');
	const plan = provincia ? planDe(provincia.slug, opciones.periodos) : null;
	if (!provincia || !plan) return null;
	const ctx = contextoPlan(opciones, datos, plan.estimados);
	if (!ctx) return null;
	const incluye = (id: SeccionPlanificador) => opciones.secciones.includes(id);
	const alumnos = leerAlumnos(datos.alumnos);
	const cumpleanos = leerCumpleanos(datos.cumpleanos);
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
		for (const semana of plan.semanas) hojas.push({ id: `semana-${semana.desde}`, nodo: <HojaSemana ctx={ctx} semana={semana} /> });
	}
	if (incluye('planificacion')) hojas.push({ id: 'plan', nodo: <HojaPlan ctx={ctx} plan={plan} /> });
	if (incluye('asistencia')) {
		trozos(alumnos).forEach((nombres, indice) => {
			hojas.push({
				id: `asistencia-${indice}`,
				nodo: <HojaAsistencia ctx={ctx} plan={plan} nombres={nombres} desde={indice * FILAS} />,
			});
		});
	}
	const visibles = completas ? hojas : hojas.slice(0, HOJAS_EN_VISTA);
	if (hojas.length === 0) return <p class="py-16 text-center text-sm text-muted">Elegí al menos una sección para armar la hoja.</p>;
	return (
		<>
			<AvisoVistaPrevia total={hojas.length} completas={completas} />
			<div class="grilla-hojas grid gap-6 xl:grid-cols-2">
				{visibles.map((hoja, indice) => (
					<MarcoHoja key={hoja.id} corte={indice < visibles.length - 1}>
						{hoja.nodo}
					</MarcoHoja>
				))}
			</div>
		</>
	);
}

function arbolPlanificacion(opciones: OpcionesPlanificacion, datos: DatosDocente, completas: boolean) {
	const provincia = provincias.find((item) => item.slug === opciones.prov) ?? provincias.find((item) => item.slug === 'cordoba');
	const plan = provincia ? planDe(provincia.slug, opciones.periodos) : null;
	if (!provincia || !plan) return null;
	const catalogo = AREAS_POR_NIVEL[opciones.nivel];
	const etiquetas = catalogo.filter((area) => opciones.areas.includes(area.id)).map((area) => area.label);
	const paginas = paginasDeAreas(etiquetas, opciones.orientacion);
	const ctx: ContextoHoja = {
		docente: datos.docente.trim(),
		escuela: datos.escuela.trim(),
		grado: etiquetaGrado(opciones.nivel, opciones.grado),
		nivel: NIVEL_LABEL[opciones.nivel],
		turno: '',
		lugar: lugarProvincia(provincia),
		provincia: nombreCorto(provincia),
		slug: provincia.slug,
		provisorio: plan.estimados,
		organizacion: opciones.periodos === 'trimestres' ? 'Organización por trimestres' : 'Organización por cuatrimestres',
		nivelId: opciones.nivel,
	};
	if (paginas.length === 0) return <p class="py-16 text-center text-sm text-muted">Elegí al menos un área para armar la hoja.</p>;
	const visibles = completas ? paginas : paginas.slice(0, HOJAS_EN_VISTA);
	return (
		<>
			<AvisoVistaPrevia total={paginas.length} completas={completas} />
			<div class="grid gap-6">
				{visibles.map((areas, indice) => (
					<MarcoHoja key={`${opciones.orientacion}-${indice}`} corte={indice < visibles.length - 1} apaisada={opciones.orientacion === 'horizontal'}>
						<HojaPlanificacionAnual ctx={ctx} plan={plan} areas={areas} orientacion={opciones.orientacion} pagina={indice + 1} total={paginas.length} />
					</MarcoHoja>
				))}
			</div>
		</>
	);
}

function arbolAsistencia(opciones: OpcionesAsistencia, datos: DatosDocente, completas: boolean) {
	const provincia = provincias.find((item) => item.slug === opciones.prov) ?? provincias.find((item) => item.slug === 'cordoba');
	const plan = provincia ? planDe(provincia.slug, 'trimestres') : null;
	if (!provincia || !plan) return null;
	const meses = opciones.mes === 'anio' ? plan.mesesCiclo : plan.mesesCiclo.filter((mes) => mes.mes === opciones.mes);
	const alumnos = leerAlumnos(datos.alumnos);
	const tandas = paginasDeNombres(alumnos, opciones.filas);
	const hojas = meses.flatMap((mes) =>
		tandas.map((nombres, indice) => ({
			id: `${mes.mes}-${indice}`,
			mes,
			nombres,
			desde: indice * opciones.filas,
			pagina: indice + 1,
			total: tandas.length,
		})),
	);
	const ctx: ContextoHoja = {
		docente: datos.docente.trim(),
		escuela: datos.escuela.trim(),
		grado: '',
		nivel: opciones.nivel === 'secundario' ? 'Secundaria' : 'Primaria',
		turno: '',
		lugar: '',
		provincia: nombreCorto(provincia),
		slug: provincia.slug,
		provisorio: plan.estimados,
		organizacion: '',
		nivelId: 'primario',
	};
	const visibles = completas ? hojas : hojas.slice(0, HOJAS_EN_VISTA);
	return (
		<>
			<AvisoVistaPrevia total={hojas.length} completas={completas} />
			<div class="grid gap-6">
				{visibles.map((hoja, indice) => (
					<MarcoHoja key={hoja.id} corte={indice < visibles.length - 1} apaisada>
						<HojaAsistenciaMes ctx={ctx} mes={hoja.mes} nombres={hoja.nombres} desde={hoja.desde} pagina={hoja.pagina} total={hoja.total} />
					</MarcoHoja>
				))}
			</div>
		</>
	);
}

export function VistaPlanificador({ variante = 'planificador', search = '' }: { variante?: VariantePlanificador; search?: string }) {
	return arbolPlanificador(variante, opcionesDesdeParams(paramsDe(search), SLUGS, variante), VACIO, false);
}

export function VistaPlanificacion({ search = '' }: { search?: string }) {
	return arbolPlanificacion(opcionesPlanificacionDesdeParams(paramsDe(search), SLUGS), VACIO, false);
}

export function VistaAsistencia({ search = '' }: { search?: string }) {
	return arbolAsistencia(opcionesAsistenciaDesdeParams(paramsDe(search), SLUGS), VACIO, false);
}

export function pintarPlanificador(
	destino: HTMLElement,
	variante: VariantePlanificador,
	opciones: OpcionesPlanificador,
	datos: DatosDocente,
	completas: boolean,
) {
	render(arbolPlanificador(variante, opciones, datos, completas), destino);
}

export function pintarPlanificacion(destino: HTMLElement, opciones: OpcionesPlanificacion, datos: DatosDocente, completas: boolean) {
	render(arbolPlanificacion(opciones, datos, completas), destino);
}

export function pintarAsistencia(destino: HTMLElement, opciones: OpcionesAsistencia, datos: DatosDocente, completas: boolean) {
	render(arbolAsistencia(opciones, datos, completas), destino);
}
