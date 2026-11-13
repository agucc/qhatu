// Reglas de La Refresquera. Funciones puras: no tocan el DOM ni el guardado.
// Un tablero es { cap, vasos, caps, solo, hielo }:
// - vasos: lista de vasos; cada vaso es una lista de sabores de abajo hacia arriba.
// - cap: capacidad de un vaso normal (4).
// - caps[i]: capacidad del vaso i (el vaso chico lleva 3).
// - solo[i]: si el vaso tiene tapa, el único sabor que acepta; si no, null.
// - hielo[i]: cuántas capas de abajo del vaso i están tapadas con hielo (no se ve su sabor).

export const CAPACIDAD = 4;
export const CAPACIDAD_CHICO = 3;

export function crearTablero(vasos, cap = CAPACIDAD, { caps, solo, hielo } = {}) {
  const n = vasos.length;
  return {
    cap,
    vasos: vasos.map((v) => v.slice()),
    caps: caps ? caps.slice() : Array(n).fill(cap),
    solo: solo ? solo.slice() : Array(n).fill(null),
    hielo: hielo ? hielo.slice() : Array(n).fill(0),
  };
}

export function clonar(t) {
  return crearTablero(t.vasos, t.cap, t);
}

/** Agrega un vaso vacío al final (el vaso extra). Modifica el tablero recibido. */
export function agregarVacio(t, cap = t.cap) {
  t.vasos.push([]);
  t.caps.push(cap);
  t.solo.push(null);
  t.hielo.push(0);
  return t;
}

export function capDe(t, i) {
  return t.caps?.[i] ?? t.cap;
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

/** Cuántas capas hay de cada sabor en todo el tablero. */
export function contarSabores(t) {
  const cuenta = {};
  for (const v of t.vasos) for (const s of v) cuenta[s] = (cuenta[s] || 0) + 1;
  return cuenta;
}

/** Un vaso está terminado cuando tiene todo un sabor y nada más: listo para servir. */
export function vasoTerminado(t, i) {
  return estaCompleto(t.vasos[i], t.cap);
}

/** ¿La capa k del vaso i está tapada con hielo? La de arriba siempre se ve. */
export function capaOculta(t, i, k) {
  const v = t.vasos[i];
  return k < (t.hielo?.[i] || 0) && k < v.length - 1;
}

export function puedeVerter(t, desde, hacia) {
  if (desde === hacia) return false;
  const origen = t.vasos[desde];
  const destino = t.vasos[hacia];
  if (!origen || !destino || !origen.length) return false;
  if (destino.length >= capDe(t, hacia)) return false;
  const sabor = arriba(origen);
  if (t.solo?.[hacia] && t.solo[hacia] !== sabor) return false;
  return !destino.length || arriba(destino) === sabor;
}

/**
 * Vierte y devuelve { tablero, cantidad, revelada }. No modifica el tablero recibido.
 * `revelada` es true si al vaciar el origen quedó a la vista una capa que estaba con hielo.
 */
export function verter(t, desde, hacia) {
  if (!puedeVerter(t, desde, hacia)) return { tablero: t, cantidad: 0, revelada: false };
  const nuevo = clonar(t);
  const origen = nuevo.vasos[desde];
  const destino = nuevo.vasos[hacia];
  const cantidad = Math.min(capasArriba(origen), capDe(nuevo, hacia) - destino.length);
  for (let i = 0; i < cantidad; i++) destino.push(origen.pop());
  const antes = nuevo.hielo[desde];
  // La capa que queda arriba se descongela: ya no está tapada.
  nuevo.hielo[desde] = Math.min(antes, Math.max(0, origen.length - 1));
  return { tablero: nuevo, cantidad, revelada: nuevo.hielo[desde] < antes };
}

/** Resuelto: cada vaso con refresco tiene un solo sabor y todas sus capas. */
export function estaResuelto(t) {
  const cuenta = contarSabores(t);
  return t.vasos.every((v) => !v.length || (esUniforme(v) && v.length === cuenta[v[0]]));
}

/** Un movimiento es útil si cambia algo de verdad (pasar un vaso uniforme a uno vacío no cuenta). */
export function esMovimientoUtil(t, desde, hacia) {
  if (!puedeVerter(t, desde, hacia)) return false;
  const origen = t.vasos[desde];
  if (esUniforme(origen) && origen.length === contarSabores(t)[origen[0]]) return false;
  if (!t.vasos[hacia].length && esUniforme(origen)) return false;
  return true;
}

export function movimientosUtiles(t) {
  const lista = [];
  for (let i = 0; i < t.vasos.length; i++) {
    for (let j = 0; j < t.vasos.length; j++) {
      if (esMovimientoUtil(t, i, j)) lista.push([i, j]);
    }
  }
  return lista;
}

export function estaAtascado(t) {
  return !estaResuelto(t) && movimientosUtiles(t).length === 0;
}

// ---------- Azar con semilla: el mismo nivel siempre sale igual ----------

export function azar(semilla) {
  let a = semilla >>> 0 || 1;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
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

function firma(t, i) {
  return `${capDe(t, i)}|${t.solo?.[i] || ''}`;
}

function clave(t) {
  return t.vasos.map((v, i) => `${firma(t, i)}|${v.join(',')}`).sort().join(';');
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
    if (destino.length && destino.length + capasArriba(origen) >= capDe(t, j) && esUniforme(destino)) p += 10;
    if (destino.length) p += 3;
    if (t.solo?.[j]) p += 4;
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
    // Entre vasos vacíos iguales, probar solo uno: son intercambiables.
    const vaciosUsados = new Set();
    const filtrados = movs.filter(([i, j]) => {
      if (t.vasos[j].length) return true;
      const f = `${i}>${firma(t, j)}`;
      if (vaciosUsados.has(f)) return false;
      vaciosUsados.add(f);
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

/**
 * Cuántos sabores y vasos vacíos tiene cada nivel, y qué vasos especiales trae.
 * Los cinco primeros son cortos; los especiales llegan de a poco.
 */
export function dificultad(nivel) {
  const primeros = [2, 3, 3, 4, 4];
  let sabores;
  if (nivel <= 5) sabores = primeros[nivel - 1];
  else if (nivel <= 10) sabores = 5;
  else if (nivel <= 20) sabores = 6;
  else if (nivel <= 40) sabores = 7;
  else sabores = 8;
  const especial = {
    hielo: nivel >= 9 && nivel % 3 === 0,
    tapa: nivel >= 14 && nivel % 4 === 2,
    chico: nivel >= 20 && nivel % 5 === 0,
  };
  return { sabores, vacios: 2, especial };
}

/** Arma un tablero mezclado y con solución. `ids` son los sabores disponibles. */
export function generarTablero({ semilla, sabores, vacios = 2, ids, cap = CAPACIDAD, especial = {} }) {
  const rnd = azar(semilla);
  const elegidos = barajar(ids, rnd).slice(0, sabores);
  const n = sabores + vacios;
  for (let intento = 0; intento < 200; intento++) {
    const capas = barajar(elegidos.flatMap((s) => Array(cap).fill(s)), rnd);
    const vasos = [];
    for (let i = 0; i < sabores; i++) vasos.push(capas.slice(i * cap, (i + 1) * cap));
    for (let i = 0; i < vacios; i++) vasos.push([]);
    if (vasos.some((v) => estaCompleto(v, cap))) continue;
    const caps = Array(n).fill(cap);
    const solo = Array(n).fill(null);
    const hielo = Array(n).fill(0);
    if (especial.chico) caps[n - 1] = CAPACIDAD_CHICO;
    if (especial.tapa) solo[sabores] = elegidos[Math.floor(rnd() * elegidos.length)];
    if (especial.hielo) {
      // Más o menos la mitad de los vasos llenos llevan sus dos capas de abajo con hielo.
      let puestos = 0;
      for (let i = 0; i < sabores; i++) {
        if (rnd() < 0.55 || (i === sabores - 1 && puestos < 2)) {
          hielo[i] = 2;
          puestos++;
        }
      }
    }
    const tablero = crearTablero(vasos, cap, { caps, solo, hielo });
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
  const { sabores, vacios, especial } = dificultad(nivel);
  return generarTablero({ semilla: nivel * 7919 + 13, sabores, vacios, ids, especial });
}

// ---------- Pistas ----------

/** Un buen movimiento cuando no hace falta resolver todo (modo pedidos o tableros grandes). */
export function mejorMovimiento(t) {
  let mejor = null;
  let mejorPuntaje = -Infinity;
  for (const [i, j] of movimientosUtiles(t)) {
    const origen = t.vasos[i];
    const destino = t.vasos[j];
    const run = capasArriba(origen);
    let p = 0;
    if (destino.length && esUniforme(destino) && destino.length + run >= capDe(t, j)) p += 20;
    if (destino.length && esUniforme(destino)) p += 8;
    if (destino.length) p += 4;
    if (t.solo?.[j]) p += 6;
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

export function pista(t, limite = 30000) {
  const solucion = resolver(t, limite);
  if (solucion && solucion.length) return solucion[0];
  return mejorMovimiento(t);
}
