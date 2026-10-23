import { useEffect, useState } from 'preact/hooks';

interface Props {
	gaId: string;
}

function cargarAnalytics(gaId: string) {
	if (!gaId || document.getElementById('ga4')) return;
	const script = document.createElement('script');
	script.id = 'ga4';
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
	document.head.appendChild(script);
	window.dataLayer = window.dataLayer ?? [];
	window.gtag = function gtag(...args: unknown[]) {
		window.dataLayer?.push(args);
	};
	window.gtag('js', new Date());
	window.gtag('config', gaId, { anonymize_ip: true });
}

declare global {
	interface Window {
		dataLayer?: unknown[];
	}
}

export default function Consentimiento({ gaId }: Props) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const valor = localStorage.getItem('fp-consent');
		if (valor === 'granted') cargarAnalytics(gaId);
		else if (!valor) setVisible(true);
	}, [gaId]);

	function elegir(valor: 'granted' | 'denied') {
		localStorage.setItem('fp-consent', valor);
		setVisible(false);
		if (valor === 'granted') cargarAnalytics(gaId);
	}

	if (!visible) return null;

	return (
		<div class="no-print fixed inset-x-0 bottom-0 z-40 border-t border-borde bg-white p-4 shadow-card">
			<div class="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="text-sm leading-relaxed text-texto">
					Este sitio es para docentes y familias. Si aceptás, podemos medir visitas con Google Analytics. Los anuncios, cuando estén activos, también usan cookies. Podés leer la{' '}
					<a class="text-celeste underline" href="/privacidad/">
						privacidad
					</a>
					.
				</p>
				<div class="flex shrink-0 gap-2">
					<button type="button" class="rounded-control border border-borde px-3 py-2 text-sm" onClick={() => elegir('denied')}>
						Rechazar
					</button>
					<button type="button" class="rounded-control bg-azul px-3 py-2 text-sm font-semibold text-white" onClick={() => elegir('granted')}>
						Aceptar
					</button>
				</div>
			</div>
		</div>
	);
}
