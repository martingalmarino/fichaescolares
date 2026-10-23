#!/usr/bin/env node
// Sube public/mapas/ign/ a Vercel Blob. Las páginas usan la URL pública que devuelve el primer archivo.
// Uso: node scripts/subir-mapas-blob.mjs [--solo slug1,slug2] [--forzar]
import { BlobNotFoundError, BlobServiceRateLimited, head, put } from '@vercel/blob';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

try {
	const texto = await readFile('.env.local', 'utf8');
	for (const linea of texto.split('\n')) {
		const coincidencia = linea.match(/^([A-Z0-9_]+)=(.*)$/);
		if (!coincidencia || process.env[coincidencia[1]]) continue;
		process.env[coincidencia[1]] = coincidencia[2].trim().replace(/^["']|["']$/g, '');
	}
} catch {
	// sin .env.local: se usa el entorno
}

delete process.env.VERCEL_OIDC_TOKEN;

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token || token === '[SENSITIVE]' || token.includes('SENSITIVE')) {
	console.error('BLOB_READ_WRITE_TOKEN no está usable en .env.local.');
	process.exit(1);
}

const args = process.argv.slice(2);
const valor = (clave) => {
	const indice = args.indexOf(clave);
	return indice >= 0 ? args[indice + 1] : undefined;
};
const solo = valor('--solo')?.split(',');
const forzar = args.includes('--forzar');
const carpeta = path.join(process.cwd(), 'public/mapas/ign');
const tipos = {
	'.pdf': 'application/pdf',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
};

let archivos = (await readdir(carpeta)).filter((nombre) => tipos[path.extname(nombre)]);
if (solo) {
	archivos = archivos.filter((nombre) => solo.some((slug) => nombre === `${slug}.pdf` || nombre === `${slug}.jpg` || nombre === `${slug}-thumb.webp`));
}

async function yaEsta(pathname, tamano) {
	if (forzar) return false;
	try {
		const actual = await head(pathname, { token });
		return actual.size === tamano;
	} catch (error) {
		if (error instanceof BlobNotFoundError) return false;
		throw error;
	}
}

async function subir(nombre) {
	const local = path.join(carpeta, nombre);
	const tamano = (await stat(local)).size;
	const pathname = `mapas/ign/${nombre}`;
	if (await yaEsta(pathname, tamano)) {
		console.log(`= ${pathname}`);
		return 'igual';
	}
	const extension = path.extname(nombre);
	for (let intento = 1; intento <= 4; intento++) {
		try {
			const blob = await put(pathname, await readFile(local), {
				access: 'public',
				token,
				addRandomSuffix: false,
				allowOverwrite: true,
				contentType: tipos[extension],
				cacheControlMaxAge: 2592000,
				multipart: tamano > 4 * 1048576,
			});
			console.log(`↑ ${blob.url}`);
			return 'subido';
		} catch (error) {
			if (error instanceof BlobServiceRateLimited && intento < 4) {
				await new Promise((ok) => setTimeout(ok, (error.retryAfter || intento) * 1000));
				continue;
			}
			throw error;
		}
	}
	return 'subido';
}

let subidos = 0;
let iguales = 0;
for (let i = 0; i < archivos.length; i += 4) {
	const resultados = await Promise.all(archivos.slice(i, i + 4).map((nombre) => subir(nombre)));
	for (const resultado of resultados) {
		if (resultado === 'subido') subidos += 1;
		else iguales += 1;
	}
}

console.log(`\n${subidos} subidos, ${iguales} ya estaban.`);
