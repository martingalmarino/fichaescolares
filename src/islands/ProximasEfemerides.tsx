import { useEffect, useState } from 'preact/hooks';
import type { Efemeride } from '../data/efemerides';
import { chipFecha, proximasEfemerides } from '../lib/calendario';

interface Props {
	iniciales: Efemeride[];
	todas: Efemeride[];
}

export default function ProximasEfemerides({ iniciales, todas }: Props) {
	const [fechas, setFechas] = useState(iniciales);

	useEffect(() => {
		setFechas(proximasEfemerides(todas, new Date(), 4));
	}, [todas]);

	return (
		<ul class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{fechas.map((fecha) => (
				<li key={fecha.slug} class="flex flex-col rounded-card border border-borde bg-white p-4 shadow-card">
					<span class="inline-flex w-fit rounded-md bg-celeste px-2 py-1 text-[11px] font-semibold tracking-wide text-white">
						{chipFecha(fecha.dia, fecha.mes)}
					</span>
					<h3 class="mt-3 text-base font-semibold leading-snug text-azul">{fecha.nombre}</h3>
					<p class="mt-1 flex-1 text-sm leading-relaxed text-muted">{fecha.linea}</p>
					<a href={`/sopa-de-letras/?e=${fecha.slug}`} class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-celeste hover:underline">
						Crear fichas
						<span aria-hidden="true">→</span>
					</a>
				</li>
			))}
		</ul>
	);
}
