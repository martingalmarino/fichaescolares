import { ID_ORGANIZACION } from '../lib/seo';

export interface PreguntaMapa {
	q: string;
	a: string;
}

export interface EnlaceMapa {
	href: string;
	ancla: string;
}

export interface MigaMapa {
	label: string;
	href?: string;
}

export interface SeoMapa {
	title: string;
	description: string;
	h1: string;
	keywords: string[];
	intro: string;
	faqs: PreguntaMapa[];
	migas: MigaMapa[];
	enlaces: {
		sur: EnlaceMapa;
		mudo: EnlaceMapa;
		indice: EnlaceMapa;
	};
}

export interface NotaMapa {
	textoAntes: string;
	ancla: string;
	href: string;
	textoDespues: string;
}

const MAPA_POLITICO_AMERICA: SeoMapa = {
	title: 'Mapa político de América para imprimir (PDF gratis)',
	description:
		'Descargá gratis el mapa político de América con países y capitales, en A4 para imprimir. Versión con nombres de países, ideal para la escuela.',
	h1: 'Mapa político de América para imprimir',
	keywords: [
		'mapa político de américa',
		'mapa de américa para imprimir',
		'mapa político de américa con nombres',
		'mapa de américa mudo',
		'mapa de américa con capitales',
	],
	intro:
		'Este mapa político de América incluye los 35 países independientes, con sus nombres y capitales. Se descarga en PDF, tamaño A4, listo para imprimir.',
	faqs: [
		{
			q: '¿Cuántos países tiene América?',
			a: 'América tiene 35 países independientes: 3 en América del Norte, 20 entre América Central y el Caribe, y 12 en América del Sur. Este mapa los muestra con su nombre y su capital.',
		},
		{
			q: '¿Qué diferencia hay entre el mapa político y el físico?',
			a: 'El mapa político marca países, límites y capitales. El mapa físico marca relieve, ríos y alturas. Esta lámina es el mapa político de América, con nombres y capitales, en PDF A4. El mapa mudo, para completar sin los nombres, está en otra ficha.',
		},
	],
	migas: [
		{ label: 'Inicio', href: '/' },
		{ label: 'Mapas', href: '/mapas/' },
		{ label: 'Mapa político de América' },
	],
	enlaces: {
		sur: { href: '/mapas/mapa-politico-de-america-del-sur/', ancla: 'mapa político de América del Sur' },
		mudo: { href: '/mapas/mapa-mudo-de-continente-americano-n-3/', ancla: 'mapa mudo de América' },
		indice: { href: '/mapas/', ancla: 'mapas escolares' },
	},
};

const NOTAS: Record<string, NotaMapa> = {
	'mapa-politico-de-america-del-sur': {
		textoAntes: 'Para el continente completo, descargá el ',
		ancla: 'mapa político de América para imprimir',
		href: '/mapas/mapa-politico-de-america/',
		textoDespues: '.',
	},
};

const FICHAS: Record<string, SeoMapa> = {
	'mapa-politico-de-america': MAPA_POLITICO_AMERICA,
};

export function seoMapa(slug: string): SeoMapa | undefined {
	return FICHAS[slug];
}

export function notaMapa(slug: string): NotaMapa | undefined {
	return NOTAS[slug];
}

export function schemaMapaAmerica(archivos: { pagina: string; pdf: string; imagen: string }) {
	const ficha = MAPA_POLITICO_AMERICA;
	const sitio = 'https://www.aulita.com.ar';
	const media = {
		'@type': 'MediaObject',
		contentUrl: archivos.pdf,
		encodingFormat: 'application/pdf',
		isAccessibleForFree: true,
	};
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CreativeWork',
				name: ficha.h1,
				description: ficha.description,
				url: archivos.pagina,
				inLanguage: 'es-AR',
				isAccessibleForFree: true,
				learningResourceType: 'Mapa',
				educationalLevel: '5.º y 6.º',
				license: 'https://creativecommons.org/licenses/by-sa/4.0/',
				creditText: 'Fuente: Instituto Geográfico Nacional (IGN), CC BY-SA 4.0',
				creator: {
					'@type': 'Organization',
					name: 'Instituto Geográfico Nacional',
					url: 'https://www.ign.gob.ar',
				},
				publisher: { '@type': 'Organization', '@id': ID_ORGANIZACION, name: 'Aulita' },
				image: {
					'@type': 'ImageObject',
					contentUrl: archivos.imagen,
					encodingFormat: 'image/jpeg',
					name: ficha.h1,
					isAccessibleForFree: true,
				},
				encoding: media,
				associatedMedia: media,
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Inicio', item: `${sitio}/` },
					{ '@type': 'ListItem', position: 2, name: 'Mapas', item: `${sitio}/mapas/` },
					{ '@type': 'ListItem', position: 3, name: 'Mapa político de América', item: archivos.pagina },
				],
			},
			{
				'@type': 'FAQPage',
				mainEntity: ficha.faqs.map((item) => ({
					'@type': 'Question',
					name: item.q,
					acceptedAnswer: { '@type': 'Answer', text: item.a },
				})),
			},
		],
	};
}
