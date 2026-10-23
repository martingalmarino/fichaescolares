export interface SimboloImagen {
	src: string;
	licencia: string;
	pagina: string;
}

export interface Provincia {
	slug: string;
	nombre: string;
	capital: string | null;
	region: string | null;
	superficie: string;
	poblacion: string;
	flor: string | null;
	arbol: string | null;
	bandera: SimboloImagen | null;
	escudo: SimboloImagen | null;
	palabras: string[] | null;
	fuentes: string[];
	normas: string[];
	silueta: string;
	verificado: true;
}

const superficieFormato = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
const poblacionFormato = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

function registro(valor: unknown): Record<string, unknown> | null {
	if (!valor || typeof valor !== 'object') return null;
	return valor as Record<string, unknown>;
}

function fuentesHttp(campo: Record<string, unknown>): string[] {
	if (!Array.isArray(campo.fuente)) return [];
	return campo.fuente.filter((item): item is string => typeof item === 'string' && /^https:\/\/\S+$/.test(item));
}

function texto(campo: Record<string, unknown> | null): { valor: string; fuentes: string[]; norma?: string } | null {
	if (!campo || campo.verificado !== true || typeof campo.valor !== 'string') return null;
	const valor = campo.valor.trim();
	const fuentes = fuentesHttp(campo);
	if (!valor || fuentes.length === 0) return null;
	const norma = typeof campo.norma === 'string' && campo.norma.trim() ? campo.norma.trim() : undefined;
	return { valor, fuentes, norma };
}

function numero(campo: Record<string, unknown> | null): { valor: number; fuentes: string[] } | null {
	if (!campo || campo.verificado !== true || typeof campo.valor !== 'number' || !Number.isFinite(campo.valor)) return null;
	const fuentes = fuentesHttp(campo);
	if (fuentes.length === 0) return null;
	return { valor: campo.valor, fuentes };
}

function licenciaLibre(licencia: string): boolean {
	const textoLicencia = licencia.trim().toLowerCase();
	if (textoLicencia === 'public domain' || textoLicencia.startsWith('cc0')) return true;
	if (textoLicencia.includes('nc') || textoLicencia.includes('-nd')) return false;
	return /^cc by( |$|-sa\b)/.test(textoLicencia);
}

function imagen(campo: Record<string, unknown> | null): (SimboloImagen & { fuentes: string[] }) | null {
	if (campo && typeof campo.nota === 'string' && /no vigente|versi[oó]n vieja/i.test(campo.nota)) return null;
	const base = texto(campo);
	if (!base || !campo || typeof campo.licencia !== 'string' || typeof campo.url_archivo !== 'string') return null;
	if (!licenciaLibre(campo.licencia)) return null;
	if (!base.valor.startsWith('https://commons.wikimedia.org/')) return null;
	let src: URL;
	try {
		src = new URL(campo.url_archivo);
	} catch {
		return null;
	}
	if (src.protocol !== 'https:' || src.hostname !== 'upload.wikimedia.org') return null;
	src.search = '';
	return {
		src: src.toString(),
		licencia: campo.licencia.trim(),
		pagina: base.valor.split('?')[0] ?? base.valor,
		fuentes: base.fuentes,
	};
}

function palabras(campo: Record<string, unknown> | null): string[] | null {
	if (!campo || campo.verificado !== true || !Array.isArray(campo.valor) || campo.valor.length !== 8) return null;
	if (!campo.valor.every((item) => typeof item === 'string' && /^[A-ZÑ]{3,16}$/.test(item))) return null;
	if (new Set(campo.valor).size !== 8) return null;
	if (fuentesHttp(campo).length === 0) return null;
	return campo.valor;
}

function unicas(urls: string[]): string[] {
	return [...new Set(urls)];
}

export function publicarProvincias(entrada: unknown, siluetas: ReadonlySet<string>): Provincia[] {
	if (!Array.isArray(entrada)) return [];
	const publicadas: Provincia[] = [];
	for (const item of entrada) {
		const provincia = registro(item);
		if (!provincia || typeof provincia.id !== 'string' || typeof provincia.nombre !== 'string') continue;
		const slug = provincia.id.replaceAll('_', '-');
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !siluetas.has(slug)) continue;
		const superficie = numero(registro(provincia.superficie_km2));
		const poblacion = numero(registro(provincia.poblacion_2022));
		if (!superficie || !poblacion) continue;
		const capital = texto(registro(provincia.capital));
		const region = texto(registro(provincia.region));
		const flor = texto(registro(provincia.flor_provincial));
		const arbol = texto(registro(provincia.arbol_provincial));
		const bandera = imagen(registro(provincia.bandera));
		const escudo = imagen(registro(provincia.escudo));
		const banco = palabras(registro(provincia.palabras_clave));
		const normas = [flor?.norma, arbol?.norma].filter((norma): norma is string => Boolean(norma));
		publicadas.push({
			slug,
			nombre: provincia.nombre.trim(),
			capital: capital?.valor ?? null,
			region: region?.valor ?? null,
			superficie: `${superficieFormato.format(superficie.valor)} km²`,
			poblacion: `${poblacionFormato.format(poblacion.valor)} habitantes (Censo 2022)`,
			flor: flor?.valor ?? null,
			arbol: arbol?.valor ?? null,
			bandera: bandera ? { src: bandera.src, licencia: bandera.licencia, pagina: bandera.pagina } : null,
			escudo: escudo ? { src: escudo.src, licencia: escudo.licencia, pagina: escudo.pagina } : null,
			palabras: banco,
			fuentes: unicas([
				...(capital?.fuentes ?? []),
				...(region?.fuentes ?? []),
				...superficie.fuentes,
				...poblacion.fuentes,
				...(flor?.fuentes ?? []),
				...(arbol?.fuentes ?? []),
				...(bandera ? [bandera.pagina] : []),
				...(escudo ? [escudo.pagina] : []),
			]),
			normas: unicas(normas),
			silueta: `/provincias/siluetas/${slug}.svg`,
			verificado: true,
		});
	}
	return publicadas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
