// El recetario: doce refrescos del mercado que se desbloquean al avanzar en los niveles.
// Cada receta nueva regala yapa.

import { SABORES, dibujoSimbolo } from './sabores.js';
import { svgVaso } from './botella.js';

/** Los cuatro refrescos que no se juegan, solo se coleccionan. */
export const SOLO_RECETARIO = {
  linaza: {
    color: '#d8c27a',
    tinta: '#17131f',
    simbolo: `<g fill="{t}"><ellipse cx="8" cy="9" rx="3" ry="4.6" transform="rotate(-30 8 9)"/><ellipse cx="16" cy="9" rx="3" ry="4.6" transform="rotate(30 16 9)"/><ellipse cx="12" cy="17" rx="3" ry="4.6"/></g>`,
  },
  cebada: {
    color: '#c8893f',
    tinta: '#17131f',
    simbolo: `<path d="M12 22V5" stroke="{t}" stroke-width="1.6" stroke-linecap="round"/><g fill="{t}"><ellipse cx="9.4" cy="8.5" rx="2.2" ry="3.4" transform="rotate(-30 9.4 8.5)"/><ellipse cx="14.6" cy="8.5" rx="2.2" ry="3.4" transform="rotate(30 14.6 8.5)"/><ellipse cx="9.4" cy="13.5" rx="2.2" ry="3.4" transform="rotate(-30 9.4 13.5)"/><ellipse cx="14.6" cy="13.5" rx="2.2" ry="3.4" transform="rotate(30 14.6 13.5)"/><ellipse cx="12" cy="4.4" rx="2" ry="3"/></g>`,
  },
  copoazu: {
    color: '#f1dfae',
    tinta: '#6b3f1f',
    simbolo: `<ellipse cx="12" cy="13.5" rx="7.2" ry="8.4" fill="{t}"/><g fill="{c}"><circle cx="9.4" cy="10.5" r="1"/><circle cx="14.4" cy="11" r="1"/><circle cx="11.8" cy="14.6" r="1"/><circle cx="9" cy="17.4" r="1"/><circle cx="15" cy="17" r="1"/></g><path d="M12 5.2V2.6" stroke="{t}" stroke-width="1.6" stroke-linecap="round"/>`,
  },
  tamarindo: {
    color: '#7a4b2a',
    tinta: '#ffffff',
    simbolo: `<path d="M3.5 16.5c1.8-6.5 6.4-10 11.6-11 2.6-.5 4.6.4 5.3 1.8-1.4 4.4-6.2 8.6-12.4 10.6-2.2.7-3.9.3-4.5-1.4z" fill="{t}"/><path d="M8.5 15.5l1.6-3.4M12.5 13.6l1.6-3.4M16.4 11l1.3-2.8" stroke="{c}" stroke-width="1.2" stroke-linecap="round"/>`,
  },
};

const TODOS = { ...SABORES, ...SOLO_RECETARIO };

/** Orden del recetario y cuántos niveles hay que completar para cada receta. */
export const RECETAS = [
  { id: 'mocochinchi', niveles: 1 },
  { id: 'limonada', niveles: 2 },
  { id: 'frutilla', niveles: 3 },
  { id: 'api', niveles: 5 },
  { id: 'tumbo', niveles: 8 },
  { id: 'hierbabuena', niveles: 11 },
  { id: 'somo', niveles: 15 },
  { id: 'chicha', niveles: 20 },
  { id: 'linaza', niveles: 25 },
  { id: 'cebada', niveles: 30 },
  { id: 'copoazu', niveles: 40 },
  { id: 'tamarindo', niveles: 50 },
];

export const YAPA_RECETA = 10;

export function desbloqueadas(nivelesHechos) {
  return RECETAS.filter((r) => nivelesHechos >= r.niveles);
}

/** Recetas recién desbloqueadas (las marca como entregadas en `datos.recetas`). */
export function recetasNuevas(datos, nivelesHechos) {
  datos.recetas ??= [];
  const nuevas = desbloqueadas(nivelesHechos).filter((r) => !datos.recetas.includes(r.id));
  datos.recetas.push(...nuevas.map((r) => r.id));
  return nuevas;
}

export function colorReceta(id) {
  return TODOS[id].color;
}

/** Una botella llena del refresco, para el recetario. */
export function botellaReceta(id, forma, n) {
  const capa = { color: TODOS[id].color, simbolo: dibujoSimbolo(id, TODOS) };
  return svgVaso([capa, capa, capa, capa], { id: 900 + n, forma, terminado: TODOS[id].color, burbujas: false });
}
