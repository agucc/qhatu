// Sonidos sintetizados con Web Audio: no hay archivos que descargar.

import { obtener, guardar } from './almacen.js';

let ctx = null;
let pausado = false;

function contexto() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// El navegador solo deja sonar después de que el jugador toca la pantalla.
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => contexto(), { once: true });
}

export function activo() {
  return obtener().sonido && !pausado;
}

export function alternar() {
  const e = obtener();
  e.sonido = !e.sonido;
  guardar();
  return e.sonido;
}

/** Silencio temporal, por ejemplo mientras se ve un anuncio. */
export function pausar(si) {
  pausado = si;
}

function tono({ f, f2 = f, dur = 0.12, tipo = 'sine', vol = 0.18, retraso = 0 }) {
  if (!activo()) return;
  const c = contexto();
  if (!c) return;
  const t0 = c.currentTime + retraso;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(f, t0);
  osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sonar = {
  elegir: () => tono({ f: 520, f2: 640, dur: 0.06, vol: 0.1 }),
  soltar: () => tono({ f: 420, f2: 360, dur: 0.06, vol: 0.08 }),
  verter: (capas = 1) => {
    for (let i = 0; i < capas; i++) tono({ f: 300 + i * 70, f2: 480 + i * 70, dur: 0.1, tipo: 'triangle', vol: 0.14, retraso: i * 0.06 });
  },
  no: () => tono({ f: 200, f2: 150, dur: 0.12, tipo: 'square', vol: 0.05 }),
  listo: () => tono({ f: 660, f2: 880, dur: 0.12, tipo: 'triangle', vol: 0.12 }),
  servido: () => [523, 659, 784, 1046].forEach((f, i) => tono({ f, dur: 0.14, tipo: 'triangle', vol: 0.14, retraso: i * 0.08 })),
  yapa: () => [880, 1320].forEach((f, i) => tono({ f, dur: 0.08, vol: 0.12, retraso: i * 0.07 })),
  llega: () => tono({ f: 700, f2: 760, dur: 0.08, vol: 0.06 }),
  fin: () => [523, 440, 349].forEach((f, i) => tono({ f, dur: 0.2, tipo: 'triangle', vol: 0.12, retraso: i * 0.14 })),
};
