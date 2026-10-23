import { useEffect, useState } from 'preact/hooks';

interface Tarjeta {
	slug: string;
	titulo: string;
	categoria: string;
	tipo: string;
	tipoNombre: string;
	tamano: string;
	grado: string;
	src: string;
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
	tipos: Opcion[];
}

function leerParam(clave: string, opciones: Opcion[]): string {
	const valor = new URLSearchParams(window.location.search).get(clave) ?? '';
	return opciones.some((item) => item.id === valor) ? valor : '';
}

function TarjetaMapa({ mapa }: { mapa: Tarjeta }) {
	return (
		<a class="flex h-full flex-col rounded-card border border-borde bg-white p-3 shadow-card transition hover:border-celeste" href={`/mapas/${mapa.slug}/`}>
			<img
				src={mapa.src}
				alt={mapa.titulo}
				width={mapa.ancho}
				height={mapa.alto}
				loading="lazy"
				decoding="async"
				class="h-auto w-full bg-white object-contain"
				style={`aspect-ratio: ${mapa.ancho} / ${mapa.alto}`}
			/>
			<span class="mt-3 text-sm font-semibold leading-snug text-azul">{mapa.titulo}</span>
			<span class="mt-1 text-xs font-medium text-muted">
				{mapa.tipoNombre} · {mapa.tamano} · {mapa.grado}
			</span>
		</a>
	);
}

export default function FiltroMapas({ tarjetas, categorias, tipos }: Props) {
	const [categoria, setCategoria] = useState('');
	const [tipo, setTipo] = useState('');
	const [listo, setListo] = useState(false);

	useEffect(() => {
		setCategoria(leerParam('categoria', categorias));
		setTipo(leerParam('tipo', tipos));
		setListo(true);
	}, [categorias, tipos]);

	useEffect(() => {
		if (!listo) return;
		const url = new URL(window.location.href);
		const poner = (clave: string, valor: string) => {
			if (valor) url.searchParams.set(clave, valor);
			else url.searchParams.delete(clave);
		};
		poner('categoria', categoria);
		poner('tipo', tipo);
		const siguiente = `${url.pathname}${url.search}`;
		if (`${window.location.pathname}${window.location.search}` !== siguiente) {
			history.replaceState(null, '', siguiente);
		}
	}, [listo, categoria, tipo]);

	const visibles = tarjetas.filter((mapa) => {
		if (categoria && mapa.categoria !== categoria) return false;
		if (tipo && mapa.tipo !== tipo) return false;
		return true;
	});
	const hayFiltro = categoria !== '' || tipo !== '';
	const grupos = categorias
		.map((item) => ({ ...item, mapas: visibles.filter((mapa) => mapa.categoria === item.id) }))
		.filter((grupo) => grupo.mapas.length > 0);

	return (
		<div>
			<form class="grid gap-3 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
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
					Tipo
					<select class="mt-1.5 w-full rounded-control border border-borde bg-white px-3 py-2 text-sm" value={tipo} onChange={(event) => setTipo(event.currentTarget.value)}>
						<option value="">Todos</option>
						{tipos.map((item) => (
							<option key={item.id} value={item.id}>
								{item.nombre}
							</option>
						))}
					</select>
				</label>
			</form>
			{visibles.length === 0 && <p class="mt-8 text-muted">No hay mapas con ese filtro.</p>}
			{hayFiltro ? (
				<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{visibles.map((mapa) => (
						<li key={mapa.slug}>
							<TarjetaMapa mapa={mapa} />
						</li>
					))}
				</ul>
			) : (
				<div class="mt-10 space-y-10">
					{grupos.map((grupo) => (
						<section key={grupo.id} aria-labelledby={`mapas-${grupo.id}`}>
							<h2 id={`mapas-${grupo.id}`} class="text-2xl font-bold tracking-tight text-azul">
								{grupo.nombre}
							</h2>
							<ul class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{grupo.mapas.map((mapa) => (
									<li key={mapa.slug}>
										<TarjetaMapa mapa={mapa} />
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
			)}
		</div>
	);
}
