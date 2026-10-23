#!/usr/bin/env node
// Descarga los mapas escolares del IGN (CC BY-SA 4.0) a public/mapas/ign/ y genera miniaturas WebP.
// Uso: node scripts/descargar-mapas.mjs [--solo slug1,slug2] [--limite N] [--forzar]
// Idempotente: si el archivo ya existe y no está vacío, no lo vuelve a bajar.
import { readFile, mkdir, stat, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';

// Los PDF físicos y satelitales del IGN pesan 50-80 MB (raster a muy alta resolución).
// Si hay Ghostscript (gs), se recomprimen a 200 dpi para impresión: ~78 MB -> ~1,3 MB sin pérdida visible en A4.
const UMBRAL_MB = 5;
const tieneGs = (() => { try { execFileSync('gs', ['--version']); return true; } catch { return false; } })();
function comprimir(pdf) {
	const tmp = pdf + '.gs.pdf';
	execFileSync('gs', ['-q', '-sDEVICE=pdfwrite', '-dPDFSETTINGS=/printer', '-dDownsampleColorImages=true', '-dColorImageResolution=200', '-dNOPAUSE', '-dBATCH', `-sOutputFile=${tmp}`, pdf]);
	return tmp;
}

const raiz = process.cwd();
const catalogo = JSON.parse(await readFile(path.join(raiz, 'src/data/mapas-ign.json'), 'utf8'));
const destino = path.join(raiz, 'public/mapas/ign');
const args = process.argv.slice(2);
const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const solo = val('--solo')?.split(',');
const limite = Number(val('--limite') ?? Infinity);
const forzar = args.includes('--forzar');

const existe = async (f) => { try { return (await stat(f)).size > 0; } catch { return false; } };

async function bajar(url, archivo) {
	if (!forzar && (await existe(archivo))) return 'ya estaba';
	for (let intento = 1; intento <= 3; intento++) {
		try {
			const r = await fetch(url, { headers: { 'User-Agent': 'aulita.com.ar (descarga de mapas IGN)' } });
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			const buf = Buffer.from(await r.arrayBuffer());
			await writeFile(archivo + '.tmp', buf);
			await rename(archivo + '.tmp', archivo); // escritura atómica
			return `bajado (${(buf.length / 1024).toFixed(0)} KB)`;
		} catch (e) {
			if (intento === 3) throw new Error(`${url}: ${e.message}`);
			await new Promise((ok) => setTimeout(ok, 1500 * intento));
		}
	}
}

await mkdir(destino, { recursive: true });
let mapas = catalogo.mapas;
if (solo) mapas = mapas.filter((m) => solo.includes(m.slug));
mapas = mapas.slice(0, limite);

const errores = [];
for (const m of mapas) {
	try {
		const jpg = path.join(destino, `${m.slug}.jpg`);
		const res = [];
		if (m.pdf) {
			const pdf = path.join(destino, `${m.slug}.pdf`);
			res.push('pdf ' + (await bajar(m.pdf, pdf)));
			const mb = (await stat(pdf)).size / 1048576;
			if (mb > UMBRAL_MB) {
				if (!tieneGs) res.push(`AVISO: ${mb.toFixed(0)} MB, instalá Ghostscript para comprimir`);
				else { await rename(comprimir(pdf), pdf); res.push(`pdf comprimido ${mb.toFixed(0)} -> ${((await stat(pdf)).size / 1048576).toFixed(1)} MB`); }
			}
		}
		res.push('jpg ' + (await bajar(m.jpg, jpg)));
		const webp = path.join(destino, `${m.slug}-thumb.webp`);
		if (forzar || !(await existe(webp))) {
			await sharp(jpg).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 78 }).toFile(webp);
			res.push('webp generado');
		} else res.push('webp ya estaba');
		console.log(`✔ ${m.slug}: ${res.join(', ')}`);
	} catch (e) {
		errores.push(m.slug);
		console.error(`✘ ${m.slug}: ${e.message}`);
	}
	await new Promise((ok) => setTimeout(ok, 300)); // no saturar al IGN
}
console.log(`\n${mapas.length - errores.length}/${mapas.length} mapas OK.`);
if (errores.length) { console.error('Fallaron:', errores.join(', ')); process.exit(1); }
