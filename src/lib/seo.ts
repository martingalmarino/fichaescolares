export const ID_SITIO = 'https://www.aulita.com.ar/#website';
export const ID_ORGANIZACION = 'https://www.aulita.com.ar/#organization';

export function isoFecha(anio: number, mes: number, dia: number): string {
	return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export function itemListJsonLd(nombre: string, items: { name: string; url: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: nombre,
		numberOfItems: items.length,
		itemListElement: items.map((item, indice) => ({
			'@type': 'ListItem',
			position: indice + 1,
			name: item.name,
			url: item.url,
		})),
	};
}

export function eventoEfemeride(entrada: {
	nombre: string;
	descripcion: string;
	url: string;
	sitio: string;
	inicio: string | null;
	migas: { name: string; url: string }[];
}) {
	const evento: Record<string, unknown> = {
		'@type': 'Event',
		name: entrada.nombre,
		eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
		location: { '@type': 'VirtualLocation', url: entrada.url },
		description: entrada.descripcion,
		organizer: { '@id': ID_ORGANIZACION },
	};
	if (entrada.inicio) evento.startDate = entrada.inicio;
	return {
		'@context': 'https://schema.org',
		'@graph': [
			evento,
			{
				'@type': 'BreadcrumbList',
				itemListElement: entrada.migas.map((miga, indice) => ({
					'@type': 'ListItem',
					position: indice + 1,
					name: miga.name,
					item: miga.url,
				})),
			},
		],
	};
}

export function faqJsonLd(preguntas: { q: string; a: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: preguntas.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: { '@type': 'Answer', text: item.a },
		})),
	};
}

const SITIO = 'https://www.aulita.com.ar';

export function etiquetasJsonLd(entrada: {
	nombre: string;
	descripcion: string;
	ruta: string;
	migas: { name: string; url: string }[];
	preguntas: { q: string; a: string }[];
	pasos?: readonly { name: string; text: string }[];
}) {
	const url = `${SITIO}${entrada.ruta}`;
	const graph: Record<string, unknown>[] = [
		{
			'@type': 'WebApplication',
			name: entrada.nombre,
			description: entrada.descripcion,
			applicationCategory: 'EducationalApplication',
			operatingSystem: 'Web',
			inLanguage: 'es-AR',
			url,
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
			isAccessibleForFree: true,
		},
		{
			'@type': 'BreadcrumbList',
			itemListElement: entrada.migas.map((miga, indice) => ({
				'@type': 'ListItem',
				position: indice + 1,
				name: miga.name,
				item: miga.url.startsWith('http') ? miga.url : `${SITIO}${miga.url}`,
			})),
		},
		{
			'@type': 'FAQPage',
			mainEntity: entrada.preguntas.map((item) => ({
				'@type': 'Question',
				name: item.q,
				acceptedAnswer: { '@type': 'Answer', text: item.a },
			})),
		},
	];
	if (entrada.pasos) {
		graph.push({
			'@type': 'HowTo',
			name: `Cómo imprimir: ${entrada.nombre}`,
			inLanguage: 'es-AR',
			step: entrada.pasos.map((paso, indice) => ({
				'@type': 'HowToStep',
				position: indice + 1,
				name: paso.name,
				text: paso.text,
			})),
		});
	}
	return { '@context': 'https://schema.org', '@graph': graph };
}

export function paginaCalificacionJsonLd(entrada: {
	tipo: 'Article' | 'WebApplication';
	nombre: string;
	descripcion: string;
	ruta: string;
	actualizado: string;
	migas: { name: string; url: string }[];
	preguntas: { q: string; a: string }[];
	dataset?: { name: string; description: string };
}) {
	const url = `${SITIO}${entrada.ruta}`;
	const principal =
		entrada.tipo === 'Article'
			? {
					'@type': 'Article',
					headline: entrada.nombre,
					description: entrada.descripcion,
					inLanguage: 'es-AR',
					dateModified: entrada.actualizado,
					url,
					author: { '@id': ID_ORGANIZACION },
					publisher: { '@id': ID_ORGANIZACION },
				}
			: {
					'@type': 'WebApplication',
					name: entrada.nombre,
					description: entrada.descripcion,
					applicationCategory: 'EducationalApplication',
					operatingSystem: 'Web',
					inLanguage: 'es-AR',
					url,
					dateModified: entrada.actualizado,
					offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
				};
	const graph: Record<string, unknown>[] = [
		principal,
		{
			'@type': 'BreadcrumbList',
			itemListElement: entrada.migas.map((miga, indice) => ({
				'@type': 'ListItem',
				position: indice + 1,
				name: miga.name,
				item: miga.url.startsWith('http') ? miga.url : `${SITIO}${miga.url}`,
			})),
		},
		{
			'@type': 'FAQPage',
			mainEntity: entrada.preguntas.map((item) => ({
				'@type': 'Question',
				name: item.q,
				acceptedAnswer: { '@type': 'Answer', text: item.a },
			})),
		},
	];
	if (entrada.dataset) {
		graph.push({
			'@type': 'Dataset',
			name: entrada.dataset.name,
			description: entrada.dataset.description,
			inLanguage: 'es-AR',
			dateModified: entrada.actualizado,
			url,
			creator: { '@id': ID_ORGANIZACION },
		});
	}
	return { '@context': 'https://schema.org', '@graph': graph };
}

export function fichaJsonLd(nombre: string, descripcion: string, path: string) {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebApplication',
				name: nombre,
				description: descripcion,
				applicationCategory: 'EducationalApplication',
				operatingSystem: 'Web',
				url: path,
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
			},
			{
				'@type': 'HowTo',
				name: `Cómo crear e imprimir: ${nombre}`,
				step: [
					{ '@type': 'HowToStep', name: 'Elegí las opciones', text: 'Definí fecha, tamaño o consigna en el panel.' },
					{ '@type': 'HowToStep', name: 'Revisá la hoja', text: 'La vista previa muestra la ficha en A4.' },
					{ '@type': 'HowToStep', name: 'Imprimí o guardá el PDF', text: 'Usá Imprimir o Descargar PDF y elegí Guardar como PDF.' },
				],
			},
		],
	};
}
