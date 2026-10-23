import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import crudas from './laminas.json';
import { efemerides, etiquetaFecha } from './efemerides';

export const categorias = [
	{ id: 'simbolos-patrios', nombre: 'Símbolos patrios' },
	{ id: '25-de-mayo', nombre: '25 de Mayo' },
	{ id: '9-de-julio', nombre: '9 de Julio' },
	{ id: 'san-martin', nombre: 'San Martín' },
	{ id: 'tradiciones', nombre: 'Tradiciones' },
	{ id: 'naturaleza', nombre: 'Naturaleza' },
] as const;

export const dificultades = [
	{ id: 'simple', nombre: 'Simple' },
	{ id: 'media', nombre: 'Media' },
	{ id: 'detallada', nombre: 'Detallada' },
] as const;

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_TITULO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export interface Lamina {
	slug: string;
	titulo: string;
	categoria: (typeof categorias)[number]['id'];
	efemerides: string[];
	dificultad: (typeof dificultades)[number]['id'];
	alt: string;
	estado: 'publicar' | 'revisar';
	origen: string;
	svg: string;
	ancho: number;
	alto: number;
}

export interface FechaLamina {
	clave: string;
	etiqueta: string;
	dia: number;
	mes: number;
	ficha: string | null;
	sopa: string | null;
}

function raizDelProyecto(): string {
	let dir = dirname(fileURLToPath(import.meta.url));
	for (let i = 0; i < 8; i++) {
		if (existsSync(join(dir, 'public', 'laminas'))) return dir;
		const padre = dirname(dir);
		if (padre === dir) break;
		dir = padre;
	}
	throw new Error('No encuentro public/laminas desde el módulo de datos');
}

const raiz = raizDelProyecto();

function medidas(svgPublico: string): { ancho: number; alto: number } {
	const archivo = join(raiz, 'public', svgPublico.replace(/^\//, ''));
	const texto = readFileSync(archivo, 'utf8');
	const match = texto.match(/viewBox="\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*"/);
	if (!match) throw new Error(`Sin viewBox en ${svgPublico}`);
	const ancho = Number(match[1]);
	const alto = Number(match[2]);
	if (!ancho || !alto) throw new Error(`viewBox inválido en ${svgPublico}`);
	return { ancho, alto };
}

export function partirFecha(texto: string): { dia: number; mes: number } | null {
	const limpio = texto
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.trim();
	const match = limpio.match(/^(\d{1,2}) de ([a-z]+)$/);
	if (!match) return null;
	const dia = Number(match[1]);
	const mes = MESES.indexOf(match[2]) + 1;
	if (!dia || mes < 1 || dia > 31) return null;
	return { dia, mes };
}

export function claveFecha(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-');
}

function etiquetaSuelta(dia: number, mes: number): string {
	return `${dia} de ${MESES_TITULO[mes - 1] ?? ''}`;
}

function cargar(valor: unknown): Lamina {
	if (!valor || typeof valor !== 'object') throw new Error('Lámina incompleta');
	const item = valor as Lamina;
	const categoria = categorias.some((entrada) => entrada.id === item.categoria);
	const dificultad = dificultades.some((entrada) => entrada.id === item.dificultad);
	if (!item.slug || !item.titulo || !item.alt || !item.svg?.startsWith('/laminas/')) {
		throw new Error(`Lámina incompleta: ${item.slug || 'sin slug'}`);
	}
	if (!categoria) throw new Error(`Categoría desconocida en ${item.slug}`);
	if (!dificultad) throw new Error(`Dificultad desconocida en ${item.slug}`);
	if (item.estado !== 'publicar' && item.estado !== 'revisar') throw new Error(`Estado desconocido en ${item.slug}`);
	if (!Array.isArray(item.efemerides) || item.efemerides.some((fecha) => !partirFecha(fecha))) {
		throw new Error(`Fecha inválida en ${item.slug}`);
	}
	return { ...item, ...medidas(item.svg) };
}

const todas = crudas.map(cargar);
const slugs = new Set<string>();
for (const lamina of todas) {
	if (slugs.has(lamina.slug)) throw new Error(`Slug repetido: ${lamina.slug}`);
	slugs.add(lamina.slug);
}

export const laminas: Lamina[] = todas;
export const publicadas: Lamina[] = todas.filter((lamina) => lamina.estado === 'publicar');

export function nombreCategoria(id: string): string {
	return categorias.find((item) => item.id === id)?.nombre ?? id;
}

export function nombreDificultad(id: string): string {
	return dificultades.find((item) => item.id === id)?.nombre ?? id;
}

export function fechaDeTexto(texto: string): FechaLamina | null {
	const partes = partirFecha(texto);
	if (!partes) return null;
	const oficial = efemerides.find((item) => item.dia === partes.dia && item.mes === partes.mes);
	const clave = claveFecha(texto);
	return {
		clave,
		dia: partes.dia,
		mes: partes.mes,
		etiqueta: oficial ? etiquetaFecha(oficial.dia, oficial.mes, oficial.nombre) : etiquetaSuelta(partes.dia, partes.mes),
		ficha: oficial ? `/efemerides/${oficial.slug}/` : null,
		sopa: oficial ? `/sopa-de-letras/?e=${oficial.slug}` : null,
	};
}

export function fechasDe(lamina: Lamina): FechaLamina[] {
	return lamina.efemerides.flatMap((texto) => {
		const fecha = fechaDeTexto(texto);
		return fecha ? [fecha] : [];
	});
}

export function laminasDeFecha(dia: number, mes: number): Lamina[] {
	return publicadas.filter((lamina) =>
		lamina.efemerides.some((texto) => {
			const partes = partirFecha(texto);
			return partes?.dia === dia && partes.mes === mes;
		}),
	);
}

export function opcionesEfemeride(): FechaLamina[] {
	const mapa = new Map<string, FechaLamina>();
	for (const lamina of publicadas) {
		for (const fecha of fechasDe(lamina)) {
			if (!mapa.has(fecha.clave)) mapa.set(fecha.clave, fecha);
		}
	}
	return [...mapa.values()].sort((a, b) => a.mes - b.mes || a.dia - b.dia);
}

export function relacionadas(lamina: Lamina, limite = 4): Lamina[] {
	const fechas = new Set(lamina.efemerides);
	return publicadas
		.filter((otra) => otra.slug !== lamina.slug)
		.map((otra) => ({
			otra,
			peso: (otra.categoria === lamina.categoria ? 2 : 0) + otra.efemerides.filter((fecha) => fechas.has(fecha)).length,
		}))
		.filter((item) => item.peso > 0)
		.sort((a, b) => b.peso - a.peso || a.otra.titulo.localeCompare(b.otra.titulo, 'es'))
		.slice(0, limite)
		.map((item) => item.otra);
}

export function laminaPorSlug(slug: string): Lamina | undefined {
	return publicadas.find((lamina) => lamina.slug === slug);
}
