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

/** Respuesta directa bajo el H1. 40 a 60 palabras si el organismo todavía no publicó fechas. */
export function introProvincia(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): string {
	const lugar = lugarCalendario(provincia);
	const sujeto = sujetoOrganismo(provincia);
	if (jurisdiccion.estado === 'oficial' && jurisdiccion.inicio) {
		return `¿Cuándo empiezan las clases en ${anio} en ${lugar}? ${sujeto} fijó el inicio el ${fechaTarjeta(jurisdiccion.inicio)}. En esta página están las vacaciones de invierno y el fin de clases de ese calendario oficial. No se adelantan fechas de otra fuente.`;
	}
	return `¿Cuándo empiezan las clases en ${anio} en ${lugar}? ${sujeto} todavía no publicó el calendario oficial. No hay fecha de inicio, de vacaciones de invierno ni de fin de clases. Esta página no adelanta fechas estimadas.`;
}

export function preguntasProvincia(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	if (provincia.slug === 'buenos-aires') return preguntasBuenosAires(jurisdiccion, anio);
	if (provincia.slug === 'caba') return preguntasCaba(jurisdiccion, anio);
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

/** Respuesta directa bajo el H1. 40 a 60 palabras cuando ninguna jurisdicción publicó fechas. */
export function introCalendarioNacional(calendario: CalendarioEscolar): string {
	const anio = calendario.anio;
	const oficiales = jurisdiccionesOficiales(calendario).filter((provincia) => calendario.jurisdicciones[provincia.slug]?.inicio);
	if (oficiales.length === 0) {
		return `¿Cuándo empiezan las clases en ${anio}? Todavía no hay una fecha oficial: ninguna de las 24 jurisdicciones publicó su calendario. Cada provincia y la Ciudad de Buenos Aires fijan su propio inicio, y esta página no adelanta fechas estimadas. El inicio, las vacaciones de invierno y el fin del ciclo se cargan cuando sale la resolución de cada ministerio.`;
	}
	const inicios = oficiales.map((provincia) => calendario.jurisdicciones[provincia.slug]!.inicio!).sort();
	const desde = fechaTarjeta(inicios[0] ?? null);
	const hasta = fechaTarjeta(inicios[inicios.length - 1] ?? null);
	const pendientes = provincias.length - oficiales.length;
	if (pendientes === 0) {
		return `¿Cuándo empiezan las clases en ${anio}? El inicio oficial va del ${desde} al ${hasta}, según la provincia. Las 24 jurisdicciones ya publicaron su calendario. En la tabla están el inicio, las vacaciones de invierno y el fin del ciclo de cada una.`;
	}
	if (oficiales.length === 1) {
		const unica = oficiales[0]!;
		const lugar = unica.slug === 'caba' ? 'la Ciudad de Buenos Aires' : lugarCalendario(unica);
		return `¿Cuándo empiezan las clases en ${anio}? En ${lugar} el inicio oficial es el ${desde}. ${pendientes} jurisdicciones todavía no publicaron el calendario y figuran como a confirmar, sin fechas estimadas. Elegí tu provincia para ver el detalle.`;
	}
	return `¿Cuándo empiezan las clases en ${anio}? Donde ya hay calendario oficial, el inicio va del ${desde} al ${hasta}. ${pendientes} jurisdicciones todavía no lo publicaron y figuran como a confirmar, sin fechas estimadas. Elegí tu provincia para ver el detalle.`;
}

export function filasResumen(calendario: CalendarioEscolar) {
	return provincias
		.map((provincia) => {
			const jurisdiccion = calendario.jurisdicciones[provincia.slug];
			if (!jurisdiccion) throw new Error(`Falta el calendario de ${provincia.slug}`);
			const oficial = jurisdiccion.estado === 'oficial';
			return {
				provincia,
				href: `/calendario-escolar-${calendario.anio}/${provincia.slug}/`,
				inicio: fechaTarjeta(oficial ? jurisdiccion.inicio : null),
				invierno: rangoTarjeta(oficial ? jurisdiccion.invierno.desde : null, oficial ? jurisdiccion.invierno.hasta : null),
				fin: fechaTarjeta(oficial ? jurisdiccion.fin : null),
				estado: oficial ? 'Oficial' : 'A confirmar',
			};
		})
		.sort((a, b) => nombreCalendario(a.provincia).localeCompare(nombreCalendario(b.provincia), 'es'));
}

export function preguntasNacional(calendario: CalendarioEscolar): { q: string; a: string }[] {
	const anio = calendario.anio;
	const oficiales = jurisdiccionesOficiales(calendario);
	const nombres = oficiales.map((provincia) => nombreCalendario(provincia)).join(', ');
	const inicio =
		oficiales.length === 0
			? `Ninguna provincia ni la Ciudad de Buenos Aires publicó todavía el inicio del ciclo lectivo ${anio}. No hay una fecha única ni fechas estimadas en esta página.`
			: `Ya hay inicio oficial en ${nombres}. El resto de las jurisdicciones sigue a confirmar, sin fechas estimadas.`;
	const invierno =
		oficiales.length === 0
			? `Las vacaciones de invierno ${anio} las define cada jurisdicción. Todavía no hay fechas oficiales cargadas.`
			: `Las vacaciones de invierno ${anio} ya están publicadas en ${nombres}. En el resto de las provincias siguen a confirmar.`;
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
	const quienes =
		frases.length === 0
			? `Todavía ninguna provincia publicó el calendario escolar ${anio}.`
			: `Por ahora, ${lista}.`;
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
