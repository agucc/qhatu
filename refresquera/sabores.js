// Los sabores del tablero. Salen de las bebidas de cada país (bebidas.js);
// aquí quedan los de Bolivia como sabores por defecto y el dibujo de cada símbolo.

import { TODAS, saboresDe } from './bebidas.js';

const bolivia = saboresDe('bo');
export const SABORES = bolivia.SABORES;
export const IDS_SABORES = bolivia.IDS_SABORES;

/** El dibujo del símbolo (para meterlo dentro de otro SVG de 24 × 24). */
export function dibujoSimbolo(id, sabores = TODAS) {
  const s = sabores[id] || TODAS[id];
  return `<g opacity=".85">${s.simbolo.replaceAll('{t}', s.tinta).replaceAll('{c}', s.color)}</g>`;
}

export function svgSimbolo(id) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${dibujoSimbolo(id)}</svg>`;
}
