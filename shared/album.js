// Álbum del Mercado: láminas de cada país que se ganan jugando, el sello del pasaporte
// (tres preguntas sobre lo aprendido), los caseritos con nombre y las fiestas del calendario.
// El contenido está en cultura.js; aquí solo las reglas.

import { obtener, guardar, sumarYapa, puesto } from './almacen.js';
import { pais as datosPais, texto } from './paises.js';
import { t } from './i18n.js';
import { nombreBebida, descBebida } from '../refresquera/bebidas.js';
import { recetasDe, nivelesEn } from '../refresquera/recetario.js';
import { frutasDe, nombreFruta } from '../frutera/frutas.js';
import { FRUTAS_ALBUM, COMIDA_ALBUM, TEJIDO_ALBUM, PALABRA_ALBUM, FIESTAS, CASERITOS } from './cultura.js';
import { registrar } from './temporada.js';

export const YAPA_LAMINA = 5;
export const YAPA_SELLO = 50;
export const LAMINAS_PARA_SELLAR = 6;
export const PREGUNTAS_SELLO = 3;
export const FRANJAS_TEJIDO = 10;
export const COCINAR_COMIDA = 50;

const mayuscula = (s) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

// ---------- Estado ----------

function album(estado = obtener()) {
  estado.album ??= {};
  estado.album.ganadas ??= {};
  estado.album.cuenta ??= {};
  estado.album.sellos ??= {};
  return estado.album;
}

function ganar(id, estado = obtener()) {
  const a = album(estado);
  if (a.ganadas[id]) return false;
  a.ganadas[id] = true;
  return true;
}

// ---------- Fiestas ----------

function dia(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

/** Días de la fiesta en el año de `fecha`: [inicio, fin] (fechas locales). */
export function diasFiesta(fiesta, anio) {
  if (fiesta.regla === 'thanksgiving') {
    const primero = new Date(anio, 10, 1);
    const jueves = 1 + ((4 - primero.getDay() + 7) % 7) + 21; // cuarto jueves de noviembre
    return [new Date(anio, 10, jueves - 3), new Date(anio, 10, jueves + 3)];
  }
  return [new Date(anio, fiesta.desde[0] - 1, fiesta.desde[1]), new Date(anio, fiesta.hasta[0] - 1, fiesta.hasta[1])];
}

/** La fiesta del país si es su semana; `?fiesta=bo` (en el navegador) la fuerza para probar. */
export function fiestaActiva(pais, fecha = new Date()) {
  const fiesta = FIESTAS[pais];
  if (!fiesta) return null;
  try {
    if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('fiesta') === pais) return fiesta;
  } catch {
    /* sin URL */
  }
  const [inicio, fin] = diasFiesta(fiesta, fecha.getFullYear());
  const hoy = dia(fecha);
  return hoy >= inicio && hoy <= fin ? fiesta : null;
}

export function textoFechas(fiesta, idioma = 'es', anio = new Date().getFullYear()) {
  const [inicio, fin] = diasFiesta(fiesta, anio);
  const f = (d) => d.toLocaleDateString(idioma, { day: 'numeric', month: 'short' });
  return `${f(inicio)} – ${f(fin)}`;
}

// ---------- Láminas ----------

/**
 * Las láminas de un país, en orden: palabra, bebidas, frutas, tejido, comida y fiesta.
 * Cada una: { id, tipo, ref, nombre, dato, como, ganada }.
 */
export function laminasDe(pais, estado = obtener()) {
  const p = datosPais(pais);
  const a = album(estado);
  const lista = [];
  const agregar = (id, tipo, ref, nombre, dato, como, ganada) => lista.push({ id, tipo, ref, nombre, dato, como, ganada: Boolean(ganada) });

  agregar(`${pais}:palabra`, 'palabra', pais, texto(PALABRA_ALBUM[pais].nombre), texto(PALABRA_ALBUM[pais].dato), t('laminaComoPalabra', { pais: texto(p.nombre) }), a.ganadas[`${pais}:palabra`]);

  const hechos = nivelesEn(estado.puestos?.refresquera ? estado.puestos.refresquera : {}, pais);
  for (const r of recetasDe(pais)) {
    agregar(`${pais}:bebida:${r.id}`, 'bebida', r.id, nombreBebida(r.id), descBebida(r.id), r.niveles === 1 ? t('laminaComoBebidaUno') : t('laminaComoBebida', { n: r.niveles }), hechos >= r.niveles);
  }

  const frutas = frutasDe(pais);
  for (const [id, dato] of Object.entries(FRUTAS_ALBUM[pais] || {})) {
    const fruta = frutas.find((f) => f.id === id);
    if (!fruta) continue;
    agregar(`${pais}:fruta:${id}`, 'fruta', fruta, mayuscula(nombreFruta(fruta)), texto(dato), t('laminaComoFruta', { fruta: nombreFruta(fruta) }), a.ganadas[`${pais}:fruta:${id}`]);
  }

  agregar(`${pais}:tejido`, 'tejido', pais, texto(p.telar.nombre), `${texto(p.telar.origen)} ${texto(TEJIDO_ALBUM[pais])}`, t('laminaComoTejido', { n: FRANJAS_TEJIDO }), a.ganadas[`${pais}:tejido`]);
  agregar(`${pais}:comida`, 'comida', pais, texto(p.comida.puesto), texto(COMIDA_ALBUM[pais]), t('laminaComoComida', { n: COCINAR_COMIDA, puesto: texto(p.comida.puesto) }), a.ganadas[`${pais}:comida`]);

  const fiesta = FIESTAS[pais];
  if (fiesta) {
    agregar(`${pais}:fiesta`, 'fiesta', fiesta.id, texto(fiesta.nombre), texto(fiesta.dato), t('laminaComoFiesta', { pais: texto(p.nombre), fiesta: texto(fiesta.nombre), fechas: textoFechas(fiesta) }), a.ganadas[`${pais}:fiesta`]);
  }
  return lista;
}

export function progresoAlbum(pais, estado = obtener()) {
  const l = laminasDe(pais, estado);
  return { ganadas: l.filter((x) => x.ganada).length, total: l.length };
}

/** Nombre de la lámina por id (para avisos). */
function nombreLamina(pais, id, estado) {
  return laminasDe(pais, estado).find((l) => l.id === id)?.nombre || id;
}

/** Gana una lámina: guarda, da yapa y devuelve el texto del aviso (o null si ya la tenía). */
function cobrar(pais, id, estado = obtener()) {
  if (!ganar(id, estado)) return null;
  registrar('lamina', 1, estado);
  sumarYapa(YAPA_LAMINA); // también guarda
  return t('laminaNueva', { nombre: nombreLamina(pais, id, estado), n: YAPA_LAMINA });
}

// Ganchos que llaman los puestos. Devuelven el texto del aviso si salió una lámina nueva.

export function visitarPais(pais) {
  return cobrar(pais, `${pais}:palabra`);
}

export function anotarFruta(pais, frutaId) {
  if (!FRUTAS_ALBUM[pais]?.[frutaId]) return null;
  return cobrar(pais, `${pais}:fruta:${frutaId}`);
}

function contar(clave, n) {
  const a = album();
  a.cuenta[clave] = (a.cuenta[clave] || 0) + n;
  return a.cuenta[clave];
}

export function anotarFranjas(pais, n) {
  if (contar(`franjas:${pais}`, n) < FRANJAS_TEJIDO) return null;
  return cobrar(pais, `${pais}:tejido`);
}

export function anotarCocina(pais) {
  if (contar(`cocina:${pais}`, 1) < COCINAR_COMIDA) return null;
  return cobrar(pais, `${pais}:comida`);
}

/** Jugar un puesto durante la fiesta del país gana su lámina. */
export function jugarEnFiesta(pais, fecha = new Date()) {
  if (!fiestaActiva(pais, fecha)) return null;
  return cobrar(pais, `${pais}:fiesta`);
}

// ---------- Sello del pasaporte ----------

export function sellado(pais, estado = obtener()) {
  return Boolean(album(estado).sellos[pais]);
}

export function puedeSellar(pais, estado = obtener()) {
  return !sellado(pais, estado) && progresoAlbum(pais, estado).ganadas >= LAMINAS_PARA_SELLAR;
}

function barajar(lista, rnd) {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/**
 * Tres preguntas sobre láminas ganadas: se muestra el dato y se elige de qué lámina es,
 * entre tres nombres del mismo país.
 */
export function preguntasSello(pais, rnd = Math.random, estado = obtener()) {
  const todas = laminasDe(pais, estado);
  const ganadas = barajar(todas.filter((l) => l.ganada && l.dato), rnd).slice(0, PREGUNTAS_SELLO);
  return ganadas.map((l) => {
    const otros = barajar([...new Set(todas.filter((x) => x.nombre !== l.nombre).map((x) => x.nombre))], rnd).slice(0, 2);
    const opciones = barajar([l.nombre, ...otros], rnd);
    return { dato: l.dato, opciones, correcta: opciones.indexOf(l.nombre), lamina: l.id };
  });
}

/** Revisa las respuestas; con todas bien, sella y da yapa. Devuelve { aciertos, sellado }. */
export function responderSello(pais, preguntas, respuestas, estado = obtener()) {
  const aciertos = preguntas.filter((p, i) => respuestas[i] === p.correcta).length;
  if (aciertos === preguntas.length && preguntas.length === PREGUNTAS_SELLO && !sellado(pais, estado)) {
    album(estado).sellos[pais] = true;
    sumarYapa(YAPA_SELLO);
    return { aciertos, sellado: true };
  }
  guardar();
  return { aciertos, sellado: false };
}

// ---------- Caseritos con nombre ----------

/**
 * A veces llega un caserito con nombre e historia en lugar de uno cualquiera.
 * Durante la fiesta del país, su caserito de fiesta llega más seguido.
 * Devuelve { nombre, linea, bebida?, fruta?, color?, fiesta } o null.
 */
export function caseritoConHistoria(pais, puestoId, rnd = Math.random, fecha = new Date()) {
  const fiesta = fiestaActiva(pais, fecha);
  if (fiesta?.caserito?.puesto === puestoId && rnd() < 0.5) {
    return { ...fiesta.caserito, linea: texto(fiesta.caserito.linea), fiesta: true };
  }
  const c = (CASERITOS[pais] || []).find((x) => x.puesto === puestoId);
  if (!c || rnd() >= 1 / 3) return null;
  return { ...c, linea: texto(c.linea), fiesta: false };
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Las caseras con nombre (Doña, Dona, Señora, Mrs., Mary) se dibujan como La Casera de su país. */
export function esCasera(c) {
  return /^(Doña|Dona|Señora|Mrs\.|Mary)\b/.test(c?.nombre || '');
}

/** El texto del pedido de un caserito con nombre: su nombre arriba y lo que dice. */
export function htmlCaserito(c) {
  return `<b class="pedido-nombre">${esc(c.nombre)}</b>${esc(c.linea)}`;
}

/** El caserito fijo (sin azar) de un puesto, para volver a dibujarlo tras recargar. */
export function caseritoGuardado(pais, puestoId, fiesta) {
  const c = fiesta ? FIESTAS[pais]?.caserito : (CASERITOS[pais] || []).find((x) => x.puesto === puestoId);
  return c && c.puesto === puestoId ? { ...c, linea: texto(c.linea), fiesta: Boolean(fiesta) } : null;
}

