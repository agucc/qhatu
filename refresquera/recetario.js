// El recetario: las bebidas de cada país se desbloquean al completar niveles en ese país.
// Cada receta nueva regala yapa.

import { TODAS, BEBIDAS, EXTRAS_RECETARIO } from './bebidas.js';
import { dibujoSimbolo } from './sabores.js';
import { svgVaso } from './botella.js';

/** Niveles que hay que completar en el país para cada receta, en orden. */
const UMBRALES = [1, 2, 3, 5, 8, 11, 15, 20];
const UMBRALES_EXTRA = [25, 30, 40, 50];

export const YAPA_RECETA = 10;

export function recetasDe(pais) {
  const jugables = (BEBIDAS[pais] || []).map(([id], k) => ({ id, niveles: UMBRALES[k] }));
  const extras = (EXTRAS_RECETARIO[pais] || []).map(([id], k) => ({ id, niveles: UMBRALES_EXTRA[k] }));
  return [...jugables, ...extras];
}

/** Niveles completados en un país (los de Bolivia incluyen los de antes de los países). */
export function nivelesEn(datos, pais) {
  datos.nivelesPais ??= {};
  if (datos.nivelesPais.bo === undefined) datos.nivelesPais.bo = Math.max(0, (datos.nivel || 1) - 1);
  return datos.nivelesPais[pais] || 0;
}

export function sumarNivel(datos, pais) {
  nivelesEn(datos, pais);
  datos.nivelesPais[pais] = (datos.nivelesPais[pais] || 0) + 1;
}

/** Recetas recién desbloqueadas en ese país (las marca como entregadas en `datos.recetas`). */
export function recetasNuevas(datos, pais) {
  datos.recetas ??= [];
  const hechos = nivelesEn(datos, pais);
  const nuevas = recetasDe(pais).filter((r) => hechos >= r.niveles && !datos.recetas.includes(r.id));
  datos.recetas.push(...nuevas.map((r) => r.id));
  return nuevas;
}

/** Una botella llena de la bebida, para el recetario. */
export function botellaReceta(id, forma, n) {
  const b = TODAS[id];
  const capa = { color: b.color, simbolo: dibujoSimbolo(id) };
  return svgVaso([capa, capa, capa, capa], { id: 900 + n, forma, terminado: b.color, burbujas: false });
}
