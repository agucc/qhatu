// Reglas de La Refresquera. Funciones puras: no tocan el DOM ni el guardado.
// Un tablero es { cap, vasos }, y cada vaso es una lista de sabores de abajo hacia arriba.

export const CAPACIDAD = 4;

export function crearTablero(vasos, cap = CAPACIDAD) {
  return { cap, vasos: vasos.map((v) => v.slice()) };
}

export function clonar(tablero) {
  return crearTablero(tablero.vasos, tablero.cap);
}

export function arriba(vaso) {
  return vaso.length ? vaso[vaso.length - 1] : null;
}

/** Cuántas capas seguidas del mismo sabor hay arriba del vaso. */
export function capasArriba(vaso) {
  if (!vaso.length) return 0;
  const sabor = arriba(vaso);
  let n = 0;
  for (let i = vaso.length - 1; i >= 0 && vaso[i] === sabor; i--) n++;
  return n;
}

export function esUniforme(vaso) {
  return vaso.length > 0 && vaso.every((s) => s === vaso[0]);
}

export function estaCompleto(vaso, cap) {
  return vaso.length === cap && esUniforme(vaso);
}

export function puedeVerter(tablero, desde, hacia) {
  if (desde === hacia) return false;
  const origen = tablero.vasos[desde];
  const destino = tablero.vasos[hacia];
  if (!origen || !destino || !origen.length) return false;
  if (destino.length >= tablero.cap) return false;
  return !destino.length || arriba(destino) === arriba(origen);
}

/** Vierte y devuelve { tablero, cantidad }. No modifica el tablero recibido. */
export function verter(tablero, desde, hacia) {
  if (!puedeVerter(tablero, desde, hacia)) return { tablero, cantidad: 0 };
  const nuevo = clonar(tablero);
  const origen = nuevo.vasos[desde];
  const destino = nuevo.vasos[hacia];
  const cantidad = Math.min(capasArriba(origen), nuevo.cap - destino.length);
  for (let i = 0; i < cantidad; i++) destino.push(origen.pop());
  return { tablero: nuevo, cantidad };
}

export function estaResuelto(tablero) {
  return tablero.vasos.every((v) => !v.length || estaCompleto(v, tablero.cap));
}

/** Un movimiento es útil si cambia algo de verdad (pasar un vaso uniforme a uno vacío no cuenta). */
export function esMovimientoUtil(tablero, desde, hacia) {
  if (!puedeVerter(tablero, desde, hacia)) return false;
  const origen = tablero.vasos[desde];
  if (estaCompleto(origen, tablero.cap)) return false;
  if (!tablero.vasos[hacia].length && esUniforme(origen)) return false;
  return true;
}

export function movimientosUtiles(tablero) {
  const lista = [];
  for (let i = 0; i < tablero.vasos.length; i++) {
    for (let j = 0; j < tablero.vasos.length; j++) {
      if (esMovimientoUtil(tablero, i, j)) lista.push([i, j]);
    }
  }
  return lista;
}

export function estaAtascado(tablero) {
  return !estaResuelto(tablero) && movimientosUtiles(tablero).length === 0;
}

// ---------- Azar con semilla: el mismo nivel siempre sale igual ----------

export function azar(semilla) {
  let a = semilla >>> 0 || 1;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function barajar(lista, rnd) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Solucionador ----------

function clave(tablero) {
  return tablero.vasos.map((v) => v.join(',')).sort().join('|');
}

/**
 * Busca una solución en profundidad. Devuelve la lista de movimientos [desde, hacia]
 * o null si no la encuentra dentro del límite de estados.
 */
export function resolver(tablero, limite = 60000) {
  const vistos = new Set();
  const camino = [];
  let revisados = 0;

  function puntaje(t, [i, j]) {
    const origen = t.vasos[i];
    const destino = t.vasos[j];
    let p = 0;
    if (destino.length && destino.length + capasArriba(origen) >= t.cap && esUniforme(destino)) p += 10;
    if (destino.length) p += 3;
    if (capasArriba(origen) === origen.length) p += 1;
    return -p;
  }

  function buscar(t) {
    if (estaResuelto(t)) return true;
    if (++revisados > limite) return false;
    const k = clave(t);
    if (vistos.has(k)) return false;
    vistos.add(k);
    const movs = movimientosUtiles(t);
    // Entre vasos vacíos, probar solo uno: son intercambiables.
    let vacioUsado = false;
    const filtrados = movs.filter(([, j]) => {
      if (t.vasos[j].length) return true;
      if (vacioUsado) return false;
      vacioUsado = true;
      return true;
    });
    filtrados.sort((a, b) => puntaje(t, a) - puntaje(t, b));
    for (const m of filtrados) {
      camino.push(m);
      if (buscar(verter(t, m[0], m[1]).tablero)) return true;
      camino.pop();
      if (revisados > limite) return false;
    }
    return false;
  }

  return buscar(tablero) ? camino.slice() : null;
}

// ---------- Niveles ----------

/** Cuántos sabores y vasos vacíos tiene cada nivel. Los cinco primeros son cortos. */
export function dificultad(nivel) {
  const primeros = [2, 3, 3, 4, 4];
  let sabores;
  if (nivel <= 5) sabores = primeros[nivel - 1];
  else if (nivel <= 10) sabores = 5;
  else if (nivel <= 20) sabores = 6;
  else if (nivel <= 40) sabores = 7;
  else sabores = 8;
  return { sabores, vacios: 2 };
}

/** Arma un tablero mezclado y con solución. `ids` son los sabores disponibles. */
export function generarTablero({ semilla, sabores, vacios = 2, ids, cap = CAPACIDAD }) {
  const rnd = azar(semilla);
  const elegidos = barajar(ids, rnd).slice(0, sabores);
  for (let intento = 0; intento < 200; intento++) {
    const capas = barajar(elegidos.flatMap((s) => Array(cap).fill(s)), rnd);
    const vasos = [];
    for (let i = 0; i < sabores; i++) vasos.push(capas.slice(i * cap, (i + 1) * cap));
    for (let i = 0; i < vacios; i++) vasos.push([]);
    const tablero = crearTablero(vasos, cap);
    if (vasos.some((v) => estaCompleto(v, cap))) continue;
    if (resolver(tablero, 40000)) return tablero;
  }
  // Muy improbable: un tablero fácil de respaldo.
  const vasos = elegidos.map((s) => Array(cap).fill(s));
  vasos[0][cap - 1] = elegidos[1];
  vasos[1][cap - 1] = elegidos[0];
  for (let i = 0; i < vacios; i++) vasos.push([]);
  return crearTablero(vasos, cap);
}

export function generarNivel(nivel, ids) {
  const { sabores, vacios } = dificultad(nivel);
  return generarTablero({ semilla: nivel * 7919 + 13, sabores, vacios, ids });
}

// ---------- Pistas ----------

/** Un buen movimiento cuando no hace falta resolver todo (modo pedidos o tableros grandes). */
export function mejorMovimiento(tablero) {
  let mejor = null;
  let mejorPuntaje = -Infinity;
  for (const [i, j] of movimientosUtiles(tablero)) {
    const origen = tablero.vasos[i];
    const destino = tablero.vasos[j];
    const run = capasArriba(origen);
    let p = 0;
    if (destino.length && esUniforme(destino) && destino.length + run >= tablero.cap) p += 20;
    if (destino.length && esUniforme(destino)) p += 8;
    if (destino.length) p += 4;
    if (run === origen.length) p += 3; // vacía el vaso de origen
    if (!destino.length) p -= 2;
    p -= (origen.length - run) * 0.1;
    if (p > mejorPuntaje) {
      mejorPuntaje = p;
      mejor = [i, j];
    }
  }
  return mejor;
}

export function pista(tablero, limite = 30000) {
  const solucion = resolver(tablero, limite);
  if (solucion && solucion.length) return solucion[0];
  return mejorMovimiento(tablero);
}
