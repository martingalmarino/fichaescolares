import { actualizadoDe, recesosDe, vecinasDe, type CalendarioEscolar, type Jurisdiccion } from '../data/calendario-escolar';
import { efemerides } from '../data/efemerides';
import { provincias, type Provincia } from '../data/provincias';
import { LEY_FERIADOS, fechaCompleta, fechaDiaMes, feriadosDelAnio, partesIso, puentesDelAnio, type FeriadoCalculado } from './calendario';
import { h1CalendarioProvincia, lugarCalendario, nombreCalendario } from './meta';

export { LEY_FERIADOS };

export function ministerioDe(provincia: Provincia): string {
	if (provincia.slug === 'caba') return 'Ministerio de Educación de la Ciudad de Buenos Aires';
	if (provincia.slug === 'buenos-aires') return 'Ministerio de Educación de la provincia de Buenos Aires';
	if (provincia.slug === 'mendoza') return 'Dirección General de Escuelas (DGE)';
	return `Ministerio de Educación de ${nombreCalendario(provincia)}`;
}

/** Sujeto de la oración, con artículo. Mendoza publica por la DGE; el resto, por su ministerio. */
export function sujetoOrganismo(provincia: Provincia): string {
	if (provincia.slug === 'mendoza') return 'La Dirección General de Escuelas (DGE)';
	if (provincia.slug === 'caba') return 'El Ministerio de Educación porteño';
	if (provincia.slug === 'buenos-aires') return 'La Dirección General de Cultura y Educación (DGCyE)';
	return `El Ministerio de Educación de ${nombreCalendario(provincia)}`;
}

export function organismoCorto(provincia: Provincia): string {
	if (provincia.slug === 'mendoza') return 'la DGE';
	if (provincia.slug === 'caba') return 'el Ministerio de Educación porteño';
	if (provincia.slug === 'buenos-aires') return 'la DGCyE';
	return 'el Ministerio de Educación';
}

export function keywordsProvincia(provincia: Provincia, anio: number): string[] {
	const clave = nombreCalendario(provincia)
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
	return [
		`calendario escolar ${anio} ${clave}`,
		`inicio de clases ${anio} ${clave}`,
		`ciclo lectivo ${anio} ${clave}`,
		`vacaciones de invierno ${anio} ${clave}`,
	];
}

/** La resolución 197/2026 fija la vuelta a clases el lunes posterior al receso. */
const VUELTA_CORDOBA_2027 = '2027-07-26';

export function keywordsCordoba(anio: number): string[] {
	return [
		`calendario escolar ${anio} córdoba`,
		`inicio de clases ${anio} córdoba`,
		`vacaciones de invierno ${anio} córdoba`,
		`fin de clases ${anio} córdoba`,
		'resolución 197/2026',
	];
}

export function fechaActualizado(iso: string): string {
	const { anio, mes, dia } = partesIso(iso);
	return fechaDiaMes(dia, mes) + ` de ${anio}`;
}

/** «lunes 1 de marzo», sin el año. */
function fechaSinAnio(iso: string): string {
	const { anio, mes, dia } = partesIso(iso);
	return fechaCompleta(anio, mes, dia).replace(` de ${anio}`, '');
}

function fechaBarra(iso: string): string {
	const [anio, mes, dia] = iso.split('-');
	return `${dia}/${mes}/${anio}`;
}

export function fechaTarjeta(iso: string | null): string {
	if (!iso) return 'A confirmar';
	const { anio, mes, dia } = partesIso(iso);
	return fechaCompleta(anio, mes, dia);
}

export function rangoTarjeta(desde: string | null, hasta: string | null): string {
	if (!desde || !hasta) return 'A confirmar';
	const inicio = partesIso(desde);
	const fin = partesIso(hasta);
	if (inicio.mes === fin.mes) return `${inicio.dia} al ${fin.dia} de ${fechaDiaMes(fin.dia, fin.mes).split(' de ')[1]}`;
	return `${fechaDiaMes(inicio.dia, inicio.mes)} al ${fechaDiaMes(fin.dia, fin.mes)}`;
}

/** Fechas que el ministerio anunció y que todavía no son el calendario oficial. */
export function fechasAnunciadas(jurisdiccion: Jurisdiccion | undefined): boolean {
	if (!jurisdiccion || jurisdiccion.estado === 'oficial') return false;
	return Boolean(jurisdiccion.inicio || jurisdiccion.fin || jurisdiccion.invierno.desde || jurisdiccion.invierno.hasta);
}

/** «12 al 23 de julio», o «desde el 12 de julio» si no se anunció el fin. */
export function textoReceso(desde: string | null, hasta: string | null): string {
	if (desde && hasta) return rangoTarjeta(desde, hasta);
	if (desde) {
		const inicio = partesIso(desde);
		return `desde el ${fechaDiaMes(inicio.dia, inicio.mes)}`;
	}
	return 'A confirmar';
}

export function tarjetasFechas(provincia: Provincia, jurisdiccion: Jurisdiccion): { etiqueta: string; valor: string; detalle: string | null }[] {
	const anunciado = fechasAnunciadas(jurisdiccion);
	const visible = anunciado || jurisdiccion.estado === 'oficial';
	const invierno = jurisdiccion.invierno;
	let valorInvierno = 'A confirmar';
	let detalleInvierno: string | null = null;
	if (invierno.desde && invierno.hasta) {
		valorInvierno = rangoTarjeta(invierno.desde, invierno.hasta);
		if (anunciado) detalleInvierno = 'Previsto';
	} else if (invierno.desde) {
		valorInvierno = `Previsto desde el ${fechaTarjeta(invierno.desde)}`;
		detalleInvierno = 'La fecha de fin no se anunció';
	}
	return [
		{
			etiqueta: 'Inicio de clases',
			valor: fechaTarjeta(visible ? jurisdiccion.inicio : null),
			detalle: anunciado && jurisdiccion.inicio ? `Anunciado por el ${ministerioDe(provincia)}` : null,
		},
		{
			etiqueta: 'Vacaciones de invierno',
			valor: visible ? valorInvierno : 'A confirmar',
			detalle: detalleInvierno,
		},
		{
			etiqueta: 'Fin del ciclo lectivo',
			valor: jurisdiccion.fin ? fechaTarjeta(jurisdiccion.fin) : anunciado ? 'A definir' : 'A confirmar',
			detalle: null,
		},
	];
}

/** Aviso de un anuncio que todavía no es resolución. */
export function avisoAnuncio(provincia: Provincia, jurisdiccion: Jurisdiccion): string {
	const partes: string[] = [];
	if (jurisdiccion.inicio) partes.push(`${sujetoOrganismo(provincia)} anunció el inicio de clases para el ${fechaTarjeta(jurisdiccion.inicio)}.`);
	partes.push('Todavía no hay resolución.');
	if (jurisdiccion.invierno.desde && !jurisdiccion.invierno.hasta) {
		partes.push(`El receso de invierno está previsto desde el ${fechaTarjeta(jurisdiccion.invierno.desde)} y no se anunció la fecha de fin.`);
	} else if (jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		partes.push(`El receso de invierno previsto es del ${rangoTarjeta(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)}.`);
	}
	if (!jurisdiccion.fin) partes.push('El fin del ciclo está a definir.');
	partes.push('Estas fechas no son el calendario oficial.');
	return partes.join(' ');
}

const MESES_GRILLA = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

/** «1 mar», «11 dic». Para las tarjetas de la grilla nacional. */
export function fechaCorta(iso: string): string {
	const { mes, dia } = partesIso(iso);
	return `${dia} ${MESES_GRILLA[mes - 1] ?? ''}`;
}

/** Regiones de la grilla. El campo `region` de cada provincia no coincide con este corte. */
export const regionesEscolares = [
	{ id: 'centro', nombre: 'Centro', slugs: ['buenos-aires', 'caba', 'cordoba', 'entre-rios', 'la-pampa', 'santa-fe'] },
	{ id: 'noa', nombre: 'NOA', slugs: ['catamarca', 'jujuy', 'la-rioja', 'salta', 'santiago-del-estero', 'tucuman'] },
	{ id: 'nea', nombre: 'NEA', slugs: ['chaco', 'corrientes', 'formosa', 'misiones'] },
	{ id: 'cuyo', nombre: 'Cuyo', slugs: ['mendoza', 'san-juan', 'san-luis'] },
	{ id: 'patagonia', nombre: 'Patagonia', slugs: ['chubut', 'neuquen', 'rio-negro', 'santa-cruz', 'tierra-del-fuego'] },
] as const;

export function fraseProvincia(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): string {
	const lugar = lugarCalendario(provincia);
	if (fechasAnunciadas(jurisdiccion) && jurisdiccion.inicio) {
		const inicio = partesIso(jurisdiccion.inicio);
		const invierno =
			jurisdiccion.invierno.desde && !jurisdiccion.invierno.hasta
				? ` El receso de invierno está previsto desde el <time datetime="${jurisdiccion.invierno.desde}">${fechaCompleta(partesIso(jurisdiccion.invierno.desde).anio, partesIso(jurisdiccion.invierno.desde).mes, partesIso(jurisdiccion.invierno.desde).dia)}</time>.`
				: '';
		const fin = jurisdiccion.fin ? '' : ' El fin del ciclo está a definir.';
		return `En ${lugar} las clases ${anio} empiezan el <time datetime="${jurisdiccion.inicio}">${fechaCompleta(inicio.anio, inicio.mes, inicio.dia)}</time>, anunciado por el ${ministerioDe(provincia)}.${invierno}${fin} Todavía no hay resolución.`;
	}
	if (jurisdiccion.estado === 'oficial' && jurisdiccion.inicio && jurisdiccion.fin && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		const inicio = partesIso(jurisdiccion.inicio);
		const fin = partesIso(jurisdiccion.fin);
		const desde = partesIso(jurisdiccion.invierno.desde);
		const hasta = partesIso(jurisdiccion.invierno.hasta);
		return `En ${lugar} las clases ${anio} empiezan el <time datetime="${jurisdiccion.inicio}">${fechaCompleta(inicio.anio, inicio.mes, inicio.dia)}</time> y terminan el <time datetime="${jurisdiccion.fin}">${fechaCompleta(fin.anio, fin.mes, fin.dia)}</time>. Las vacaciones de invierno son del <time datetime="${jurisdiccion.invierno.desde}">${fechaCompleta(desde.anio, desde.mes, desde.dia)}</time> al <time datetime="${jurisdiccion.invierno.hasta}">${fechaCompleta(hasta.anio, hasta.mes, hasta.dia)}</time>.`;
	}
	const en = provincia.slug === 'caba' || provincia.slug === 'buenos-aires' ? lugar : nombreCalendario(provincia);
	return `Las clases ${anio} en ${en} todavía no tienen fecha oficial: ${sujetoOrganismo(provincia)} aún no publicó el calendario. Abajo están los feriados nacionales ${anio} ya confirmados por ley.`;
}

export function etiquetaFeriado(feriado: FeriadoCalculado): string {
	const cuando = fechaCompleta(feriado.anio, feriado.mes, feriado.dia);
	const traslado = feriado.trasladadoDesde ? `, trasladado del ${fechaDiaMes(feriado.trasladadoDesde.dia, feriado.trasladadoDesde.mes)}` : '';
	const clase = feriado.noLaborable ? ' (día no laborable)' : '';
	return `${cuando}${traslado}${clase}`;
}

export function feriadosNacionales(anio: number): FeriadoCalculado[] {
	return feriadosDelAnio(anio);
}

export function notaPuentes(anio: number): string | null {
	if (puentesDelAnio(anio).length > 0) return null;
	return `Los feriados puente ${anio} se definen por decreto y se agregan cuando se publiquen.`;
}

function listaFeriados(anio: number): string {
	return feriadosDelAnio(anio)
		.map((feriado) => `${etiquetaFeriado(feriado)}: ${feriado.titulo}`)
		.join('. ');
}

/** Una sola fecha de jurisdicción, repetida por nivel. Si no es oficial, las tres quedan a confirmar. */
export function cuadroBuenosAires(jurisdiccion: Jurisdiccion) {
	const oficial = jurisdiccion.estado === 'oficial';
	const inicio = fechaTarjeta(oficial ? jurisdiccion.inicio : null);
	const invierno = rangoTarjeta(oficial ? jurisdiccion.invierno.desde : null, oficial ? jurisdiccion.invierno.hasta : null);
	const fin = fechaTarjeta(oficial ? jurisdiccion.fin : null);
	return [
		{ clave: 'Inicio de clases', inicial: inicio, primaria: inicio, secundaria: inicio },
		{ clave: 'Vacaciones de invierno', inicial: invierno, primaria: invierno, secundaria: invierno },
		{ clave: 'Fin de clases', inicial: fin, primaria: fin, secundaria: fin },
	];
}

/** Respuesta directa bajo el H1 de la Provincia de Buenos Aires. 40 a 60 palabras si la DGCyE no publicó. */
export function introBuenosAires(jurisdiccion: Jurisdiccion, anio: number): string {
	if (jurisdiccion.estado === 'oficial' && jurisdiccion.inicio) {
		return `¿Cuándo empiezan las clases en ${anio} en la Provincia de Buenos Aires? La DGCyE fijó el inicio el ${fechaTarjeta(jurisdiccion.inicio)}. El cuadro muestra las vacaciones de invierno y el fin de clases por nivel. La Ciudad de Buenos Aires publica otro calendario.`;
	}
	return `¿Cuándo empiezan las clases en ${anio} en la Provincia de Buenos Aires? La Dirección General de Cultura y Educación (DGCyE) todavía no publicó el calendario oficial. No hay fecha de inicio, de vacaciones de invierno ni de fin de clases, tampoco por nivel. Esta página no adelanta fechas estimadas.`;
}

export function preguntasBuenosAires(jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	const oficial = jurisdiccion.estado === 'oficial';
	const caba = `La Ciudad Autónoma de Buenos Aires tiene otro calendario: <a href="/calendario-escolar-${anio}/caba/">calendario escolar ${anio} de CABA</a>.`;
	const inicio =
		oficial && jurisdiccion.inicio
			? `El ciclo lectivo ${anio} en la Provincia de Buenos Aires empieza el ${fechaTarjeta(jurisdiccion.inicio)}, según la DGCyE. ${caba}`
			: `La DGCyE todavía no publicó el inicio del ciclo lectivo ${anio} en la Provincia de Buenos Aires. No hay una fecha oficial ni una estimada. ${caba}`;
	const invierno =
		oficial && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta
			? `Las vacaciones de invierno ${anio} en la Provincia de Buenos Aires van del ${fechaTarjeta(jurisdiccion.invierno.desde)} al ${fechaTarjeta(jurisdiccion.invierno.hasta)}, según la DGCyE.`
			: `Las vacaciones de invierno ${anio} en la Provincia de Buenos Aires las fija la DGCyE. Todavía no hay fechas oficiales ni estimadas.`;
	const fin =
		oficial && jurisdiccion.fin
			? `Las clases ${anio} en la Provincia de Buenos Aires terminan el ${fechaTarjeta(jurisdiccion.fin)}. La resolución cargada no distingue el fin de inicial, primaria y secundaria.`
			: `La DGCyE todavía no publicó cuándo terminan las clases ${anio}, ni el fin por nivel (inicial, primaria y secundaria). En el cuadro figuran como a confirmar.`;
	return [
		{ q: `¿Cuándo empieza el ciclo lectivo ${anio} en PBA?`, a: inicio },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en Buenos Aires?`, a: invierno },
		{ q: `¿Cuándo terminan las clases ${anio}?`, a: fin },
	];
}

/** Respuesta directa bajo el H1 de CABA. 40 a 60 palabras si el ministerio porteño no publicó la Agenda Educativa. */
export function introCaba(jurisdiccion: Jurisdiccion, anio: number, actualizado?: string): string {
	if (
		jurisdiccion.estado === 'oficial' &&
		jurisdiccion.inicio &&
		jurisdiccion.fin &&
		jurisdiccion.invierno.desde &&
		jurisdiccion.invierno.hasta
	) {
		const secundario = jurisdiccion.inicioSecundario ? fechaSinAnio(jurisdiccion.inicioSecundario) : null;
		const nivel = secundario
			? `empiezan el ${fechaSinAnio(jurisdiccion.inicio)} en nivel inicial y primario, y el ${secundario} en secundario`
			: `empiezan el ${fechaSinAnio(jurisdiccion.inicio)}`;
		const docentes = jurisdiccion.vueltaDocentes
			? ` Los docentes vuelven a las escuelas el ${fechaDiaMes(partesIso(jurisdiccion.vueltaDocentes).dia, partesIso(jurisdiccion.vueltaDocentes).mes)}.`
			: '';
		const fuente = actualizado ? ` Fuente: Gobierno de la Ciudad, ${fechaBarra(actualizado)}.` : '';
		return `Las clases ${anio} en la Ciudad de Buenos Aires ${nivel}. El receso de invierno es del ${rangoTarjeta(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)}, y el ciclo lectivo termina el ${fechaSinAnio(jurisdiccion.fin)}.${docentes}${fuente}`;
	}
	return `La Agenda Educativa es el calendario oficial de la Ciudad de Buenos Aires. ¿Cuándo empiezan las clases en ${anio}? El Ministerio de Educación porteño todavía no publicó la Agenda Educativa ${anio}. No hay fecha de inicio ni de vacaciones de invierno, y esta página no adelanta fechas estimadas.`;
}

export function inviernoCaba(jurisdiccion: Jurisdiccion, anio: number): string {
	if (jurisdiccion.estado === 'oficial' && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		return `Las vacaciones de invierno ${anio} en CABA van del ${fechaTarjeta(jurisdiccion.invierno.desde)} al ${fechaTarjeta(jurisdiccion.invierno.hasta)}, según la Agenda Educativa publicada por el Ministerio de Educación porteño.`;
	}
	return `Las vacaciones de invierno ${anio} en CABA todavía no tienen fecha. El Ministerio de Educación porteño no publicó la Agenda Educativa ${anio}, y esta página no muestra un receso estimado.`;
}

export function preguntasCaba(jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	const oficial = jurisdiccion.estado === 'oficial';
	const provincia = `La Provincia de Buenos Aires tiene otro calendario: <a href="/calendario-escolar-${anio}/buenos-aires/">calendario escolar ${anio} de la Provincia de Buenos Aires</a>.`;
	if (oficial && jurisdiccion.inicio && jurisdiccion.fin && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		const inicio = `Las clases ${anio} en CABA empiezan el ${fechaSinAnio(jurisdiccion.inicio)} en nivel inicial y primario. ${provincia}`;
		const secundario = jurisdiccion.inicioSecundario
			? `El secundario ${anio} en CABA empieza el ${fechaSinAnio(jurisdiccion.inicioSecundario)}.`
			: `La resolución cargada no publica un inicio distinto para el secundario. ${jurisdiccion.notas ?? ''}`.trim();
		const invierno = `Las vacaciones de invierno ${anio} en CABA van del ${fechaTarjeta(jurisdiccion.invierno.desde)} al ${fechaTarjeta(jurisdiccion.invierno.hasta)}, según la Agenda Educativa.`;
		const fin = `Las clases ${anio} en CABA terminan el ${fechaSinAnio(jurisdiccion.fin)}.`;
		const docentes = jurisdiccion.vueltaDocentes
			? `Los docentes vuelven a las escuelas el ${fechaDiaMes(partesIso(jurisdiccion.vueltaDocentes).dia, partesIso(jurisdiccion.vueltaDocentes).mes)} de ${partesIso(jurisdiccion.vueltaDocentes).anio}.`
			: (jurisdiccion.notas ?? 'La resolución cargada no fecha la vuelta de los docentes.');
		return [
			{ q: `¿Cuándo empiezan las clases ${anio} en CABA?`, a: inicio },
			{ q: `¿Cuándo empieza el secundario ${anio} en CABA?`, a: secundario },
			{ q: `¿Cuándo son las vacaciones de invierno ${anio} en CABA?`, a: invierno },
			{ q: `¿Cuándo terminan las clases ${anio} en CABA?`, a: fin },
			{ q: `¿Cuándo vuelven los docentes en ${anio}?`, a: docentes },
		];
	}
	const queEs = `Es el nombre oficial del calendario escolar de la Ciudad de Buenos Aires. La publica el Ministerio de Educación porteño. La Agenda Educativa ${anio} todavía no salió, así que esta página no muestra fechas como oficiales. ${provincia}`;
	const inicio = `El Ministerio de Educación porteño todavía no publicó el inicio de clases ${anio}. No hay una fecha oficial ni una estimada.`;
	const invierno = `Todavía no hay fechas oficiales de las vacaciones de invierno ${anio} en CABA. El ministerio no publicó la Agenda Educativa ${anio}, y esta página no estima el receso.`;
	return [
		{ q: `¿Qué es la Agenda Educativa ${anio}?`, a: queEs },
		{ q: `¿Cuándo empiezan las clases ${anio} en CABA?`, a: inicio },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en CABA?`, a: invierno },
	];
}

/** Respuesta directa bajo el H1 de Córdoba cuando la Resolución 197/2026 está cargada. */
export function introCordoba(jurisdiccion: Jurisdiccion, anio: number): string {
	if (jurisdiccion.estado === 'oficial' && jurisdiccion.inicio && jurisdiccion.fin && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		return `Las clases ${anio} en Córdoba comienzan el ${fechaSinAnio(jurisdiccion.inicio)} y terminan el ${fechaSinAnio(jurisdiccion.fin)}. Las vacaciones de invierno son del ${rangoTarjeta(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)}, según la Resolución 197/2026 del Ministerio de Educación.`;
	}
	return `¿Cuándo empiezan las clases en ${anio} en Córdoba? El Ministerio de Educación de Córdoba todavía no publicó el calendario oficial. No hay fecha de inicio, de vacaciones de invierno ni de fin de clases. Esta página no adelanta fechas estimadas.`;
}

export function preguntasCordoba(jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	const oficial = jurisdiccion.estado === 'oficial' && jurisdiccion.inicio && jurisdiccion.fin && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta;
	if (!oficial || !jurisdiccion.inicio || !jurisdiccion.fin || !jurisdiccion.invierno.desde || !jurisdiccion.invierno.hasta) {
		return preguntasGenericas(provincias.find((provincia) => provincia.slug === 'cordoba')!, jurisdiccion, anio);
	}
	const docentes = jurisdiccion.vueltaDocentes
		? `Los docentes y directivos se reincorporan el ${fechaSinAnio(jurisdiccion.vueltaDocentes)} de ${partesIso(jurisdiccion.vueltaDocentes).anio}.`
		: 'La resolución cargada no fecha la vuelta de los docentes.';
	const vueltaClases = anio === 2027 ? ` Las clases vuelven el ${fechaSinAnio(VUELTA_CORDOBA_2027)}.` : '';
	return [
		{
			q: `¿Cuándo empiezan las clases ${anio} en Córdoba?`,
			a: `Las clases ${anio} en Córdoba empiezan el ${fechaSinAnio(jurisdiccion.inicio)} para Inicial, Primario, Secundario y modalidades, según la Resolución 197/2026.`,
		},
		{
			q: `¿Cuándo son las vacaciones de invierno ${anio} en Córdoba?`,
			a: `Las vacaciones de invierno ${anio} en Córdoba son del ${rangoTarjeta(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)}.${vueltaClases}`,
		},
		{
			q: `¿Cuándo terminan las clases ${anio} en Córdoba?`,
			a: `Las clases ${anio} en Córdoba terminan el ${fechaSinAnio(jurisdiccion.fin)}, según la Resolución 197/2026.`,
		},
		{ q: '¿Cuándo vuelven los docentes?', a: docentes },
		{
			q: '¿Cuántos días de clase hay?',
			a: `El calendario escolar ${anio} de Córdoba fija un mínimo de 190 días de clase, según la Resolución 197/2026.`,
		},
	];
}

/** Respuesta directa bajo el H1. 40 a 60 palabras si el organismo todavía no publicó fechas. */
export function introProvincia(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): string {
	const lugar = lugarCalendario(provincia);
	const sujeto = sujetoOrganismo(provincia);
	if (provincia.slug === 'santa-fe' && fechasAnunciadas(jurisdiccion) && jurisdiccion.inicio) {
		const invierno =
			jurisdiccion.invierno.desde && !jurisdiccion.invierno.hasta
				? ` El receso de invierno está previsto desde el ${fechaTarjeta(jurisdiccion.invierno.desde)}; no se anunció el fin.`
				: '';
		const fin = jurisdiccion.fin ? '' : ' El fin del ciclo lectivo está a definir.';
		return `¿Cuándo empiezan las clases ${anio} en Santa Fe? El ${fechaTarjeta(jurisdiccion.inicio)}, anunciado por el ${ministerioDe(provincia)}.${invierno}${fin} Todavía no hay resolución.`;
	}
	if (jurisdiccion.estado === 'oficial' && jurisdiccion.inicio) {
		return `¿Cuándo empiezan las clases en ${anio} en ${lugar}? ${sujeto} fijó el inicio el ${fechaTarjeta(jurisdiccion.inicio)}. En esta página están las vacaciones de invierno y el fin de clases de ese calendario oficial. No se adelantan fechas de otra fuente.`;
	}
	return `¿Cuándo empiezan las clases en ${anio} en ${lugar}? ${sujeto} todavía no publicó el calendario oficial. No hay fecha de inicio, de vacaciones de invierno ni de fin de clases. Esta página no adelanta fechas estimadas.`;
}

export function preguntasProvincia(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	if (provincia.slug === 'buenos-aires') return preguntasBuenosAires(jurisdiccion, anio);
	if (provincia.slug === 'caba') return preguntasCaba(jurisdiccion, anio);
	if (provincia.slug === 'cordoba' && jurisdiccion.estado === 'oficial') return preguntasCordoba(jurisdiccion, anio);
	if (provincia.slug === 'santa-fe' && fechasAnunciadas(jurisdiccion)) return preguntasSantaFe(jurisdiccion, anio);
	return preguntasGenericas(provincia, jurisdiccion, anio);
}

export function preguntasSantaFe(jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	const fuente = jurisdiccion.fuente
		? `El anuncio está en <a href="${jurisdiccion.fuente}" rel="noopener noreferrer">Rafaela Noticias</a>. El calendario oficial lo publica el Ministerio de Educación de Santa Fe y todavía no hay resolución.`
		: 'El Ministerio de Educación de Santa Fe publica el calendario oficial. Todavía no hay resolución.';
	const invierno = jurisdiccion.invierno.desde
		? `Están previstas desde el ${fechaTarjeta(jurisdiccion.invierno.desde)}, la semana posterior al 9 de julio. No se anunció la fecha de fin del receso y la oficialización sigue pendiente.`
		: `El Ministerio de Educación de Santa Fe todavía no anunció las vacaciones de invierno ${anio}.`;
	return [
		{
			q: `¿Cuándo empiezan las clases ${anio} en Santa Fe?`,
			a: `El ${fechaTarjeta(jurisdiccion.inicio)}. Lo anunció el Ministerio de Educación de Santa Fe el 24 de noviembre de 2026. Todavía no hay resolución, así que no es la fecha oficial del calendario.`,
		},
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en Santa Fe?`, a: invierno },
		{
			q: `¿Cuándo terminan las clases ${anio} en Santa Fe?`,
			a: `El fin del ciclo lectivo ${anio} en Santa Fe está a definir. La meta anunciada son 190 días de clase y el Ministerio todavía no publicó la fecha de cierre.`,
		},
		{
			q: `¿El calendario escolar ${anio} de Santa Fe ya es oficial?`,
			a: 'No. El ministro de Educación José Goity anunció el inicio el 24 de noviembre de 2026, en la inauguración de la EETP N.º 481. El receso de invierno quedó previsto y todavía no hay resolución.',
		},
		{
			q: `¿Qué feriados nacionales hay en ${anio}?`,
			a: `${listaFeriados(anio)}. Los fija la <a href="${LEY_FERIADOS}" rel="noopener noreferrer">Ley 27.399</a>. ${notaPuentes(anio) ?? ''}`,
		},
		{ q: `¿Dónde se publicó el anuncio del ciclo lectivo ${anio} de Santa Fe?`, a: fuente },
	];
}

function preguntasGenericas(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	const lugar = lugarCalendario(provincia);
	const nombre = nombreCalendario(provincia);
	const ministerio = ministerioDe(provincia);
	const sujeto = sujetoOrganismo(provincia);
	const segun = organismoCorto(provincia);
	const pendiente = `${sujeto} todavía no lo publicó. No hay una fecha oficial ni una estimada.`;
	const inicio = jurisdiccion.estado === 'oficial' && jurisdiccion.inicio ? `Las clases ${anio} en ${lugar} empiezan el ${fechaTarjeta(jurisdiccion.inicio)}, según ${segun}.` : pendiente;
	const invierno =
		jurisdiccion.estado === 'oficial' && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta
			? `Las vacaciones de invierno ${anio} en ${lugar} son del ${fechaTarjeta(jurisdiccion.invierno.desde)} al ${fechaTarjeta(jurisdiccion.invierno.hasta)}, según ${segun}.`
			: pendiente;
	const fin = jurisdiccion.estado === 'oficial' && jurisdiccion.fin ? `Las clases ${anio} en ${lugar} terminan el ${fechaTarjeta(jurisdiccion.fin)}, según ${segun}.` : pendiente;
	const fuente = jurisdiccion.fuente
		? `La fuente oficial es el <a href="${jurisdiccion.fuente}" rel="noopener noreferrer">${ministerio}</a>.`
		: `${sujeto} lo publica. Todavía no hay una resolución cargada en esta página.`;
	return [
		{ q: `¿Cuándo empiezan las clases en ${nombre} en ${anio}?`, a: inicio },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en ${nombre}?`, a: invierno },
		{ q: `¿Cuándo terminan las clases ${anio} en ${nombre}?`, a: fin },
		{
			q: `¿Qué feriados nacionales hay en ${anio}?`,
			a: `${listaFeriados(anio)}. Los fija la <a href="${LEY_FERIADOS}" rel="noopener noreferrer">Ley 27.399</a>. ${notaPuentes(anio) ?? ''}`,
		},
		{ q: `¿Dónde se publica el calendario escolar oficial de ${nombre}?`, a: fuente },
		{
			q: `¿Puedo imprimir el calendario escolar ${anio}?`,
			a: `Sí. El botón Imprimir en A4 arma una hoja horizontal con el calendario escolar ${anio} de ${lugar}, las tres fechas clave y los doce meses.`,
		},
	];
}

function jurisdiccionesOficiales(calendario: CalendarioEscolar) {
	return provincias.filter((provincia) => calendario.jurisdicciones[provincia.slug]?.estado === 'oficial');
}

function provinciasAnunciadas(calendario: CalendarioEscolar): Provincia[] {
	return provincias.filter((provincia) => fechasAnunciadas(calendario.jurisdicciones[provincia.slug]));
}

function clausulaAnuncio(calendario: CalendarioEscolar, anunciadas: Provincia[], oficiales: Provincia[]): string {
	if (anunciadas.length === 0) return '';
	const iniciosOficiales = oficiales.map((provincia) => calendario.jurisdicciones[provincia.slug]?.inicio).filter((inicio): inicio is string => Boolean(inicio));
	const mismo =
		anunciadas.length === 1 &&
		iniciosOficiales.length > 0 &&
		iniciosOficiales.every((inicio) => inicio === calendario.jurisdicciones[anunciadas[0]!.slug]?.inicio);
	if (mismo) return `${nombreCalendario(anunciadas[0]!)} anunció el mismo inicio, sin resolución.`;
	const nombres = anunciadas.map((provincia) => nombreCalendario(provincia));
	const lista = nombres.length === 1 ? nombres[0]! : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`;
	return `${lista} ${anunciadas.length === 1 ? 'anunció fechas' : 'anunciaron fechas'}, sin resolución.`;
}

function cierrePendientes(calendario: CalendarioEscolar, anunciadas: Provincia[], oficiales: Provincia[], pendientes: number): string {
	const aviso = clausulaAnuncio(calendario, anunciadas, oficiales);
	if (aviso) return `${aviso} ${pendientes} jurisdicciones figuran como a confirmar, sin fechas estimadas. Elegí tu provincia para ver el detalle.`;
	return `${pendientes} jurisdicciones todavía no publicaron el calendario y figuran como a confirmar, sin fechas estimadas. Elegí tu provincia para ver el detalle.`;
}

/** Respuesta directa bajo el H1. 40 a 60 palabras cuando ninguna jurisdicción publicó fechas. */
export function introCalendarioNacional(calendario: CalendarioEscolar): string {
	const anio = calendario.anio;
	const oficiales = jurisdiccionesOficiales(calendario).filter((provincia) => calendario.jurisdicciones[provincia.slug]?.inicio);
	const anunciadas = provinciasAnunciadas(calendario);
	const pendientes = provincias.length - oficiales.length - anunciadas.length;
	if (oficiales.length === 0) {
		if (anunciadas.length === 0) {
			return `¿Cuándo empiezan las clases en ${anio}? Todavía no hay una fecha oficial: ninguna de las 24 jurisdicciones publicó su calendario. Cada provincia y la Ciudad de Buenos Aires fijan su propio inicio, y esta página no adelanta fechas estimadas. El inicio, las vacaciones de invierno y el fin del ciclo se cargan cuando sale la resolución de cada ministerio.`;
		}
		return `¿Cuándo empiezan las clases en ${anio}? Todavía no hay calendario oficial. ${cierrePendientes(calendario, anunciadas, oficiales, pendientes)}`;
	}
	const inicios = oficiales.map((provincia) => calendario.jurisdicciones[provincia.slug]!.inicio!).sort();
	const desde = fechaTarjeta(inicios[0] ?? null);
	const hasta = fechaTarjeta(inicios[inicios.length - 1] ?? null);
	if (pendientes === 0 && anunciadas.length === 0) {
		return `¿Cuándo empiezan las clases en ${anio}? El inicio oficial va del ${desde} al ${hasta}, según la provincia. Las 24 jurisdicciones ya publicaron su calendario. En la tabla están el inicio, las vacaciones de invierno y el fin del ciclo de cada una.`;
	}
	const cierre = cierrePendientes(calendario, anunciadas, oficiales, pendientes);
	if (oficiales.length === 1) {
		const unica = oficiales[0]!;
		const lugar = unica.slug === 'caba' ? 'la Ciudad de Buenos Aires' : lugarCalendario(unica);
		return `¿Cuándo empiezan las clases en ${anio}? En ${lugar} el inicio oficial es el ${desde}. ${cierre}`;
	}
	if (desde === hasta) {
		const lugares = oficiales.map((provincia) => (provincia.slug === 'caba' ? 'la Ciudad de Buenos Aires' : lugarCalendario(provincia)));
		const donde = lugares.length === 2 ? `${lugares[0]} y en ${lugares[1]}` : lugares.join(', ');
		return `¿Cuándo empiezan las clases en ${anio}? En ${donde} el inicio oficial es el ${desde}. ${cierre}`;
	}
	return `¿Cuándo empiezan las clases en ${anio}? Donde ya hay calendario oficial, el inicio va del ${desde} al ${hasta}. ${cierre}`;
}

export function filasResumen(calendario: CalendarioEscolar) {
	return provincias
		.map((provincia) => {
			const jurisdiccion = calendario.jurisdicciones[provincia.slug];
			if (!jurisdiccion) throw new Error(`Falta el calendario de ${provincia.slug}`);
			const oficial = jurisdiccion.estado === 'oficial';
			const anunciado = fechasAnunciadas(jurisdiccion);
			return {
				provincia,
				href: `/calendario-escolar-${calendario.anio}/${provincia.slug}/`,
				inicio: fechaTarjeta(oficial || anunciado ? jurisdiccion.inicio : null),
				invierno: oficial || anunciado ? textoReceso(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta) : 'A confirmar',
				fin: jurisdiccion.fin ? fechaTarjeta(jurisdiccion.fin) : anunciado ? 'A definir' : 'A confirmar',
				estado: oficial ? 'Oficial' : anunciado ? 'Anunciado' : 'A confirmar',
			};
		})
		.sort((a, b) => nombreCalendario(a.provincia).localeCompare(nombreCalendario(b.provincia), 'es'));
}

export function preguntasNacional(calendario: CalendarioEscolar): { q: string; a: string }[] {
	const anio = calendario.anio;
	const oficiales = jurisdiccionesOficiales(calendario);
	const anunciadas = provinciasAnunciadas(calendario);
	const nombres = oficiales.map((provincia) => nombreCalendario(provincia)).join(', ');
	const fraseInicioAnunciado = anunciadas
		.filter((provincia) => calendario.jurisdicciones[provincia.slug]?.inicio)
		.map((provincia) => `${nombreCalendario(provincia)} anunció el inicio el ${fechaTarjeta(calendario.jurisdicciones[provincia.slug]!.inicio)}, sin resolución`)
		.join('. ');
	const previstos = anunciadas.filter((provincia) => {
		const item = calendario.jurisdicciones[provincia.slug];
		return Boolean(item?.invierno.desde && !item.invierno.hasta);
	});
	const frasePrevisto = previstos
		.map((provincia) => `En ${nombreCalendario(provincia)} el receso está previsto desde el ${fechaTarjeta(calendario.jurisdicciones[provincia.slug]!.invierno.desde)}, sin fecha de fin`)
		.join('. ');
	const inicio =
		oficiales.length === 0
			? fraseInicioAnunciado
				? `${fraseInicioAnunciado}. El resto de las jurisdicciones sigue a confirmar, sin fechas estimadas.`
				: `Ninguna provincia ni la Ciudad de Buenos Aires publicó todavía el inicio del ciclo lectivo ${anio}. No hay una fecha única ni fechas estimadas en esta página.`
			: `Ya hay inicio oficial en ${nombres}.${fraseInicioAnunciado ? ` ${fraseInicioAnunciado}.` : ''} El resto de las jurisdicciones sigue a confirmar, sin fechas estimadas.`;
	const invierno =
		oficiales.length === 0
			? frasePrevisto
				? `${frasePrevisto}. En el resto de las provincias el receso sigue a confirmar.`
				: `Las vacaciones de invierno ${anio} las define cada jurisdicción. Todavía no hay fechas oficiales cargadas.`
			: `Las vacaciones de invierno ${anio} ya están publicadas en ${nombres}.${frasePrevisto ? ` ${frasePrevisto}.` : ''} En el resto de las provincias siguen a confirmar.`;
	const dias =
		oficiales.length === provincias.length
			? 'El Consejo Federal de Educación suele pautar 190 días de clase. La cantidad exacta la define cada ministerio provincial en su resolución.'
			: `El Consejo Federal de Educación suele pautar 190 días de clase, pero el número de ${anio} lo fija cada provincia al publicar su calendario. Todavía no está cargado para todas las jurisdicciones.`;
	const publicacion =
		oficiales.length === 0
			? `Cada ministerio de educación lo publica por su cuenta, en general entre noviembre y febrero. El calendario oficial ${anio} todavía no está publicado.`
			: `Cada ministerio lo publica por su cuenta, en general entre noviembre y febrero. Ya hay calendario oficial en ${nombres}. El resto sigue a confirmar.`;
	const publicadas = oficiales.filter((provincia) => {
		const item = calendario.jurisdicciones[provincia.slug];
		return Boolean(item?.inicio && item.fin);
	});
	const frases = publicadas.map((provincia) => {
		const item = calendario.jurisdicciones[provincia.slug]!;
		const nombre = provincia.slug === 'caba' ? 'la Ciudad de Buenos Aires' : nombreCalendario(provincia);
		const desde = partesIso(item.inicio!);
		const hasta = partesIso(item.fin!);
		return `${nombre} (clases del ${fechaDiaMes(desde.dia, desde.mes)} al ${fechaDiaMes(hasta.dia, hasta.mes)})`;
	});
	const lista = frases.length <= 1 ? (frases[0] ?? '') : `${frases.slice(0, -1).join(', ')} y ${frases.at(-1)}`;
	const quienesBase =
		frases.length === 0
			? `Todavía ninguna provincia publicó el calendario escolar ${anio}.`
			: `Por ahora, ${lista}.`;
	const quienes =
		anunciadas.length === 0
			? quienesBase
			: `${quienesBase} ${anunciadas.map((provincia) => nombreCalendario(provincia)).join(', ')} anunció fechas del ciclo y todavía no publicó una resolución.`;
	return [
		{ q: `¿Cuándo empieza el ciclo lectivo ${anio}?`, a: inicio },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio}?`, a: invierno },
		{ q: `¿Cuántos días de clase hay en ${anio}?`, a: dias },
		{ q: '¿Cuándo se publica el calendario oficial?', a: publicacion },
		{ q: `¿Qué provincias ya publicaron el calendario escolar ${anio}?`, a: quienes },
	];
}

export function textoPlano(html: string): string {
	return html.replace(/<[^>]+>/g, '');
}

export function h1Provincia(provincia: Provincia, anio: number): string {
	return h1CalendarioProvincia(provincia, anio);
}

export function provinciasVecinas(slug: string): Provincia[] {
	return vecinasDe(slug)
		.map((vecina) => provincias.find((provincia) => provincia.slug === vecina))
		.filter((provincia): provincia is Provincia => Boolean(provincia));
}

export function confirmadas(calendario: CalendarioEscolar): number {
	return Object.values(calendario.jurisdicciones).filter((jurisdiccion) => jurisdiccion.estado === 'oficial').length;
}

export function actualizadoVisible(calendario: CalendarioEscolar, jurisdiccion?: Jurisdiccion): string {
	return actualizadoDe(calendario, jurisdiccion);
}

export function marcasReceso(jurisdiccion: Jurisdiccion): { iso: string; nombre: string }[] {
	return recesosDe(jurisdiccion);
}

function inviernoConfirmado(jurisdiccion: Jurisdiccion | undefined): boolean {
	return Boolean(jurisdiccion?.estado === 'oficial' && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta);
}

/** Filas de la tabla nacional de vacaciones de invierno, por región. Oficiales primero. */
export function filasVacacionesInvierno(calendario: CalendarioEscolar) {
	return regionesEscolares.map((region) => ({
		...region,
		filas: region.slugs
			.map((slug) => {
				const provincia = provincias.find((item) => item.slug === slug);
				if (!provincia) throw new Error(`Falta la provincia ${slug}`);
				const jurisdiccion = calendario.jurisdicciones[slug];
				if (!jurisdiccion) throw new Error(`Falta el calendario de ${slug}`);
				const oficial = inviernoConfirmado(jurisdiccion);
				const previsto = !oficial && Boolean(jurisdiccion.invierno.desde);
				return {
					provincia,
					jurisdiccion,
					href: `/calendario-escolar-${calendario.anio}/${slug}/#invierno`,
					receso: oficial || previsto ? textoReceso(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta) : 'A confirmar',
					estado: oficial ? 'Oficial' : previsto ? 'Previsto' : 'A confirmar',
					oficial,
				};
			})
			.sort((a, b) => {
				const peso = (fila: { oficial: boolean; estado: string }) => (fila.oficial ? 0 : fila.estado === 'Previsto' ? 1 : 2);
				const diferencia = peso(a) - peso(b);
				if (diferencia !== 0) return diferencia;
				return nombreCalendario(a.provincia).localeCompare(nombreCalendario(b.provincia), 'es');
			}),
	}));
}

/** Respuesta directa bajo el H1 de vacaciones de invierno. */
export function introVacacionesInvierno(calendario: CalendarioEscolar): string {
	const anio = calendario.anio;
	const oficiales = provincias.filter((provincia) => inviernoConfirmado(calendario.jurisdicciones[provincia.slug]));
	const parciales = provincias.filter((provincia) => {
		const item = calendario.jurisdicciones[provincia.slug];
		return Boolean(item && item.estado !== 'oficial' && item.invierno.desde && !item.invierno.hasta);
	});
	const base = `Las vacaciones de invierno ${anio} en Argentina son de dos semanas y cada provincia define sus fechas.`;
	const extra = parciales
		.map((provincia) => {
			const desde = calendario.jurisdicciones[provincia.slug]!.invierno.desde!;
			const partes = partesIso(desde);
			return `${nombreCalendario(provincia)} tiene previsto el receso desde el ${fechaDiaMes(partes.dia, partes.mes)}, sin fecha de fin`;
		})
		.join('; ');
	if (oficiales.length === 0) {
		if (!extra) return `${base} Todavía ninguna jurisdicción publicó el receso; esta página no adelanta fechas estimadas.`;
		const pendientes = provincias.length - parciales.length;
		return `${base} ${extra}. ${pendientes} jurisdicciones todavía no publicaron el calendario ${anio}.`;
	}
	const frases = oficiales.map((provincia) => {
		const item = calendario.jurisdicciones[provincia.slug]!;
		const lugar = provincia.slug === 'caba' ? 'la Ciudad de Buenos Aires' : nombreCalendario(provincia);
		return `${lugar} confirmó su receso del ${rangoTarjeta(item.invierno.desde, item.invierno.hasta)}`;
	});
	const confirmadas =
		frases.length === 1 ? frases[0]! : `${frases.slice(0, -1).join('; ')}; y ${frases.at(-1)}`;
	const pendientes = provincias.length - oficiales.length - parciales.length;
	const previsto = extra ? ` ${extra}.` : '';
	if (pendientes === 0 && !extra) {
		return `${base} Ya hay fechas oficiales en las 24 jurisdicciones.`;
	}
	if (oficiales.length === 1) {
		return `${base} Por ahora ${confirmadas}.${previsto} ${pendientes} jurisdicciones todavía no publicaron el calendario ${anio}.`;
	}
	return `${base} Por ahora ${confirmadas}.${previsto} ${pendientes} jurisdicciones todavía no publicaron el calendario ${anio}.`;
}

function respuestaInviernoProvincia(calendario: CalendarioEscolar, slug: string, etiqueta: string): string {
	const jurisdiccion = calendario.jurisdicciones[slug];
	if (jurisdiccion && jurisdiccion.estado !== 'oficial' && jurisdiccion.invierno.desde && !jurisdiccion.invierno.hasta) {
		return `El receso de invierno ${calendario.anio} en ${etiqueta} está previsto desde el ${fechaTarjeta(jurisdiccion.invierno.desde)}. No se anunció la fecha de fin y todavía no hay resolución.`;
	}
	if (inviernoConfirmado(jurisdiccion) && jurisdiccion) {
		if (slug === 'cordoba' && calendario.anio === 2027) {
			return `Las vacaciones de invierno ${calendario.anio} en Córdoba van del ${rangoTarjeta(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)}. Las clases vuelven el ${fechaSinAnio(VUELTA_CORDOBA_2027)}, según la Resolución 197/2026.`;
		}
		const segun = slug === 'caba' ? 'la Agenda Educativa' : organismoCorto(provincias.find((item) => item.slug === slug)!);
		return `Las vacaciones de invierno ${calendario.anio} en ${etiqueta} van del ${rangoTarjeta(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)}, según ${segun}.`;
	}
	return `Todavía no está confirmado; lo actualizamos apenas el ministerio publique el calendario ${calendario.anio}.`;
}

export function preguntasVacacionesInvierno(calendario: CalendarioEscolar): { q: string; a: string }[] {
	const anio = calendario.anio;
	const oficiales = provincias.filter((provincia) => inviernoConfirmado(calendario.jurisdicciones[provincia.slug]));
	const nombres = oficiales.map((provincia) => nombreCalendario(provincia));
	const cuando =
		oficiales.length === 0
			? `Las vacaciones de invierno ${anio} las define cada jurisdicción. Todavía no hay fechas oficiales cargadas.`
			: oficiales.length === 1
				? `Por ahora solo ${nombres[0]} confirmó el receso: del ${rangoTarjeta(calendario.jurisdicciones[oficiales[0]!.slug]!.invierno.desde, calendario.jurisdicciones[oficiales[0]!.slug]!.invierno.hasta)}. El resto sigue a confirmar.`
				: `Ya hay fechas oficiales en ${nombres.join(', ')}. En el resto de las provincias el receso sigue a confirmar.`;
	const quienes =
		oficiales.length === 0
			? `Todavía ninguna provincia confirmó las vacaciones de invierno ${anio}.`
			: `Por ahora, ${nombres.join(', ')}.`;
	return [
		{ q: `¿Cuándo son las vacaciones de invierno ${anio}?`, a: cuando },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en Buenos Aires?`, a: respuestaInviernoProvincia(calendario, 'buenos-aires', 'la Provincia de Buenos Aires') },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en CABA?`, a: respuestaInviernoProvincia(calendario, 'caba', 'CABA') },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en Córdoba?`, a: respuestaInviernoProvincia(calendario, 'cordoba', 'Córdoba') },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio} en Santa Fe?`, a: respuestaInviernoProvincia(calendario, 'santa-fe', 'Santa Fe') },
		{
			q: '¿Cuánto duran las vacaciones de invierno?',
			a: 'Suelen durar dos semanas. Cada ministerio provincial fija las fechas exactas del receso; esta página no estima turnos ni adelanta fechas.',
		},
		{ q: `¿Qué provincias ya confirmaron las vacaciones de invierno ${anio}?`, a: quienes },
	];
}

export function textoCfeInvierno(calendario: CalendarioEscolar): string | null {
	const cfe = calendario.cfeInvierno;
	if (!cfe || cfe.turnos.length === 0) return null;
	const turnos = cfe.turnos.map((turno) => `${turno.nombre}: del ${rangoTarjeta(turno.desde, turno.hasta)}`).join('; ');
	const notas = cfe.notas ? ` ${cfe.notas}` : '';
	return `El Consejo Federal de Educación anunció turnos de invierno ${calendario.anio}: ${turnos}.${notas}`;
}

/** Texto corto de la sección de invierno en cada página de provincia. */
export function textoSeccionInvierno(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): string {
	if (provincia.slug === 'caba') return inviernoCaba(jurisdiccion, anio);
	if (provincia.slug === 'cordoba' && jurisdiccion.estado === 'oficial' && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		const vuelta = anio === 2027 ? ` Las clases vuelven el ${fechaSinAnio(VUELTA_CORDOBA_2027)}.` : '';
		return `Las vacaciones de invierno ${anio} en Córdoba son del ${rangoTarjeta(jurisdiccion.invierno.desde, jurisdiccion.invierno.hasta)}.${vuelta} Según la Resolución 197/2026 del Ministerio de Educación.`;
	}
	const lugar = lugarCalendario(provincia);
	const segun = organismoCorto(provincia);
	if (jurisdiccion.estado !== 'oficial' && jurisdiccion.invierno.desde && !jurisdiccion.invierno.hasta) {
		return `Las vacaciones de invierno ${anio} en ${lugar} están previstas desde el ${fechaTarjeta(jurisdiccion.invierno.desde)}. ${sujetoOrganismo(provincia)} no anunció la fecha de fin y todavía no hay resolución.`;
	}
	if (jurisdiccion.estado === 'oficial' && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta) {
		return `Las vacaciones de invierno ${anio} en ${lugar} son del ${fechaTarjeta(jurisdiccion.invierno.desde)} al ${fechaTarjeta(jurisdiccion.invierno.hasta)}, según ${segun}.`;
	}
	return `Las vacaciones de invierno ${anio} en ${lugar} todavía no tienen fecha. ${sujetoOrganismo(provincia)} no publicó el calendario ${anio}, y esta página no muestra un receso estimado.`;
}
