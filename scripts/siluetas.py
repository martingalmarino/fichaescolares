"""Convierte los límites de Natural Earth 1:10m (dominio público) en un SVG por jurisdicción."""

import json
import math
import sys
from pathlib import Path

import shapefile

ISO = {
	"AR-A": "salta",
	"AR-B": "buenos-aires",
	"AR-C": "caba",
	"AR-D": "san-luis",
	"AR-E": "entre-rios",
	"AR-F": "la-rioja",
	"AR-G": "santiago-del-estero",
	"AR-H": "chaco",
	"AR-J": "san-juan",
	"AR-K": "catamarca",
	"AR-L": "la-pampa",
	"AR-M": "mendoza",
	"AR-N": "misiones",
	"AR-P": "formosa",
	"AR-Q": "neuquen",
	"AR-R": "rio-negro",
	"AR-S": "santa-fe",
	"AR-T": "tucuman",
	"AR-U": "chubut",
	"AR-V": "tierra-del-fuego",
	"AR-W": "corrientes",
	"AR-X": "cordoba",
	"AR-Y": "jujuy",
	"AR-Z": "santa-cruz",
}


def distancia(punto, inicio, fin):
	if inicio == fin:
		return math.hypot(punto[0] - inicio[0], punto[1] - inicio[1])
	dx = fin[0] - inicio[0]
	dy = fin[1] - inicio[1]
	escala = ((punto[0] - inicio[0]) * dx + (punto[1] - inicio[1]) * dy) / (dx * dx + dy * dy)
	escala = max(0, min(1, escala))
	return math.hypot(punto[0] - (inicio[0] + escala * dx), punto[1] - (inicio[1] + escala * dy))


def simplificar(puntos, epsilon):
	if len(puntos) < 3:
		return puntos
	indice = 0
	mayor = 0
	for i in range(1, len(puntos) - 1):
		actual = distancia(puntos[i], puntos[0], puntos[-1])
		if actual > mayor:
			mayor = actual
			indice = i
	if mayor > epsilon:
		izquierda = simplificar(puntos[: indice + 1], epsilon)
		derecha = simplificar(puntos[indice:], epsilon)
		return izquierda[:-1] + derecha
	return [puntos[0], puntos[-1]]


def anillos(shape):
	puntos = shape.points
	cortes = list(shape.parts) + [len(puntos)]
	return [puntos[cortes[i] : cortes[i + 1]] for i in range(len(cortes) - 1)]


def svg(anillos_xy, destino):
	todos = [punto for anillo in anillos_xy for punto in anillo]
	lons = [punto[0] for punto in todos]
	lats = [punto[1] for punto in todos]
	min_lon, max_lon = min(lons), max(lons)
	min_lat, max_lat = min(lats), max(lats)
	medio = (min_lat + max_lat) / 2
	ancho_geo = max((max_lon - min_lon) * math.cos(math.radians(medio)), 1e-6)
	alto_geo = max(max_lat - min_lat, 1e-6)
	ancho = 100
	alto = max(24, min(180, 100 * alto_geo / ancho_geo))
	margen = 4
	epsilon = max(ancho_geo, alto_geo) / 160

	def proyectar(punto):
		x = margen + (punto[0] - min_lon) / (max_lon - min_lon) * (ancho - margen * 2)
		y = margen + (max_lat - punto[1]) / (max_lat - min_lat) * (alto - margen * 2)
		return x, y

	trazos = []
	for anillo in anillos_xy:
		simple = simplificar(anillo, epsilon)
		if len(simple) < 4:
			simple = anillo
		if len(simple) < 4:
			continue
		coords = [proyectar(punto) for punto in simple]
		movimiento = f"M {coords[0][0]:.2f} {coords[0][1]:.2f}"
		lineas = " ".join(f"L {x:.2f} {y:.2f}" for x, y in coords[1:])
		trazos.append(f"{movimiento} {lineas} Z")
	cuerpo = " ".join(trazos)
	destino.write_text(
		"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ancho:.0f} {alto:.0f}" fill="none" stroke="#1d3557" stroke-width="1.4" stroke-linejoin="round">'
		f'<path d="{cuerpo}"/></svg>\n',
		encoding="utf-8",
	)
	return f"0 0 {ancho:.0f} {alto:.0f}", (round(min_lat, 2), round(max_lat, 2))


def main():
	origen = Path(sys.argv[1])
	salida = Path(sys.argv[2])
	indice = Path(sys.argv[3])
	salida.mkdir(parents=True, exist_ok=True)
	lector = shapefile.Reader(str(origen))
	vistas = {}
	for registro in lector.shapeRecords():
		datos = registro.record.as_dict()
		if datos.get("adm0_a3") != "ARG":
			continue
		slug = ISO.get(datos.get("iso_3166_2"))
		if not slug:
			raise SystemExit(f"Sin slug para {datos.get('iso_3166_2')} {datos.get('name')}")
		vista, latitudes = svg(anillos(registro.shape), salida / f"{slug}.svg")
		vistas[slug] = vista
		print(slug, vista, "lat", latitudes)
	if len(vistas) != 24:
		raise SystemExit(f"Se esperaban 24 siluetas y hay {len(vistas)}")
	indice.write_text(json.dumps(dict(sorted(vistas.items())), indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
	main()
