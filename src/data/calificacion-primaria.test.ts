import { describe, expect, it } from 'vitest';
import { paginaCalificacionJsonLd } from '../lib/seo';
import { evaluarNotas } from '../lib/promedio-primaria';
import { ariaEscala, calificacionDe, fraseAprobacion, jurisdiccionesCalificacion, jurisdiccionesHub, jurisdiccionesSinDatos, normaCitada, urlFichaProvincia } from './calificacion-primaria';

describe('calificación de primaria', () => {
	it('cubre las 24 jurisdicciones y no inventa números donde no hay datos', () => {
		expect(jurisdiccionesCalificacion).toHaveLength(24);
		const slugs = jurisdiccionesCalificacion.map((item) => item.slug);
		expect(new Set(slugs).size).toBe(24);
		for (const item of jurisdiccionesCalificacion.filter((fila) => fila.modo === 'sin-datos')) {
			expect(item.ciclo1).toBe('Sin datos oficiales publicados');
			expect(item.ciclo2).toBe('Sin datos oficiales publicados');
			expect(item.aprueba).toBe('Sin datos oficiales publicados');
			expect(item.apruebaCon).toBeUndefined();
			expect(`${item.ciclo1} ${item.aprueba}`).not.toMatch(/\d/);
		}
	});

	it('deja Neuquén sin una lista de conceptos que no fue publicada acá', () => {
		const neuquen = calificacionDe('neuquen');
		expect(neuquen?.norma).toBe('Res. 1398/14');
		expect(neuquen?.ciclo1).not.toMatch(/Logrado|Destacado|Sobresaliente/);
		expect(neuquen?.apruebaCon).toBeUndefined();
	});

	it('trunca el promedio de Mendoza sin redondear y aprueba desde 7', () => {
		const mendoza = calificacionDe('mendoza');
		expect(mendoza).toBeDefined();
		const justito = evaluarNotas(mendoza!, ['6,99', '7,00']);
		expect(justito.resultado?.promedio).toBe('6,99');
		expect(justito.resultado?.aprueba).toBe(false);
		const aprueba = evaluarNotas(mendoza!, ['7', '7,5']);
		expect(aprueba.resultado?.promedio).toBe('7,25');
		expect(aprueba.resultado?.aprueba).toBe(true);
	});

	it('no promedia un valor menor a 6 en Entre Ríos', () => {
		const entreRios = calificacionDe('entre-rios');
		expect(evaluarNotas(entreRios!, ['5']).error).toMatch(/En proceso de apropiación de contenidos/);
		expect(evaluarNotas(entreRios!, ['6', '8']).resultado?.aprueba).toBe(true);
	});

	it('avisa que en Buenos Aires la nota final no es el promedio', () => {
		expect(calificacionDe('buenos-aires')?.aviso).toMatch(/no es un promedio/);
	});

	it('agrupa el hub en 7 escalas, 4 conceptuales y 13 sin datos', () => {
		const escalas = jurisdiccionesHub('escala');
		expect(escalas.map((item) => item.slug)).toEqual(['buenos-aires', 'caba', 'mendoza', 'salta', 'santa-fe', 'entre-rios', 'catamarca']);
		expect(jurisdiccionesHub('conceptos').map((item) => item.slug)).toEqual(['chubut', 'jujuy', 'rio-negro', 'neuquen']);
		expect(jurisdiccionesSinDatos()).toHaveLength(13);
		expect(escalas.filter((item) => item.hub?.guia).map((item) => item.slug)).toEqual(['buenos-aires', 'caba']);
		for (const item of escalas) {
			expect(fraseAprobacion(item)).toMatch(new RegExp(`^En ${item.nombre} se aprueba con .+ \\(${normaCitada(item.norma)}\\)\\.$`));
			expect(item.hub?.viñetas).toHaveLength(2);
		}
	});

	it('muestra solo la escala real de Entre Ríos y cita la norma que falta', () => {
		const entreRios = calificacionDe('entre-rios');
		expect(entreRios?.hub?.escala).toEqual({ tipo: 'numero', desde: 6, hasta: 10, apruebaDesde: 6 });
		expect(ariaEscala(entreRios!)).toBe('Escala del 6 al 10, aprueba con 6');
		expect(fraseAprobacion(entreRios!)).toBe('En Entre Ríos se aprueba con 6 (Res. 920/19 CGE).');
		expect(normaCitada(calificacionDe('jujuy')!.norma)).toBe('Sin norma citada');
		expect(urlFichaProvincia(calificacionDe('mendoza')!, 'https://www.aulita.com.ar', '/como-se-califica-en-primaria/')).toBe(
			'https://www.aulita.com.ar/como-se-califica-en-primaria/#mendoza',
		);
		expect(urlFichaProvincia(calificacionDe('caba')!, 'https://www.aulita.com.ar', '/como-se-califica-en-primaria/')).toBe(
			'https://www.aulita.com.ar/como-se-califica-en-primaria/caba/',
		);
	});

	it('suma el ItemList de escalas sin sacar Article, migas, FAQ ni Dataset', () => {
		const escalas = jurisdiccionesHub('escala');
		const conLista = paginaCalificacionJsonLd({
			tipo: 'Article',
			nombre: 'Cómo se califica en la escuela primaria en Argentina',
			descripcion: 'Descripción',
			ruta: '/como-se-califica-en-primaria/',
			actualizado: '2026-10-25',
			migas: [{ name: 'Inicio', url: '/' }],
			preguntas: [{ q: '¿Con cuánto se aprueba en primaria?', a: 'Con 6 o con 7.' }],
			dataset: { name: 'Escalas', description: 'Por provincia' },
			lista: escalas.map((item) => ({
				name: item.nombre,
				url: urlFichaProvincia(item, 'https://www.aulita.com.ar', '/como-se-califica-en-primaria/'),
			})),
		});
		const tipos = (conLista['@graph'] as { '@type': string }[]).map((nodo) => nodo['@type']);
		expect(tipos).toEqual(['Article', 'BreadcrumbList', 'FAQPage', 'Dataset', 'ItemList']);
		const lista = (conLista['@graph'] as { '@type': string; numberOfItems?: number }[]).find((nodo) => nodo['@type'] === 'ItemList');
		expect(lista?.numberOfItems).toBe(7);

		const sinLista = paginaCalificacionJsonLd({
			tipo: 'Article',
			nombre: 'Otra ficha',
			descripcion: 'Descripción',
			ruta: '/como-se-califica-en-primaria/caba/',
			actualizado: '2026-10-25',
			migas: [{ name: 'Inicio', url: '/' }],
			preguntas: [{ q: '¿Pregunta?', a: 'Respuesta.' }],
		});
		expect((sinLista['@graph'] as { '@type': string }[]).map((nodo) => nodo['@type'])).toEqual(['Article', 'BreadcrumbList', 'FAQPage']);
	});
});
