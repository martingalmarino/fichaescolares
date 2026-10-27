import { actualizadoDe, recesosDe, vecinasDe, type CalendarioEscolar, type Jurisdiccion } from '../data/calendario-escolar';
import { efemerides } from '../data/efemerides';
import { provincias, type Provincia } from '../data/provincias';
import { LEY_FERIADOS, fechaCompleta, fechaDiaMes, feriadosDelAnio, partesIso, puentesDelAnio, type FeriadoCalculado } from './calendario';
import { h1CalendarioProvincia, lugarCalendario, nombreCalendario } from './meta';

export { LEY_FERIADOS };

export function ministerioDe(provincia: Provincia): string {
	if (provincia.slug === 'caba') return 'Ministerio de Educación de la Ciudad de Buenos Aires';
	if (provincia.slug === 'buenos-aires') return 'Ministerio de Educación de la provincia de Buenos Aires';
	return `Ministerio de Educación de ${nombreCalendario(provincia)}`;
}

export function fechaActualizado(iso: string): string {
	const { anio, mes, dia } = partesIso(iso);
	return fechaDiaMes(dia, mes) + ` de ${anio}`;
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
	return `Las clases ${anio} en ${en} todavía no tienen fecha oficial: el ${ministerioDe(provincia)} aún no publicó el calendario. Abajo están los feriados nacionales ${anio} ya confirmados por ley.`;
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

export function preguntasProvincia(provincia: Provincia, jurisdiccion: Jurisdiccion, anio: number): { q: string; a: string }[] {
	const lugar = lugarCalendario(provincia);
	const nombre = nombreCalendario(provincia);
	const ministerio = ministerioDe(provincia);
	const pendiente = `El ${ministerio} todavía no lo publicó. Esta página se actualiza apenas salga la resolución oficial.`;
	const inicio = jurisdiccion.estado === 'oficial' && jurisdiccion.inicio ? `Las clases ${anio} en ${lugar} empiezan el ${fechaTarjeta(jurisdiccion.inicio)}.` : pendiente;
	const invierno =
		jurisdiccion.estado === 'oficial' && jurisdiccion.invierno.desde && jurisdiccion.invierno.hasta
			? `Las vacaciones de invierno ${anio} en ${lugar} son del ${fechaTarjeta(jurisdiccion.invierno.desde)} al ${fechaTarjeta(jurisdiccion.invierno.hasta)}.`
			: pendiente;
	const fin = jurisdiccion.estado === 'oficial' && jurisdiccion.fin ? `Las clases ${anio} en ${lugar} terminan el ${fechaTarjeta(jurisdiccion.fin)}.` : pendiente;
	const fuente = jurisdiccion.fuente
		? `La fuente oficial es el <a href="${jurisdiccion.fuente}" rel="noopener noreferrer">${ministerio}</a>.`
		: `Lo publica el ${ministerio}. Todavía no hay una resolución cargada en esta página.`;
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

export function preguntasNacional(calendario: CalendarioEscolar): { q: string; a: string }[] {
	const anio = calendario.anio;
	const oficiales = provincias.filter((provincia) => calendario.jurisdicciones[provincia.slug]?.estado === 'oficial');
	const inicio =
		oficiales.length === 0
			? `Cada provincia y la Ciudad de Buenos Aires fijan su propio inicio de clases ${anio}. Ninguna publicó todavía el calendario, así que no hay una fecha única.`
			: `Ya hay calendario oficial en ${oficiales.map((provincia) => nombreCalendario(provincia)).join(', ')}. El resto sigue a confirmar: cada ministerio publica el suyo.`;
	const invierno =
		oficiales.length === 0
			? `Las vacaciones de invierno ${anio} también las define cada jurisdicción. Todavía no hay fechas oficiales cargadas.`
			: `Las vacaciones de invierno ${anio} ya están publicadas en ${oficiales.map((provincia) => nombreCalendario(provincia)).join(', ')}. En el resto de las provincias siguen a confirmar.`;
	return [
		{ q: `¿Cuándo empiezan las clases ${anio} en Argentina?`, a: inicio },
		{ q: `¿Cuándo son las vacaciones de invierno ${anio}?`, a: invierno },
		{
			q: '¿Cuántos días de clase tiene el ciclo lectivo?',
			a: 'El Consejo Federal de Educación suele pautar 190 días de clase. La cantidad exacta y el calendario los define cada ministerio provincial.',
		},
		{
			q: `¿Qué feriados hay en ${anio}?`,
			a: `${listaFeriados(anio)}. Los fija la <a href="${LEY_FERIADOS}" rel="noopener noreferrer">Ley 27.399</a>. ${notaPuentes(anio) ?? ''}`,
		},
		{
			q: '¿Cuándo publican las provincias su calendario?',
			a: 'En general entre noviembre y febrero, antes de que empiecen las clases. Cada ministerio de educación lo publica por su cuenta.',
		},
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
