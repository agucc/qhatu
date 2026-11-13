// Para la portada: el dibujo de la comida sin el <svg> de afuera.
import { COMIDAS } from './comidas.js';

export function svgComida(id) {
  return COMIDAS[id] || COMIDAS.saltena;
}
