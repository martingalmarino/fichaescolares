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
		organizer: { '@type': 'Organization', name: 'Aulita', url: entrada.sitio },
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
