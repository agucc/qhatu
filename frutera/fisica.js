// Física del canasto: frutas redondas que caen, chocan, ruedan y se juntan.
// Funciones puras salvo el estado del mundo que reciben; no tocan el DOM.

import { FRUTAS, ULTIMA, PUNTOS, PUNTOS_PAPAYAS } from './frutas.js';

/** Medidas del canasto en unidades del juego (la pantalla se escala a esto). */
export const CANASTO = {
  ancho: 360,
  alto: 620,
  izq: 26,
  der: 334,
  piso: 590,
  borde: 168, // si una fruta queda por encima de esta línea, el canasto se está llenando
  soltarY: 96,
};

const GRAVEDAD = 1700;
const REBOTE = 0.08;
const SUBPASOS = 4;
const ITERACIONES = 4;
const TIEMPO_GRACIA = 1.4; // segundos que una fruta recién soltada puede pasar el borde
export const TIEMPO_LLENO = 2.5; // segundos por encima del borde antes de que se acabe

export function crearMundo() {
  return { frutas: [], siguienteId: 1, puntos: 0, peligro: 0, terminado: false, mayor: 0 };
}

export function radio(nivel) {
  return FRUTAS[nivel].r;
}

/** Límite de x para que una fruta de ese nivel quepa entre las paredes. */
export function limitarX(nivel, x) {
  const r = radio(nivel);
  return Math.min(CANASTO.der - r, Math.max(CANASTO.izq + r, x));
}

export function agregarFruta(mundo, nivel, x, y, vx = 0, vy = 0) {
  const f = { id: mundo.siguienteId++, nivel, r: radio(nivel), x: limitarX(nivel, x), y, vx, vy, ang: 0, edad: 0 };
  mundo.frutas.push(f);
  mundo.mayor = Math.max(mundo.mayor, nivel);
  return f;
}

export function soltar(mundo, nivel, x) {
  return agregarFruta(mundo, nivel, x, CANASTO.soltarY);
}

export function quitarFruta(mundo, id) {
  mundo.frutas = mundo.frutas.filter((f) => f.id !== id);
}

function chocarConParedes(f) {
  if (f.x - f.r < CANASTO.izq) {
    f.x = CANASTO.izq + f.r;
    if (f.vx < 0) f.vx = -f.vx * REBOTE;
  } else if (f.x + f.r > CANASTO.der) {
    f.x = CANASTO.der - f.r;
    if (f.vx > 0) f.vx = -f.vx * REBOTE;
  }
  if (f.y + f.r > CANASTO.piso) {
    f.y = CANASTO.piso - f.r;
    if (f.vy > 0) f.vy = f.vy < 60 ? 0 : -f.vy * REBOTE;
    f.vx *= 0.985; // roce con el fondo
  }
}

/**
 * Avanza el mundo `dt` segundos. Devuelve los eventos para sonido y animación:
 * { tipo: 'union', nivel, id, x, y } o { tipo: 'papayas', x, y }.
 */
export function paso(mundo, dt) {
  const eventos = [];
  if (mundo.terminado) return eventos;
  const h = dt / SUBPASOS;
  const frutas = mundo.frutas;

  for (let s = 0; s < SUBPASOS; s++) {
    for (const f of frutas) {
      f.vy += GRAVEDAD * h;
      f.x += f.vx * h;
      f.y += f.vy * h;
      f.ang += (f.vx * h) / f.r;
    }

    const uniones = [];
    for (let it = 0; it < ITERACIONES; it++) {
      for (let i = 0; i < frutas.length; i++) {
        const a = frutas[i];
        for (let j = i + 1; j < frutas.length; j++) {
          const b = frutas[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const minimo = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= minimo * minimo) continue;
          const d = Math.sqrt(d2) || 0.01;
          if (a.nivel === b.nivel && it === 0) uniones.push([a, b]);
          const nx = dx / d;
          const ny = dy / d;
          const solape = minimo - d;
          const ma = a.r * a.r;
          const mb = b.r * b.r;
          const total = ma + mb;
          a.x -= nx * solape * (mb / total);
          a.y -= ny * solape * (mb / total);
          b.x += nx * solape * (ma / total);
          b.y += ny * solape * (ma / total);
          // Velocidad: solo si se acercan
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) {
            const jImp = (-(1 + REBOTE) * rv) / (1 / ma + 1 / mb);
            a.vx -= (jImp / ma) * nx;
            a.vy -= (jImp / ma) * ny;
            b.vx += (jImp / mb) * nx;
            b.vy += (jImp / mb) * ny;
            // Roce: frena el deslizamiento entre frutas
            const tx = -ny;
            const ty = nx;
            const vt = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty;
            const k = 0.12;
            a.vx += tx * vt * k * (mb / total);
            a.vy += ty * vt * k * (mb / total);
            b.vx -= tx * vt * k * (ma / total);
            b.vy -= ty * vt * k * (ma / total);
          }
        }
      }
      for (const f of frutas) chocarConParedes(f);
    }

    // Uniones: dos iguales que se tocan se vuelven la siguiente fruta
    const usadas = new Set();
    for (const [a, b] of uniones) {
      if (usadas.has(a.id) || usadas.has(b.id)) continue;
      usadas.add(a.id);
      usadas.add(b.id);
      const x = (a.x + b.x) / 2;
      const y = (a.y + b.y) / 2;
      mundo.frutas = mundo.frutas.filter((f) => f.id !== a.id && f.id !== b.id);
      if (a.nivel === ULTIMA) {
        mundo.puntos += PUNTOS_PAPAYAS;
        eventos.push({ tipo: 'papayas', x, y });
      } else {
        const nueva = agregarFruta(mundo, a.nivel + 1, x, y, (a.vx + b.vx) / 2, (a.vy + b.vy) / 2 - 60);
        nueva.edad = TIEMPO_GRACIA; // no cuenta como recién soltada
        mundo.puntos += PUNTOS[nueva.nivel];
        eventos.push({ tipo: 'union', nivel: nueva.nivel, id: nueva.id, x: nueva.x, y: nueva.y });
      }
    }
    if (usadas.size) {
      // La lista cambió: seguir con la nueva
      frutas.length = 0;
      frutas.push(...mundo.frutas);
      mundo.frutas = frutas;
    }
  }

  // ¿Se está llenando el canasto?
  let arriba = false;
  for (const f of mundo.frutas) {
    f.edad += dt;
    f.vx *= 0.999;
    if (f.edad > TIEMPO_GRACIA && f.y - f.r < CANASTO.borde && Math.abs(f.vy) < 400) arriba = true;
  }
  mundo.peligro = arriba ? mundo.peligro + dt : Math.max(0, mundo.peligro - dt * 2);
  if (mundo.peligro >= TIEMPO_LLENO) mundo.terminado = true;
  return eventos;
}

/** Saca las frutas que pasan el borde: la ayuda para seguir jugando. */
export function despejarBorde(mundo) {
  const antes = mundo.frutas.length;
  mundo.frutas = mundo.frutas.filter((f) => f.y - f.r >= CANASTO.borde + 30);
  mundo.peligro = 0;
  mundo.terminado = false;
  return antes - mundo.frutas.length;
}
