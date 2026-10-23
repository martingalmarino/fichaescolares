type Parametro = string | number | boolean;

declare global {
	interface Window {
		gtag?: (...args: unknown[]) => void;
	}
}

export function consentimientoOtorgado(): boolean {
	try {
		return localStorage.getItem('fp-consent') === 'granted';
	} catch {
		return false;
	}
}

export function track(evento: string, params: Record<string, Parametro> = {}) {
	if (typeof window === 'undefined' || !consentimientoOtorgado() || typeof window.gtag !== 'function') return;
	window.gtag('event', evento, params);
}
