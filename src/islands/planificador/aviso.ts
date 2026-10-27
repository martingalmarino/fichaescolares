/** Actualiza el aviso amarillo que ya vino en el HTML, sin volver a pintarlo al montar. */
export function sincronizarAviso(slug: string, nombre: string, sujeto: string, visible: boolean) {
	const nodo = document.getElementById('aviso-provisorio');
	if (!(nodo instanceof HTMLElement)) return;
	if (!visible) {
		nodo.hidden = true;
		return;
	}
	nodo.hidden = false;
	if (nodo.dataset.slug === slug) return;
	nodo.dataset.slug = slug;
	const sujetoNodo = nodo.querySelector('[data-aviso-sujeto]');
	if (sujetoNodo) sujetoNodo.textContent = sujeto;
	const enlace = nodo.querySelector('a');
	if (enlace instanceof HTMLAnchorElement) {
		enlace.href = `/calendario-escolar-2027/${slug}/`;
		enlace.textContent = `calendario escolar 2027 de ${nombre}`;
	}
}
