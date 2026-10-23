import catalogo from './mapas-ign.json';

export const categoriasMapa = [
	{ id: 'argentina', nombre: 'Argentina' },
	{ id: 'provincia', nombre: 'Provincias' },
	{ id: 'america', nombre: 'América' },
	{ id: 'mundo', nombre: 'Mundo' },
	{ id: 'tematico', nombre: 'Temáticos' },
] as const;

export const tiposMapa = [
	{ id: 'politico', nombre: 'Político' },
	{ id: 'fisico', nombre: 'Físico' },
	{ id: 'mudo', nombre: 'Mudo' },
	{ id: 'satelital', nombre: 'Satelital' },
	{ id: 'tematico', nombre: 'Temático' },
	{ id: 'fisico-politico', nombre: 'Físico-político' },
	{ id: 'carta-topografica', nombre: 'Carta topográfica' },
] as const;

const ordenTipos = tiposMapa.map((tipo) => tipo.id);

/** En producción los archivos salen de Vercel Blob. En `astro dev` se leen de public/mapas/ign. */
export const BASE_MAPAS = 'https://sxggwoqjuhdstuyc.public.blob.vercel-storage.com/mapas/ign';

export type CategoriaMapa = (typeof categoriasMapa)[number]['id'];
export type TipoMapa = (typeof tiposMapa)[number]['id'];
export type MapaIgn = (typeof catalogo.mapas)[number];
export type ClaseArchivoMapa = 'pdf' | 'jpg' | 'thumb';

export const mapas: MapaIgn[] = catalogo.mapas;

export function nombreCategoria(categoria: string): string {
	return categoriasMapa.find((item) => item.id === categoria)?.nombre ?? categoria;
}

export function nombreTipo(tipo: string): string {
	return tiposMapa.find((item) => item.id === tipo)?.nombre ?? tipo;
}

export function mapasPorCategoria(categoria: CategoriaMapa): MapaIgn[] {
	return ordenarMapas(mapas.filter((mapa) => mapa.categoria === categoria));
}

export function mapasPorTipo(tipo: TipoMapa): MapaIgn[] {
	return mapas.filter((mapa) => mapa.tipo === tipo);
}

/** El catálogo guarda la provincia con guion bajo; la ficha usa guiones. */
export function mapasDeProvincia(slugProvincia: string): MapaIgn[] {
	return ordenarMapas(mapas.filter((mapa) => mapa.provincia?.replaceAll('_', '-') === slugProvincia));
}

export function ordenarMapas(lista: MapaIgn[]): MapaIgn[] {
	return [...lista].sort((a, b) => {
		const porTipo = ordenTipos.indexOf(a.tipo) - ordenTipos.indexOf(b.tipo);
		if (porTipo !== 0) return porTipo;
		return a.titulo.localeCompare(b.titulo, 'es');
	});
}

export function mapasRelacionados(mapa: MapaIgn): MapaIgn[] {
	const lista = mapa.provincia ? mapasDeProvincia(mapa.provincia.replaceAll('_', '-')) : mapasPorCategoria(mapa.categoria);
	return lista.filter((item) => item.slug !== mapa.slug);
}

export function baseMapas(): string {
	const publica = import.meta.env.PUBLIC_MAPAS_BASE;
	if (typeof publica === 'string' && publica.length > 0) return publica.replace(/\/$/, '');
	if (import.meta.env.DEV) return '/mapas/ign';
	return BASE_MAPAS;
}

export function enlacePdf(ruta: string): string {
	if (!ruta.startsWith('https://')) return ruta;
	const url = new URL(ruta);
	url.searchParams.set('download', '1');
	return url.href;
}

export function rutaMapa(base: string, slug: string, clase: ClaseArchivoMapa): string {
	const nombre = clase === 'thumb' ? `${slug}-thumb.webp` : `${slug}.${clase}`;
	return `${base.replace(/\/$/, '')}/${nombre}`;
}

export function archivoMapa(slug: string, clase: ClaseArchivoMapa): string {
	const ruta = rutaMapa(baseMapas(), slug, clase);
	return clase === 'pdf' ? enlacePdf(ruta) : ruta;
}
