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
