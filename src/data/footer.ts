import { calendarioVigente } from './calendario-escolar';
import { efemerides, tieneFicha } from './efemerides';
import { mapas } from './mapas';
import { fechaArgentina, proximasEfemerides, slugDeMes } from '../lib/calendario';
import { LEY_FERIADOS } from '../lib/texto-calendario';

export interface EnlaceFooter {
	label: string;
	href: string;
	externo?: boolean;
}

export interface ColumnaFooter {
	titulo: string;
	ariaLabel: string;
	links: EnlaceFooter[];
	/** En el celular ocupa las dos columnas, como en el boceto. */
	anchoMovil?: boolean;
}

export interface ProximaFooter {
	slug: string;
	nombre: string;
	dia: number;
	mes: number;
	anio: number;
	href: string;
	fichas: string | null;
}

const hoy = fechaArgentina(new Date());
const mapa = mapas[0];
if (!mapa?.fuenteUrl || !mapa.licenciaUrl) throw new Error('El catálogo de mapas no trae la fuente ni la licencia del IGN');

export const fuenteIgn = mapa.fuenteUrl;
export const licenciaMapas = mapa.licenciaUrl;

export const proximasFooter: ProximaFooter[] = proximasEfemerides(efemerides, new Date(), 6).map((fecha) => ({
	slug: fecha.slug,
	nombre: fecha.nombre,
	dia: fecha.dia,
	mes: fecha.mes,
	anio: fecha.anio,
	href: `/efemerides/${fecha.slug}/`,
	fichas: tieneFicha(fecha) ? `/sopa-de-letras/?e=${fecha.slug}` : null,
}));

export const columnas: ColumnaFooter[] = [
	{
		titulo: 'Fichas para imprimir',
		ariaLabel: 'Fichas para imprimir',
		links: [
			{ label: 'Sopa de letras', href: '/sopa-de-letras/' },
			{ label: 'Crucigrama de próceres', href: '/crucigrama-proceres/' },
			{ label: 'Caligrafía', href: '/caligrafia/' },
			{ label: 'Tablas y operaciones', href: '/tablas-y-operaciones/' },
			{ label: 'Láminas para colorear', href: '/laminas/' },
			{ label: 'Etiquetas escolares', href: '/etiquetas-escolares/' },
		],
	},
	{
		titulo: 'Mapas',
		ariaLabel: 'Mapas',
		links: [
			{ label: 'Mapas escolares IGN', href: '/mapas/' },
			{ label: 'Mapas por provincia', href: '/mapas/provincias/' },
			{ label: `Calendario escolar ${calendarioVigente.anio}`, href: `/calendario-escolar-${calendarioVigente.anio}/` },
		],
	},
	{
		titulo: 'Efemérides',
		ariaLabel: 'Efemérides',
		anchoMovil: true,
		links: [
			{ label: 'Efemérides del mes', href: `/efemerides/${slugDeMes(hoy.mes)}/` },
			{ label: 'Calendario completo', href: '/efemerides/' },
		],
	},
	{
		titulo: 'Sobre Aulita',
		ariaLabel: 'Para docentes y familias',
		anchoMovil: true,
		links: [
			{ label: 'Guía para el aula', href: '/guia-para-el-aula/' },
			{ label: 'Acerca de Aulita', href: '/acerca/' },
			{ label: 'Créditos y fuentes', href: '/creditos/' },
			{ label: 'Contacto', href: '/contacto/' },
		],
	},
];

export const legales: EnlaceFooter[] = [
	{ label: 'Privacidad', href: '/privacidad/' },
	{ label: 'Términos de uso', href: '/terminos/' },
	{ label: 'Cookies', href: '/cookies/' },
];

export const anioPie = hoy.anio;
export const actualizadoPie = new Intl.DateTimeFormat('es-AR', {
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
	timeZone: 'America/Argentina/Buenos_Aires',
}).format(new Date());

export const leyFeriados = LEY_FERIADOS;

export function diasHasta(anio: number, mes: number, dia: number, desde = hoy): number {
	const destino = Date.UTC(anio, mes - 1, dia);
	const partida = Date.UTC(desde.anio, desde.mes - 1, desde.dia);
	return Math.round((destino - partida) / 86_400_000);
}

function conArticulo(nombre: string): string {
	if (/^(día|paso|año)\b/i.test(nombre)) return `el ${nombre}`;
	return nombre;
}

export function textoFranja(item: ProximaFooter, dias: number): string {
	const cuando = `${item.dia}/${item.mes}`;
	const nombre = conArticulo(item.nombre);
	if (dias <= 0) return `Hoy es ${nombre} (${cuando})`;
	if (dias === 1) return `Falta 1 día para ${nombre} (${cuando})`;
	return `Faltan ${dias} días para ${nombre} (${cuando})`;
}
