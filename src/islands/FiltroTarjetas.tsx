import { useState } from 'preact/hooks';

const FILTROS = [
	{ id: 'todas', label: 'Todas' },
	{ id: 'inicial', label: 'Nivel inicial' },
	{ id: 'primero', label: '1.º grado' },
	{ id: 'segundo', label: '2.º grado' },
	{ id: 'lectoescritura', label: 'Lectoescritura' },
	{ id: 'matematica', label: 'Matemática' },
] as const;

function mostrar(activo: string) {
	for (const card of document.querySelectorAll<HTMLElement>('[data-tarjeta]')) {
		const niveles = (card.dataset.niveles ?? '').split(' ').filter(Boolean);
		const area = card.dataset.area ?? '';
		card.hidden = activo !== 'todas' && !niveles.includes(activo) && area !== activo;
	}
}

export default function FiltroTarjetas() {
	const [activo, setActivo] = useState('todas');

	const elegir = (id: string) => {
		setActivo(id);
		mostrar(id);
	};

	return (
		<div class="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar juegos">
			{FILTROS.map((filtro) => {
				const elegido = activo === filtro.id;
				return (
					<button
						key={filtro.id}
						type="button"
						aria-pressed={elegido}
						class={
							elegido
								? 'inline-flex min-h-11 items-center rounded-control bg-azul px-3 text-sm font-semibold text-white'
								: 'inline-flex min-h-11 items-center rounded-control border border-borde bg-white px-3 text-sm text-azul hover:border-celeste'
						}
						onClick={() => elegir(filtro.id)}
					>
						{filtro.label}
					</button>
				);
			})}
		</div>
	);
}
