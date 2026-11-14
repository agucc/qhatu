// Catálogo de artículos que se compran con yapa: vestimentas y elementos culturales, personalización
// del personaje, portadas de pasaporte e impulsos de progresión. Todo lo que se compra con yapa también
// se gana jugando. Las vestimentas de un país se desbloquean al visitarlo.

import { obtener, guardar, gastarYapa } from './almacen.js';
import { paisesAbiertos } from './paises.js';
import { AVATAR_INICIAL } from './marca.js';

const N = (es, en, pt) => [es, en, pt];

/**
 * grupo: sombrero · prenda · peinado · accesorio · marco · portada · impulso
 * precio en yapa (0 = gratis), pais (se desbloquea al abrir ese país), temporada (solo premio de temporada).
 */
export const ARTICULOS = [
  // Sombreros de cada mercado
  { id: 'sombrero:ninguno', grupo: 'sombrero', pieza: 'ninguno', precio: 0, nombre: N('Sin sombrero', 'No hat', 'Sem chapéu') },
  { id: 'sombrero:gorra', grupo: 'sombrero', pieza: 'gorra', precio: 0, nombre: N('Gorra', 'Cap', 'Boné') },
  { id: 'sombrero:bombin', grupo: 'sombrero', pieza: 'bombin', precio: 150, pais: 'bo', nombre: N('Bombín paceño', 'La Paz bowler hat', 'Chapéu-coco paceño') },
  { id: 'sombrero:chullo', grupo: 'sombrero', pieza: 'chullo', precio: 150, pais: 'bo', nombre: N('Chullo andino', 'Andean chullo', 'Chullo andino') },
  { id: 'sombrero:montera', grupo: 'sombrero', pieza: 'montera', precio: 200, pais: 'pe', nombre: N('Montera cusqueña', 'Cusco montera', 'Montera cusquenha') },
  { id: 'sombrero:charro', grupo: 'sombrero', pieza: 'charro', precio: 200, pais: 'mx', nombre: N('Sombrero charro', 'Charro hat', 'Chapéu charro') },
  { id: 'sombrero:vueltiao', grupo: 'sombrero', pieza: 'vueltiao', precio: 200, pais: 'co', nombre: N('Sombrero vueltiao', 'Vueltiao hat', 'Chapéu vueltiao') },
  { id: 'sombrero:ala', grupo: 'sombrero', pieza: 'ala', precio: 150, pais: 'ar', nombre: N('Sombrero de ala', 'Gaucho hat', 'Chapéu de aba') },
  { id: 'sombrero:boina', grupo: 'sombrero', pieza: 'boina', precio: 120, pais: 'ar', nombre: N('Boina', 'Beret', 'Boina') },
  { id: 'sombrero:palha', grupo: 'sombrero', pieza: 'palha', precio: 150, pais: 'br', nombre: N('Chapéu de palha', 'Straw hat', 'Chapéu de palha') },
  { id: 'sombrero:lenco', grupo: 'sombrero', pieza: 'lenco', precio: 120, pais: 'br', nombre: N('Lenço de chita', 'Chita headscarf', 'Lenço de chita') },
  { id: 'sombrero:vaquero', grupo: 'sombrero', pieza: 'vaquero', precio: 150, pais: 'us', nombre: N('Sombrero vaquero', 'Cowboy hat', 'Chapéu de caubói') },
  { id: 'sombrero:fiesta', grupo: 'sombrero', pieza: 'fiesta', temporada: true, nombre: N('Chullo de fiesta', 'Festival chullo', 'Chullo de festa') },
  // Prendas de cada mercado
  { id: 'prenda:camisa', grupo: 'prenda', pieza: 'camisa', precio: 0, nombre: N('Camisa', 'Shirt', 'Camisa') },
  { id: 'prenda:aguayo', grupo: 'prenda', pieza: 'aguayo', precio: 200, pais: 'bo', nombre: N('Manta de aguayo', 'Aguayo shawl', 'Manta de aguayo') },
  { id: 'prenda:lliclla', grupo: 'prenda', pieza: 'lliclla', precio: 200, pais: 'pe', nombre: N('Lliclla', 'Lliclla shawl', 'Lliclla') },
  { id: 'prenda:rebozo', grupo: 'prenda', pieza: 'rebozo', precio: 200, pais: 'mx', nombre: N('Rebozo', 'Rebozo shawl', 'Rebozo') },
  { id: 'prenda:vuelos', grupo: 'prenda', pieza: 'vuelos', precio: 200, pais: 'co', nombre: N('Blusa de vuelos', 'Ruffled blouse', 'Blusa de babados') },
  { id: 'prenda:poncho', grupo: 'prenda', pieza: 'poncho', precio: 200, pais: 'ar', nombre: N('Poncho salteño', 'Salta poncho', 'Poncho salteño') },
  { id: 'prenda:avental', grupo: 'prenda', pieza: 'avental', precio: 200, pais: 'br', nombre: N('Avental de feira', 'Market apron', 'Avental de feira') },
  { id: 'prenda:cuadros', grupo: 'prenda', pieza: 'cuadros', precio: 200, pais: 'us', nombre: N('Camisa a cuadros', 'Plaid shirt', 'Camisa xadrez') },
  { id: 'prenda:dorado', grupo: 'prenda', pieza: 'dorado', temporada: true, nombre: N('Poncho dorado', 'Golden poncho', 'Poncho dourado') },
  // Personalización del personaje
  { id: 'peinado:corto', grupo: 'peinado', pieza: 'corto', precio: 0, nombre: N('Corto', 'Short', 'Curto') },
  { id: 'peinado:trenzas', grupo: 'peinado', pieza: 'trenzas', precio: 0, nombre: N('Trenzas', 'Braids', 'Tranças') },
  { id: 'peinado:mono', grupo: 'peinado', pieza: 'mono', precio: 0, nombre: N('Moño', 'Bun', 'Coque') },
  { id: 'peinado:cola', grupo: 'peinado', pieza: 'cola', precio: 0, nombre: N('Cola', 'Ponytail', 'Rabo de cavalo') },
  { id: 'peinado:rizos', grupo: 'peinado', pieza: 'rizos', precio: 0, nombre: N('Rizos', 'Curls', 'Cachos') },
  { id: 'accesorio:ninguno', grupo: 'accesorio', pieza: 'ninguno', precio: 0, nombre: N('Nada', 'None', 'Nada') },
  { id: 'accesorio:aretes', grupo: 'accesorio', pieza: 'aretes', precio: 60, nombre: N('Aretes', 'Earrings', 'Brincos') },
  { id: 'accesorio:flor', grupo: 'accesorio', pieza: 'flor', precio: 80, nombre: N('Flores en el pelo', 'Hair flowers', 'Flores no cabelo') },
  { id: 'accesorio:lentes', grupo: 'accesorio', pieza: 'lentes', precio: 100, nombre: N('Lentes', 'Glasses', 'Óculos') },
  { id: 'accesorio:bufanda', grupo: 'accesorio', pieza: 'bufanda', precio: 120, nombre: N('Bufanda', 'Scarf', 'Cachecol') },
  { id: 'accesorio:estrellas', grupo: 'accesorio', pieza: 'estrellas', temporada: true, nombre: N('Estrellas de temporada', 'Season stars', 'Estrelas da temporada') },
  { id: 'marco:simple', grupo: 'marco', pieza: 'simple', precio: 0, nombre: N('Marco simple', 'Simple frame', 'Moldura simples') },
  { id: 'marco:madera', grupo: 'marco', pieza: 'madera', precio: 100, nombre: N('Marco de madera', 'Wooden frame', 'Moldura de madeira') },
  { id: 'marco:aguayo', grupo: 'marco', pieza: 'aguayo', precio: 150, nombre: N('Marco tejido', 'Woven frame', 'Moldura tecida') },
  { id: 'marco:oro', grupo: 'marco', pieza: 'oro', temporada: true, nombre: N('Marco de oro', 'Gold frame', 'Moldura de ouro') },
  // Pasaportes especiales: portadas
  { id: 'portada:clasica', grupo: 'portada', pieza: 'clasica', precio: 0, nombre: N('Pasaporte clásico', 'Classic passport', 'Passaporte clássico') },
  { id: 'portada:andina', grupo: 'portada', pieza: 'andina', precio: 150, nombre: N('Pasaporte andino', 'Andean passport', 'Passaporte andino') },
  { id: 'portada:selva', grupo: 'portada', pieza: 'selva', precio: 150, nombre: N('Pasaporte de la selva', 'Rainforest passport', 'Passaporte da floresta') },
  { id: 'portada:carnaval', grupo: 'portada', pieza: 'carnaval', precio: 200, nombre: N('Pasaporte de carnaval', 'Carnival passport', 'Passaporte de carnaval') },
  { id: 'portada:dorada', grupo: 'portada', pieza: 'dorada', temporada: true, nombre: N('Pasaporte dorado', 'Golden passport', 'Passaporte dourado') },
  // Impulsos de progresión
  { id: 'impulso:xp2', grupo: 'impulso', pieza: 'xp2', precio: 300, nombre: N('Doble experiencia 24 h', 'Double XP 24 h', 'Experiência dobrada 24 h') },
  { id: 'impulso:pasaje', grupo: 'impulso', pieza: 'pasaje', precio: 500, nombre: N('Pasaje extra', 'Extra ticket', 'Passagem extra') },
];

/** Colores de las portadas de pasaporte (para la portada y la tienda). */
export const PORTADAS = {
  clasica: ['#1f3350', '#2f4a6e'],
  andina: ['#9a48b8', '#ef476f'],
  selva: ['#1f6b4a', '#a6d63a'],
  carnaval: ['#ff5d8f', '#ffd23f'],
  dorada: ['#b07a10', '#ffd23f'],
};

export const GRUPOS_ARTICULOS = ['sombrero', 'prenda', 'peinado', 'accesorio', 'marco', 'portada'];

export function articulo(id) {
  return ARTICULOS.find((a) => a.id === id);
}

function armario(estado = obtener()) {
  estado.armario ??= [];
  return estado.armario;
}

export function miAvatar(estado = obtener()) {
  estado.avatar = { ...AVATAR_INICIAL, ...(estado.avatar || {}) };
  return estado.avatar;
}

export function miPortada(estado = obtener()) {
  return estado.portada || 'clasica';
}

export function loTengo(id, estado = obtener()) {
  const a = articulo(id);
  if (!a) return false;
  if (a.precio === 0 && !a.temporada) return true;
  return armario(estado).includes(id);
}

/** ¿Por qué no se puede comprar? null si se puede. */
export function bloqueo(id, estado = obtener()) {
  const a = articulo(id);
  if (!a) return 'no-existe';
  if (a.temporada) return 'temporada';
  if (a.pais && !paisesAbiertos(estado).includes(a.pais)) return 'pais';
  return null;
}

/** Da un artículo (premio de temporada o compra). */
export function darArticulo(id, estado = obtener()) {
  if (!articulo(id) || armario(estado).includes(id)) return false;
  armario(estado).push(id);
  return true;
}

/** Compra con yapa. Devuelve 'ok', 'falta-yapa' o el bloqueo. */
export function comprarArticulo(id, estado = obtener()) {
  const a = articulo(id);
  const b = bloqueo(id, estado);
  if (b) return b;
  if (a.grupo !== 'impulso' && loTengo(id, estado)) return 'ok';
  if (!gastarYapa(a.precio)) return 'falta-yapa';
  if (a.grupo === 'impulso') aplicarImpulso(a.pieza, estado);
  else darArticulo(id, estado);
  guardar();
  return 'ok';
}

/** Se pone el artículo (si lo tiene). */
export function ponerse(id, estado = obtener()) {
  const a = articulo(id);
  if (!a || !loTengo(id, estado)) return false;
  if (a.grupo === 'portada') estado.portada = a.pieza;
  else miAvatar(estado)[a.grupo] = a.pieza;
  guardar();
  return true;
}

export function puesto(id, estado = obtener()) {
  const a = articulo(id);
  if (!a) return false;
  return a.grupo === 'portada' ? miPortada(estado) === a.pieza : miAvatar(estado)[a.grupo] === a.pieza;
}

// ---------- Impulsos ----------

export const HORAS_XP2 = 24;

/** Doble experiencia por `horas` (se suma si ya estaba activa) o un pasaje extra. */
export function aplicarImpulso(tipo, estado = obtener(), { horas = HORAS_XP2, ahora = Date.now() } = {}) {
  estado.impulsos ??= {};
  if (tipo === 'xp2') estado.impulsos.xp2Hasta = Math.max(estado.impulsos.xp2Hasta || 0, ahora) + horas * 3600_000;
  else if (tipo === 'pasaje') estado.pasajesExtra = (estado.pasajesExtra || 0) + 1;
}

export function xpDoble(estado = obtener(), ahora = Date.now()) {
  return (estado.impulsos?.xp2Hasta || 0) > ahora;
}
