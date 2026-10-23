import type { Efemeride } from '../data/efemerides';
import { efemerides } from '../data/efemerides';
import type { Lamina } from '../data/laminas';
import { publicadas } from '../data/laminas';
import { mapas, nombreTipo, type MapaIgn } from '../data/mapas';
import { provincias, type Provincia } from '../data/provincias';
import { MESES_SLUG, efemeridesDelMes, fechaArgentina, mesDeSlug, pascua, proximaOcurrencia, slugDeMes } from './calendario';

export const MAX_TITULO = 60;
export const MIN_DESCRIPCION = 140;
export const MAX_DESCRIPCION = 160;

export interface MetaPagina {
	ruta: string;
	title: string;
	description: string;
	/** La 404 no se reescribe: no entra en el mínimo de la descripción. */
	flexible?: boolean;
}

const MESES_MIN = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function mesMinuscula(mes: number): string {
	return MESES_MIN[mes - 1] ?? '';
}

const RELLENOS = [
	' Para el aula.',
	' Para docentes y familias.',
	' Para docentes y familias, en el aula.',
	' Para docentes y familias, listas para el aula.',
	' Para docentes y familias. Sugerido para la escuela primaria.',
	' Para docentes y familias. Sugerido para imprimir en la escuela primaria.',
];

function encajar(variantes: string[]): string {
	const validas = variantes.filter((texto) => texto.length > 0 && texto.length <= MAX_DESCRIPCION);
	const base = validas.sort((a, b) => b.length - a.length)[0] ?? variantes[variantes.length - 1] ?? '';
	if (base.length >= MIN_DESCRIPCION && base.length <= MAX_DESCRIPCION) return base;
	if (base.length > MAX_DESCRIPCION) return base;
	const suma = RELLENOS.map((relleno) => `${base}${relleno}`).find((texto) => texto.length >= MIN_DESCRIPCION && texto.length <= MAX_DESCRIPCION);
	return suma ?? `${base}${RELLENOS[RELLENOS.length - 1]}`;
}

function dentro(texto: string, tope: number): boolean {
	return texto.length <= tope;
}

export const metaEstaticas = {
	sopa: {
		ruta: '/sopa-de-letras/',
		title: 'Sopa de letras de efemérides para imprimir gratis | Aulita',
		description:
			'Armá sopas de letras de efemérides argentinas para imprimir gratis en A4. Elegí la fecha y la dificultad, sumá la solución y guardala como PDF sin registro.',
	},
	crucigrama: {
		ruta: '/crucigrama-proceres/',
		title: 'Crucigrama de próceres argentinos para imprimir | Aulita',
		description:
			'Generá un crucigrama de próceres argentinos con pistas y solución, listo para imprimir gratis en A4. Ideal para actos patrios y repaso en primaria.',
	},
	caligrafia: {
		ruta: '/caligrafia/',
		title: 'Hojas de caligrafía para imprimir gratis (A4) | Aulita',
		description:
			'Generá hojas de caligrafía en cursiva o imprenta con renglones escolares y frases propias o de efemérides. Gratis, en A4 y listas para imprimir.',
	},
	tablas: {
		ruta: '/tablas-y-operaciones/',
		title: 'Fichas de cuentas y tablas para imprimir gratis | Aulita',
		description:
			'Generá fichas de sumas, restas, multiplicaciones y divisiones con hoja de respuestas. Elegí la dificultad e imprimilas gratis en A4 para primaria.',
	},
	guia: {
		ruta: '/guia-para-el-aula/',
		title: 'Guía para usar imprimibles en el aula | Aulita',
		description:
			'Ideas para combinar sopas de letras, crucigramas, caligrafía, láminas y cuentas en una semana patria, con adaptaciones por grado y consejos para ahorrar tinta.',
	},
	acerca: {
		ruta: '/acerca/',
		title: 'Acerca de Aulita: material escolar argentino',
		description:
			'Quiénes hacen Aulita, para quién es, de qué fuentes oficiales salen las efemérides y los mapas, y qué cosas el sitio no promete. Para docentes y familias.',
	},
	contacto: {
		ruta: '/contacto/',
		title: 'Contacto | Aulita',
		description:
			'Escribinos para avisar un error en una efeméride o un mapa, sugerir una ficha nueva o hacer una consulta sobre Aulita. Respondemos a docentes y familias.',
	},
	creditos: {
		ruta: '/creditos/',
		title: 'Créditos y licencias | Aulita',
		description:
			'Fuentes de letra con licencia SIL OFL, mapas del Instituto Geográfico Nacional (CC BY-SA 4.0) y el origen de los datos y dibujos que usa Aulita.',
	},
	privacidad: {
		ruta: '/privacidad/',
		title: 'Política de privacidad | Aulita',
		description:
			'Cómo usa Aulita las cookies, Google Analytics y la publicidad, y tus derechos según la Ley 25.326. El sitio es para adultos, no para menores de 13 años.',
	},
	noEncontrada: {
		ruta: '/404/',
		title: 'Página no encontrada | Aulita',
		description: 'Esa dirección no existe en Aulita.',
		flexible: true,
	},
} as const satisfies Record<string, MetaPagina>;

export function metaCalendario(anio: number): MetaPagina {
	return {
		ruta: '/efemerides/',
		title: `Calendario de efemérides ${anio} de Argentina | Aulita`,
		description: `Efemérides argentinas ${anio} mes por mes: feriados, actos escolares y fechas patrias con las fechas móviles resueltas. Con fichas para imprimir gratis.`,
	};
}

export function metaMapasIndice(): MetaPagina {
	return {
		ruta: '/mapas/',
		title: 'Mapas escolares de Argentina para imprimir | Aulita',
		description:
			'Mapas oficiales del IGN para imprimir gratis en A4 y A3: Argentina bicontinental, provincias, América y planisferios, en versión política, física y muda.',
	};
}

export function metaMapasProvincias(): MetaPagina {
	return {
		ruta: '/mapas/provincias/',
		title: 'Mapas de las provincias argentinas para imprimir | Aulita',
		description:
			'Mapas de las 24 provincias argentinas para imprimir gratis en A4: políticos con departamentos, físicos, mudos y satelitales. Fuente oficial: IGN.',
	};
}

export function metaLaminasIndice(): MetaPagina {
	return {
		ruta: '/laminas/',
		title: 'Láminas patrias para colorear e imprimir gratis | Aulita',
		description:
			'Dibujos patrios para colorear e imprimir gratis en A4: escarapela, bandera, Sol de Mayo, granaderos y personajes coloniales para el 25 de Mayo y el 9 de Julio.',
	};
}

export function metaProvinciasIndice(): MetaPagina {
	return {
		ruta: '/provincias/',
		title: 'Fichas de las provincias argentinas para imprimir | Aulita',
		description:
			'Fichas de las 23 provincias y la Ciudad de Buenos Aires para imprimir gratis en A4: silueta para colorear, capital y datos para completar en clase.',
	};
}

function fechaCorta(dia: number, mes: number): string {
	return `${dia} de ${mesMinuscula(mes)}`;
}

function fechaLarga(dia: number, mes: number, anio: number): string {
	return `${dia} de ${mesMinuscula(mes)} de ${anio}`;
}

function sumarDias(anio: number, mes: number, dia: number, delta: number): { dia: number; mes: number } {
	const fecha = new Date(Date.UTC(anio, mes - 1, dia + delta));
	return { dia: fecha.getUTCDate(), mes: fecha.getUTCMonth() + 1 };
}

function tituloConTope(bases: string[], fecha: string | null): string {
	const candidatos: string[] = [];
	for (const base of bases) {
		if (fecha) {
			candidatos.push(`${base}: ${fecha} | Efemérides | Aulita`);
			candidatos.push(`${base}: ${fecha} | Aulita`);
		}
		candidatos.push(`${base} | Aulita`);
	}
	return candidatos.find((texto) => dentro(texto, MAX_TITULO)) ?? candidatos[candidatos.length - 1] ?? 'Efemérides | Aulita';
}

function carnaval(anio: number): { title: string; cuando: string } {
	const domingo = pascua(anio);
	const martes = sumarDias(anio, domingo.mes, domingo.dia, -47);
	const lunes = sumarDias(anio, domingo.mes, domingo.dia, -48);
	const cuando =
		lunes.mes === martes.mes
			? `lunes ${lunes.dia} y martes ${martes.dia} de ${mesMinuscula(martes.mes)}`
			: `lunes ${lunes.dia} de ${mesMinuscula(lunes.mes)} y martes ${martes.dia} de ${mesMinuscula(martes.mes)}`;
	return { title: `Carnaval ${anio}: ${cuando} | Aulita`, cuando };
}

export function metaEfemeride(fecha: Efemeride, desde = new Date()): MetaPagina {
	const proxima = proximaOcurrencia(fecha, desde);
	if (fecha.slug === 'carnaval' && proxima) {
		const datos = carnaval(proxima.anio);
		const description = encajar([
			`Carnaval, ${datos.cuando} de ${proxima.anio}, feriado nacional: qué se conmemora, su origen y fichas para imprimir gratis para el acto escolar.`,
			`Carnaval, ${datos.cuando} de ${proxima.anio}, feriado nacional: qué se conmemora y fichas para imprimir gratis.`,
			`Carnaval ${proxima.anio}, ${datos.cuando}, feriado nacional. Fichas para imprimir gratis en A4 para el acto escolar.`,
		]);
		return { ruta: `/efemerides/${fecha.slug}/`, title: datos.title, description };
	}

	const fechaTexto =
		fecha.dia != null && fecha.mes != null
			? fechaCorta(fecha.dia, fecha.mes)
			: proxima
				? fechaLarga(proxima.dia, proxima.mes, proxima.anio)
				: null;
	const sinParentesis = fecha.nombre.replace(/\s*\([^)]*\)/g, '').replace(/\s+–.+$/, '').trim();
	const bases = [fecha.nombre];
	if (sinParentesis && sinParentesis !== fecha.nombre) bases.push(sinParentesis);
	if (fecha.titulo && !bases.includes(fecha.titulo)) bases.push(fecha.titulo);
	const title = tituloConTope(bases, fechaTexto);
	const marca = fecha.feriado.es ? ', feriado nacional' : '';
	const cuando = fechaTexto ?? 'fecha del calendario escolar';
	const nombre = fecha.titulo.length < fecha.nombre.length ? fecha.titulo : fecha.nombre;
	const description = encajar([
		`${fecha.nombre}, ${cuando}${marca}: qué se conmemora, su origen y fichas y láminas para imprimir gratis para el acto escolar.`,
		`${fecha.nombre}, ${cuando}${marca}: qué se conmemora, su origen y fichas para imprimir gratis para el acto escolar.`,
		`${fecha.nombre}, ${cuando}${marca}: qué se conmemora, su origen y fichas para imprimir gratis.`,
		`${nombre}, ${cuando}${marca}: qué se conmemora y fichas para imprimir gratis en A4.`,
		`${nombre}, ${cuando}${marca}: fichas para imprimir gratis en A4 para el acto escolar.`,
		`${nombre}${marca}: qué se conmemora y fichas para imprimir gratis en A4.`,
	]);
	return { ruta: `/efemerides/${fecha.slug}/`, title, description };
}

function nombresMes(fechas: Efemeride[], cantidad: number, corto = false): string[] {
	const feriados = fechas.filter((fecha) => fecha.tipo === 'feriado');
	const pool = feriados.length > 0 ? feriados : fechas;
	return pool.slice(0, cantidad).map((fecha) => (corto || fecha.nombre.length > 48 ? fecha.titulo || fecha.nombre : fecha.nombre));
}

export function metaMes(mes: number, anio: number, fechas: Efemeride[]): MetaPagina {
	const nombre = mesMinuscula(mes);
	const una = nombresMes(fechas, 1, true)[0];
	const dos = nombresMes(fechas, 2, true);
	const variantes = [
		dos.length >= 2
			? `Efemérides de ${nombre} ${anio}: ${fechas.length} fechas del calendario escolar argentino, con ${dos[0]} y ${dos[1]}, y fichas para imprimir gratis.`
			: '',
		una
			? `Efemérides de ${nombre} ${anio}: ${fechas.length} fechas del calendario escolar argentino, con ${una}, y fichas para imprimir gratis.`
			: '',
		`Efemérides de ${nombre} ${anio}: ${fechas.length} fechas del calendario escolar argentino y fichas para imprimir gratis en A4.`,
	].filter(Boolean);
	return {
		ruta: `/efemerides/${MESES_SLUG[mes - 1]}/`,
		title: `Efemérides de ${nombre} ${anio} en Argentina | Aulita`,
		description: encajar(variantes),
	};
}

export function introMes(mes: number, anio: number, fechas: Efemeride[], anterior: number, siguiente: number): string {
	const destacadas = nombresMes(fechas, 2);
	const frase =
		destacadas.length >= 2
			? `Entre las fechas que más se trabajan en el aula están ${destacadas[0]} y ${destacadas[1]}.`
			: destacadas.length === 1
				? `Entre las fechas que más se trabajan en el aula está ${destacadas[0]}.`
				: 'Reúne feriados, actos escolares y conmemoraciones.';
	return `Estas son las efemérides de ${mesMinuscula(mes)} ${anio} en Argentina: ${fechas.length} fechas del calendario escolar, entre feriados nacionales, actos escolares y días internacionales. ${frase} Las fechas móviles ya vienen calculadas para ${anio}. Cada efeméride tiene su ficha con qué se conmemora, la norma que la establece cuando existe y recursos para imprimir gratis en A4, como sopas de letras, crucigramas y láminas para colorear. Para ver el año completo, entrá al <a class="text-celeste underline" href="/efemerides/">calendario de efemérides</a>. El mes anterior es <a class="text-celeste underline" href="/efemerides/${slugDeMes(anterior)}/">${mesMinuscula(anterior)}</a> y el siguiente es <a class="text-celeste underline" href="/efemerides/${slugDeMes(siguiente)}/">${mesMinuscula(siguiente)}</a>.`;
}

function tituloHasta(completo: string, recortes: Array<(texto: string) => string>): string {
	let titulo = completo;
	for (const recorte of recortes) {
		if (dentro(titulo, MAX_TITULO)) return titulo;
		titulo = recorte(titulo);
	}
	return titulo;
}

const TIPOS_EN_TITULO: Record<string, string[]> = {
	politico: ['polític', 'politic'],
	fisico: ['físic', 'fisic'],
	mudo: ['mudo'],
	satelital: ['satelital'],
	tematico: ['temátic', 'tematic'],
	'fisico-politico': ['físico-polític', 'fisico-politic'],
	'carta-topografica': ['topográf', 'topograf'],
};

function tipoYaEsta(titulo: string, tipo: string): boolean {
	const normal = titulo.toLocaleLowerCase('es-AR');
	if (tipo === 'fisico' && /físico-pol|fisico-pol/.test(normal)) return false;
	return (TIPOS_EN_TITULO[tipo] ?? []).some((pista) => normal.includes(pista));
}

export function metaMapa(mapa: MapaIgn): MetaPagina {
	const title = tituloHasta(`${mapa.titulo} para imprimir | Mapas IGN | Aulita`, [
		(texto) => texto.replace(' | Mapas IGN', ''),
		(texto) => texto.replace(' para imprimir', ''),
		(texto) => texto.replaceAll('Tierra del Fuego, Antártida e Islas del Atlántico Sur', 'Tierra del Fuego'),
		(texto) => texto.replaceAll('Ciudad Autónoma de Buenos Aires', 'Ciudad de Buenos Aires'),
		(texto) => texto.replace(/ \([^)]*\)/g, ''),
		(texto) => texto.replace(' con departamentos', '').replace(' con comunas', '').replace(' con partidos', ''),
		(texto) => texto.replace('físico-político de ', ''),
	]);
	const titulo = mapa.titulo.charAt(0).toLocaleLowerCase('es-AR') + mapa.titulo.slice(1);
	const femenino = /^(imagen|carta)\b/i.test(mapa.titulo);
	const articulo = femenino ? 'la' : 'el';
	const listo = femenino ? 'lista' : 'listo';
	const archivo = mapa.pdf ? `PDF ${mapa.tamano}` : 'JPG';
	const tipo = tipoYaEsta(mapa.titulo, mapa.tipo) ? '' : `${nombreTipo(mapa.tipo)}, `;
	const description = encajar([
		`Descargá gratis ${articulo} ${titulo} del IGN en ${archivo}, ${listo} para imprimir. ${tipo}Sugerido para ${mapa.gradoSugerido}. Licencia CC BY-SA 4.0.`,
		`Descargá gratis ${articulo} ${titulo} del IGN en ${archivo}, ${listo} para imprimir. Sugerido para ${mapa.gradoSugerido}. Licencia CC BY-SA 4.0.`,
		`Descargá gratis ${articulo} ${titulo} del IGN en ${archivo}. Sugerido para ${mapa.gradoSugerido}. Licencia CC BY-SA 4.0.`,
		`Descargá gratis ${articulo} ${titulo} del IGN en ${archivo}. Licencia CC BY-SA 4.0.`,
	]);
	return { ruta: `/mapas/${mapa.slug}/`, title, description };
}

function actoDeLamina(lamina: Lamina): { dia: number; mes: number } | null {
	const vinculadas = efemerides.filter((fecha) => fecha.laminas.includes(lamina.slug) && fecha.dia != null && fecha.mes != null);
	const preferida = lamina.efemerides
		.map((texto) => texto.toLocaleLowerCase('es-AR'))
		.map((texto) => vinculadas.find((fecha) => fechaCorta(fecha.dia ?? 0, fecha.mes ?? 0) === texto))
		.find((fecha) => fecha);
	const fecha = preferida ?? vinculadas[0];
	if (!fecha?.dia || !fecha.mes) return null;
	return { dia: fecha.dia, mes: fecha.mes };
}

export function metaLamina(lamina: Lamina): MetaPagina {
	const base = lamina.alt.replace(/,?\s*dibujo lineal para colorear$/i, '').replace(/,?\s*para colorear$/i, '').trim();
	const acto = actoDeLamina(lamina);
	const cierre = acto ? ` Ideal para actos escolares del ${fechaCorta(acto.dia, acto.mes)}.` : ' Ideal para actos escolares.';
	const description = encajar([
		`${base}: lámina patria para colorear e imprimir gratis en A4, en trazo negro.${cierre}`,
		`${base}: lámina para colorear e imprimir gratis en A4, en trazo negro.${cierre}`,
		`${base}: lámina para colorear e imprimir gratis en A4.${cierre}`,
		`${base}: lámina para colorear e imprimir gratis en A4.`,
	]);
	const largo = `${lamina.titulo} para colorear e imprimir | Aulita`;
	const title = dentro(largo, MAX_TITULO) ? largo : `${lamina.titulo} para colorear | Aulita`;
	return { ruta: `/laminas/${lamina.slug}/`, title, description };
}

function esCaba(provincia: Provincia): boolean {
	return provincia.slug === 'caba' || provincia.nombre.startsWith('Ciudad Autónoma');
}

function nombreProvinciaCorto(provincia: Provincia): string {
	if (esCaba(provincia)) return 'Ciudad de Buenos Aires';
	if (provincia.nombre.startsWith('Tierra del Fuego')) return 'Tierra del Fuego';
	return provincia.nombre;
}

export function metaProvincia(provincia: Provincia, tieneMapa: boolean): MetaPagina {
	const nombre = nombreProvinciaCorto(provincia);
	const title = provincia.nombre.startsWith('Tierra del Fuego')
		? 'Tierra del Fuego: ficha de la provincia | Aulita'
		: tituloHasta(`Provincia de ${nombre}: ficha para imprimir | Aulita`, [(texto) => texto.replace('Provincia de ', '')]);
	const mapa = tieneMapa ? ' Con mapa del IGN.' : '';
	const region = provincia.region ? `, región ${provincia.region}` : '';
	const description = esCaba(provincia)
		? encajar([
				`Ficha de la Ciudad de Buenos Aires para imprimir gratis en A4: silueta para colorear y datos para completar en clase.${mapa}`,
				`Ficha de la Ciudad de Buenos Aires para imprimir gratis en A4: silueta para colorear y datos para completar en clase.`,
			])
		: encajar([
				`Ficha de ${nombre} para imprimir gratis en A4: silueta para colorear${provincia.capital ? `, capital (${provincia.capital})` : ''}${region}, y datos para completar en clase.${mapa}`,
				`Ficha de ${nombre} para imprimir gratis en A4: silueta para colorear${provincia.capital ? `, capital (${provincia.capital})` : ''}, y datos para completar en clase.${mapa}`,
				`Ficha de ${nombre} para imprimir gratis en A4: silueta para colorear y datos para completar en clase.${mapa}`,
			]);
	return { ruta: `/provincias/${provincia.slug}/`, title, description };
}

export function contarPalabras(html: string): number {
	return html
		.replace(/<[^>]+>/g, ' ')
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
}

export function htmlProvincia(provincia: Provincia, tieneMapa: boolean): string {
	const apertura = esCaba(provincia)
		? 'La Ciudad de Buenos Aires es la capital de la Argentina.'
		: `La provincia de ${provincia.nombre}${provincia.capital ? ` tiene como capital ${provincia.capital}` : ''}.`;
	const region = provincia.region ? `Está en la región ${provincia.region}.` : '';
	const cifras = `Tiene una superficie de ${provincia.superficie} y una población de ${provincia.poblacion}.`;
	const ficha = 'Esta ficha para imprimir trae su silueta para colorear y los datos principales para completar en clase.';
	const uso = 'Se usa en 3.º y 4.º grado, cuando se estudia la provincia propia, y también para repasarla en casa.';
	const impresion = 'Se imprime gratis en A4 desde el navegador, sin registro, y se puede guardar como PDF.';
	const flor = provincia.flor ? `La flor provincial es ${provincia.flor}.` : '';
	const arbol = provincia.arbol ? `El árbol provincial es ${provincia.arbol}.` : '';
	const mapa = tieneMapa
		? 'En esta página también está el <a href="#mapas-provincia">mapa del Instituto Geográfico Nacional</a>, para imprimirlo junto con la ficha.'
		: '';
	const indice = 'Las demás fichas están en el <a href="/provincias/">índice de provincias</a>.';
	const obligatorias = [apertura, region, cifras, ficha, uso, mapa, indice].filter(Boolean);
	const opcionales = [impresion, flor, arbol].filter(Boolean);
	let partes = [...obligatorias];
	for (const extra of opcionales) {
		const siguiente = [...partes, extra];
		if (contarPalabras(siguiente.join(' ')) <= 100) partes = siguiente;
	}
	while (contarPalabras(partes.join(' ')) > 100 && partes.length > 4) partes.pop();
	return partes.join(' ');
}

export function todasLasMetas(desde = new Date()): MetaPagina[] {
	const hoy = fechaArgentina(desde);
	const meses = MESES_SLUG.map((slug) => {
		const mes = mesDeSlug(slug) ?? 1;
		return metaMes(mes, hoy.anio, efemeridesDelMes(efemerides, mes, hoy.anio));
	});
	return [
		...Object.values(metaEstaticas),
		metaCalendario(hoy.anio),
		metaMapasIndice(),
		metaMapasProvincias(),
		metaLaminasIndice(),
		metaProvinciasIndice(),
		...meses,
		...efemerides.map((fecha) => metaEfemeride(fecha, desde)),
		...mapas.map((mapa) => metaMapa(mapa)),
		...publicadas.map((lamina) => metaLamina(lamina)),
		...provincias.map((provincia) => metaProvincia(provincia, mapas.some((mapa) => mapa.provincia?.replaceAll('_', '-') === provincia.slug))),
	];
}
