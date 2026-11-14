// Nivel de cada puesto: atender caseritos da experiencia, y al subir de nivel el puesto regala yapa.

import { puesto, guardar, sumarYapa } from './almacen.js';
import { xpDoble } from './catalogo.js';
import { sumarPuntosTemporada } from './temporada.js';

/** Experiencia necesaria para pasar del nivel dado al siguiente. */
export function xpParaSubir(nivel) {
  return 5 + nivel * 5;
}

export function nivelDeXp(xp) {
  let nivel = 1;
  let resto = Math.max(0, xp);
  while (resto >= xpParaSubir(nivel)) {
    resto -= xpParaSubir(nivel);
    nivel++;
  }
  return { nivel, resto, falta: xpParaSubir(nivel) };
}

/** Yapa de regalo al llegar a un nivel. */
export function yapaPorNivel(nivel) {
  return 5 + nivel * 2;
}

export function progresoPuesto(id) {
  return nivelDeXp(puesto(id).xp || 0);
}

/** Suma experiencia al puesto. Devuelve { subio, nivel, yapa } para celebrarlo. */
export function ganarXp(id, n = 1) {
  // Doble experiencia (impulso) y puntos de la temporada: lo que se gana jugando cuenta para las dos.
  if (xpDoble()) n *= 2;
  sumarPuntosTemporada(n);
  const datos = puesto(id);
  const antes = nivelDeXp(datos.xp || 0).nivel;
  datos.xp = (datos.xp || 0) + n;
  const ahora = nivelDeXp(datos.xp).nivel;
  let yapa = 0;
  for (let k = antes + 1; k <= ahora; k++) yapa += yapaPorNivel(k);
  if (yapa) sumarYapa(yapa);
  else guardar();
  return { subio: ahora > antes, nivel: ahora, yapa };
}
