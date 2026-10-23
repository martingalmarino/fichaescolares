import { useEffect, useState } from 'preact/hooks';

interface Tarjeta {
	slug: string;
	titulo: string;
	categoria: string;
	fechas: string[];
	dificultad: string;
	alt: string;
	svg: string;
	ancho: number;
	alto: number;
}

interface Opcion {
	id: string;
	nombre: string;
}

interface Props {
	tarjetas: Tarjeta[];
	categorias: Opcion[];
	efemerides: Opcion[];
	dificultades: Opcion[];
	inicialCategoria: string;
	inicialEfemeride: string;
	inicialDificultad: string;
	adsense: string;
	adsenseSlot: string;
}

function valorInicial(valor: string, opciones: Opcion[]): string {
	return opciones.some((item) => item.id === valor) ? valor : '';
}

export default function FiltroLaminas({
	tarjetas,
	categorias,
	efemerides,
	dificultades,
	inicialCategoria,
	inicialEfemeride,
	inicialDificultad,
	adsense,
	adsenseSlot,
}: Props) {
	const [categoria, setCategoria] = useState(valorInicial(inicialCategoria, categorias));
	const [efemeride, setEfemeride] = useState(valorInicial(inicialEfemeride, efemerides));
	const [dificultad, setDificultad] = useState(valorInicial(inicialDificultad, dificultades));
	const [listo, setListo] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		setCategoria(valorInicial(params.get('categoria') ?? '', categorias));
		setEfemeride(valorInicial(params.get('e') ?? params.get('efemeride') ?? '', efemerides));
		setDificultad(valorInicial(params.get('dificultad') ?? '', dificultades));
		setListo(true);
	}, [categorias, efemerides, dificultades]);

	useEffect(() => {
		if (!listo) return;
		const url = new URL(window.location.href);
		const poner = (clave: string, valor: string) => {
			if (valor) url.searchParams.set(clave, valor);
			else url.searchParams.delete(clave);
		};
		poner('categoria', categoria);
		url.searchParams.delete('e');
		poner('efemeride', efemeride);
		poner('dificultad', dificultad);
		const siguiente = `${url.pathname}${url.search}`;
		if (`${window.location.pathname}${window.location.search}` !== siguiente) {
			history.replaceState(null, '', siguiente);
		}
	}, [listo, categoria, efemeride, dificultad]);

	useEffect(() => {
		if (!adsense) return;
		const anuncio = window as Window & { adsbygoogle?: unknown[] };
		anuncio.adsbygoogle = anuncio.adsbygoogle || [];
		anuncio.adsbygoogle.push({});
	}, [adsense]);

	const visibles = tarjetas.filter((item) => {
		if (categoria && item.categoria !== categoria) return false;
		if (efemeride && !item.fechas.includes(efemeride)) return false;
		if (dificultad && item.dificultad !== dificultad) return false;
		return true;
	});

	const primera = visibles.slice(0, 3);
	const resto = visibles.slice(3);

	return (
		<div>
			<form class="grid gap-3 sm:grid-cols-3" onSubmit={(event) => event.preventDefault()}>
				<label class="block text-sm font-medium text-azul">
					Categoría
					<select class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm" value={categoria} onChange={(event) => setCategoria(event.currentTarget.value)}>
						<option value="">Todas</option>
						{categorias.map((item) => (
							<option key={item.id} value={item.id}>
								{item.nombre}
							</option>
						))}
					</select>
				</label>
				<label class="block text-sm font-medium text-azul">
					Efeméride
					<select class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm" value={efemeride} onChange={(event) => setEfemeride(event.currentTarget.value)}>
						<option value="">Todas</option>
						{efemerides.map((item) => (
							<option key={item.id} value={item.id}>
								{item.nombre}
							</option>
						))}
					</select>
				</label>
				<label class="block text-sm font-medium text-azul">
					Dificultad
					<select class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm" value={dificultad} onChange={(event) => setDificultad(event.currentTarget.value)}>
						<option value="">Todas</option>
						{dificultades.map((item) => (
							<option key={item.id} value={item.id}>
								{item.nombre}
							</option>
						))}
					</select>
				</label>
			</form>
			<p class="mt-4 text-sm text-muted">
				{visibles.length === 1 ? '1 lámina' : `${visibles.length} láminas`}
			</p>
			{visibles.length === 0 ? (
				<p class="mt-6 rounded-card border border-borde bg-white p-4 text-sm text-muted">No hay láminas con esos filtros.</p>
			) : (
				<>
					<ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{primera.map((item) => (
							<li key={item.slug}>
								<Tarjeta item={item} dificultades={dificultades} />
							</li>
						))}
					</ul>
					{adsense && (
						<aside class="ad no-print print:hidden my-6" aria-label="Anuncio">
							<ins class="adsbygoogle" style="display:block" data-ad-client={adsense} data-ad-slot={adsenseSlot || undefined} data-ad-format="auto" data-full-width-responsive="true" />
						</aside>
					)}
					{resto.length > 0 && (
						<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{resto.map((item) => (
								<li key={item.slug}>
									<Tarjeta item={item} dificultades={dificultades} />
								</li>
							))}
						</ul>
					)}
				</>
			)}
		</div>
	);
}

function nombre(id: string, opciones: Opcion[]): string {
	return opciones.find((item) => item.id === id)?.nombre ?? id;
}

function Tarjeta({ item, dificultades }: { item: Tarjeta; dificultades: Opcion[] }) {
	return (
		<a class="flex h-full flex-col rounded-card border border-borde bg-white p-3 shadow-card transition hover:border-celeste" href={`/laminas/${item.slug}/`}>
			<img
				src={item.svg}
				alt={item.alt}
				width={item.ancho}
				height={item.alto}
				loading="lazy"
				decoding="async"
				class="h-auto w-full object-contain"
				style={`aspect-ratio: ${item.ancho} / ${item.alto}`}
			/>
			<span class="mt-3 text-sm font-semibold leading-snug text-azul">{item.titulo}</span>
			<span class="mt-1 text-xs font-medium text-muted">{nombre(item.dificultad, dificultades)}</span>
		</a>
	);
}
