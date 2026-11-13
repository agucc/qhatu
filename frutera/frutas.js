// Las frutas de cada país, de la más chica a la más grande.
// Dos iguales se juntan en la siguiente; las dos más grandes se venden juntas.
// Nombres en [español, inglés, portugués], en minúscula porque van dentro de frases.

import { texto } from '../shared/paises.js';

/** Radio de cada escalón: igual en todos los países, así la física no cambia. */
export const RADIOS = [14, 18, 23, 28, 34, 40, 47, 55, 63, 72];

// ---------- Estilos que se repiten ----------
const frutilla = { color: '#ef476f', sombra: '#a81d3c', tex: 'puntos', texColor: '#ffe08a', cantidad: 9, arriba: 'hojitas' };
const limonVerde = { color: '#b5d93a', sombra: '#6f9418', tex: 'poros', nudos: true };
const tuna = { color: '#c2367a', sombra: '#7d1a4b', tex: 'puntos', texColor: '#ffd3e6', cantidad: 12, arriba: 'caliz' };
const durazno = { color: '#ffb07a', sombra: '#e0644a', rubor: '#ef476f', surco: true, arriba: 'tallohoja' };
const chirimoya = { color: '#8cc152', sombra: '#4f7f24', tex: 'escamas', arriba: 'tallo' };
const mango = { color: '#ffc23d', sombra: '#e0602a', rubor: '#ef476f', arriba: 'tallohoja' };
const pina = { color: '#f2b632', sombra: '#a8700e', tex: 'cruz', arriba: 'corona' };
const papaya = { color: '#ff7a45', sombra: '#d4502a', verdeArriba: true, tex: 'lineas' };
const sandia = { color: '#3d8b3d', sombra: '#1f5a1f', tex: 'rayas', texColor: '#1d4d1d', arriba: 'tallo' };
const aguaymanto = { color: '#ffa62b', sombra: '#c76d0a', arriba: 'caliz', brillo: true };
const granadilla = { color: '#f4a300', sombra: '#b46d00', tex: 'puntos', texColor: '#fff4cc', cantidad: 14, arriba: 'tallo' };
const guayaba = { color: '#d4df6a', sombra: '#8c9a2a', rubor: '#f28b82', tex: 'puntos', texColor: '#00000018', cantidad: 10, arriba: 'caliz' };
const palta = { color: '#3f6b2a', sombra: '#22401a', tex: 'poros', texColor: '#00000030', arriba: 'tallo' };
const maracuya = { color: '#f5d000', sombra: '#b39500', tex: 'puntos', texColor: '#ffffff55', cantidad: 14, arriba: 'tallo' };
const arandano = { color: '#4361ee', sombra: '#22318a', arriba: 'caliz' };
const ciruela = { color: '#6a1b4d', sombra: '#3a0d29', surco: true, brillo: true, arriba: 'tallo' };
const manzana = { color: '#d62828', sombra: '#8a1414', brillo: true, arriba: 'tallohoja' };
const pomelo = { color: '#ffc971', sombra: '#e08a3c', rubor: '#ff8a7a', tex: 'poros' };
const calabaza = { color: '#f08a1c', sombra: '#a85514', tex: 'gajos', arriba: 'tallogrueso' };

/** [id, nombre, estilo] de la más chica a la más grande. */
export const FRUTAS_PAIS = {
  bo: [
    ['achachairu', ['achachairú', 'achachairú', 'achachairú'], { color: '#ff9f1c', sombra: '#c9650a', arriba: 'tallo' }],
    ['frutilla', ['frutilla', 'strawberry', 'morango'], frutilla],
    ['limon', ['limón', 'lime', 'limão'], limonVerde],
    ['tuna', ['tuna', 'prickly pear', 'figo-da-índia'], tuna],
    ['mandarina', ['mandarina', 'tangerine', 'tangerina'], { color: '#ff8a2b', sombra: '#c4560a', tex: 'poros', arriba: 'tallohoja' }],
    ['durazno', ['durazno', 'peach', 'pêssego'], durazno],
    ['chirimoya', ['chirimoya', 'cherimoya', 'cherimoia'], chirimoya],
    ['mango', ['mango', 'mango', 'manga'], mango],
    ['pina', ['piña', 'pineapple', 'abacaxi'], pina],
    ['papaya', ['papaya', 'papaya', 'mamão'], papaya],
  ],
  pe: [
    ['aguaymanto', ['aguaymanto', 'goldenberry', 'fisális'], aguaymanto],
    ['fresa', ['fresa', 'strawberry', 'morango'], frutilla],
    ['limon', ['limón', 'lime', 'limão'], { ...limonVerde, color: '#9acd32', sombra: '#5f8a12' }],
    ['granadilla', ['granadilla', 'sweet granadilla', 'granadilla'], granadilla],
    ['tuna', ['tuna', 'prickly pear', 'figo-da-índia'], { ...tuna, color: '#a3c13b', sombra: '#62801a', texColor: '#f0f5c8' }],
    ['lucuma', ['lúcuma', 'lucuma', 'lúcuma'], { color: '#9a9a3b', sombra: '#5f6a22', rubor: '#d98a2b', arriba: 'tallo' }],
    ['palta', ['palta', 'avocado', 'abacate'], palta],
    ['chirimoya', ['chirimoya', 'cherimoya', 'cherimoia'], chirimoya],
    ['mango', ['mango', 'mango', 'manga'], mango],
    ['zapallo', ['zapallo', 'squash', 'abóbora'], calabaza],
  ],
  mx: [
    ['capulin', ['capulín', 'capulin cherry', 'capulim'], { color: '#5a0f1e', sombra: '#2a050c', brillo: true, arriba: 'tallo' }],
    ['fresa', ['fresa', 'strawberry', 'morango'], frutilla],
    ['limon', ['limón', 'lime', 'limão'], { ...limonVerde, color: '#6fbf3a', sombra: '#3d7a17' }],
    ['tuna', ['tuna', 'prickly pear', 'figo-da-índia'], { ...tuna, color: '#c2185b' }],
    ['guayaba', ['guayaba', 'guava', 'goiaba'], guayaba],
    ['mamey', ['mamey', 'mamey', 'mamey'], { color: '#9c5a32', sombra: '#5e3216', tex: 'poros', texColor: '#ffffff22', arriba: 'tallo' }],
    ['mango', ['mango', 'mango', 'manga'], { color: '#ffcb3d', sombra: '#d68a12', arriba: 'tallohoja' }],
    ['aguacate', ['aguacate', 'avocado', 'abacate'], palta],
    ['pina', ['piña', 'pineapple', 'abacaxi'], pina],
    ['sandia', ['sandía', 'watermelon', 'melancia'], sandia],
  ],
  co: [
    ['uchuva', ['uchuva', 'goldenberry', 'fisális'], aguaymanto],
    ['fresa', ['fresa', 'strawberry', 'morango'], frutilla],
    ['lulo', ['lulo', 'lulo', 'lulo'], { color: '#ff9f1c', sombra: '#c76a00', tex: 'puntos', texColor: '#ffffff33', cantidad: 8, arriba: 'caliz' }],
    ['granadilla', ['granadilla', 'sweet granadilla', 'granadilla'], granadilla],
    ['guayaba', ['guayaba', 'guava', 'goiaba'], guayaba],
    ['maracuya', ['maracuyá', 'passion fruit', 'maracujá'], maracuya],
    ['mango', ['mango', 'mango', 'manga'], mango],
    ['guanabana', ['guanábana', 'soursop', 'graviola'], { color: '#4f8a2b', sombra: '#2c5a14', tex: 'espinas', texColor: '#1f3d0d', arriba: 'tallo' }],
    ['pina', ['piña', 'pineapple', 'abacaxi'], pina],
    ['papaya', ['papaya', 'papaya', 'mamão'], papaya],
  ],
  ar: [
    ['arandano', ['arándano', 'blueberry', 'mirtilo'], arandano],
    ['frutilla', ['frutilla', 'strawberry', 'morango'], frutilla],
    ['uva', ['uva', 'grape', 'uva'], { color: '#7b2cbf', sombra: '#4a1677', brillo: true, arriba: 'tallo' }],
    ['ciruela', ['ciruela', 'plum', 'ameixa'], ciruela],
    ['durazno', ['durazno', 'peach', 'pêssego'], durazno],
    ['pera', ['pera', 'pear', 'pera'], { color: '#c8d64a', sombra: '#7f8f1e', rubor: '#e9a23b', tex: 'puntos', texColor: '#00000018', cantidad: 10, arriba: 'tallohoja' }],
    ['manzana', ['manzana', 'apple', 'maçã'], manzana],
    ['pomelo', ['pomelo', 'grapefruit', 'toranja'], pomelo],
    ['melon', ['melón', 'melon', 'melão'], { color: '#e9c46a', sombra: '#b08a2a', tex: 'red', texColor: '#fff4d0' }],
    ['sandia', ['sandía', 'watermelon', 'melancia'], sandia],
  ],
  br: [
    ['jabuticaba', ['jabuticaba', 'jaboticaba', 'jabuticaba'], { color: '#3a1238', sombra: '#12040f', brillo: true }],
    ['acerola', ['acerola', 'acerola', 'acerola'], { color: '#e63946', sombra: '#9a1a24', brillo: true, arriba: 'tallo' }],
    ['caju', ['cajú', 'cashew apple', 'caju'], { color: '#ff6b35', sombra: '#c23a12', rubor: '#ffd166', arriba: 'nuez' }],
    ['maracuja', ['maracuyá', 'passion fruit', 'maracujá'], maracuya],
    ['goiaba', ['guayaba', 'guava', 'goiaba'], guayaba],
    ['manga', ['mango', 'mango', 'manga'], mango],
    ['cupuacu', ['copoazú', 'cupuaçu', 'cupuaçu'], { color: '#7b4b2a', sombra: '#4a2a14', tex: 'poros', texColor: '#ffffff22', arriba: 'tallo' }],
    ['abacaxi', ['piña', 'pineapple', 'abacaxi'], pina],
    ['mamao', ['papaya', 'papaya', 'mamão'], papaya],
    ['melancia', ['sandía', 'watermelon', 'melancia'], sandia],
  ],
  us: [
    ['blueberry', ['arándano', 'blueberry', 'mirtilo'], arandano],
    ['cherry', ['cereza', 'cherry', 'cereja'], { color: '#b5172b', sombra: '#6e0a18', brillo: true, arriba: 'tallo' }],
    ['strawberry', ['fresa', 'strawberry', 'morango'], frutilla],
    ['plum', ['ciruela', 'plum', 'ameixa'], ciruela],
    ['peach', ['durazno', 'peach', 'pêssego'], durazno],
    ['apple', ['manzana', 'apple', 'maçã'], manzana],
    ['orange', ['naranja', 'orange', 'laranja'], { color: '#ff8c1a', sombra: '#c45a00', tex: 'poros', arriba: 'tallohoja' }],
    ['grapefruit', ['toronja', 'grapefruit', 'toranja'], pomelo],
    ['cantaloupe', ['melón', 'cantaloupe', 'melão-cantalupo'], { color: '#d9b25f', sombra: '#9a7a2a', tex: 'red', texColor: '#f5e6c0' }],
    ['pumpkin', ['calabaza', 'pumpkin', 'abóbora'], calabaza],
  ],
};

export function frutasDe(pais) {
  const lista = FRUTAS_PAIS[pais] || FRUTAS_PAIS.bo;
  return lista.map(([id, nombre, estilo], k) => ({ id, nombre, r: RADIOS[k], ...estilo }));
}

export function nombreFruta(fruta) {
  return texto(fruta.nombre);
}

/** Las de Bolivia: las usa la física y sirven por defecto. */
export const FRUTAS = frutasDe('bo');

export const ULTIMA = RADIOS.length - 1;

/** Puntos por formar cada fruta. Juntar las dos más grandes da un premio aparte. */
export const PUNTOS = RADIOS.map((_, i) => ((i + 1) * (i + 2)) / 2);
export const PUNTOS_PAPAYAS = 100;

/** Las que pueden caer: solo las cinco más chicas, más seguido las pequeñas. */
export const PESOS_CAIDA = [5, 4, 3, 2, 1];

export function frutaAlAzar(rnd) {
  const total = PESOS_CAIDA.reduce((a, b) => a + b, 0);
  let x = rnd() * total;
  for (let i = 0; i < PESOS_CAIDA.length; i++) {
    x -= PESOS_CAIDA[i];
    if (x < 0) return i;
  }
  return 0;
}

// ---------- Dibujo (canvas) ----------

function aclarar(hex, k = 0.45) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function hoja(ctx, x, y, largo, angulo, color = '#3f9a4a') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angulo);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(largo * 0.5, -largo * 0.45, largo, 0);
  ctx.quadraticCurveTo(largo * 0.5, largo * 0.45, 0, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function puntos(ctx, r, color, cantidad, tam, semilla = 1) {
  ctx.fillStyle = color;
  let a = semilla;
  for (let i = 0; i < cantidad; i++) {
    a = (a * 9301 + 49297) % 233280;
    const ang = (a / 233280) * Math.PI * 2;
    a = (a * 9301 + 49297) % 233280;
    const d = Math.sqrt(a / 233280) * r * 0.78;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * d, Math.sin(ang) * d, tam, 0, Math.PI * 2);
    ctx.fill();
  }
}

function tallo(ctx, r, grosor = 0.08, alto = 0.28) {
  ctx.strokeStyle = '#6b3f1f';
  ctx.lineWidth = r * grosor;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.88);
  ctx.lineTo(r * 0.05, -r * (0.88 + alto));
  ctx.stroke();
}

/** Dibuja la fruta centrada en (0,0) con radio r, girada `ang`. Acepta la fruta o su escalón (Bolivia). */
export function dibujarFruta(ctx, fruta, r, ang = 0) {
  const f = typeof fruta === 'number' ? FRUTAS[fruta] : fruta;
  ctx.save();
  ctx.rotate(ang);

  // Lo que sobresale por detrás del cuerpo
  if (f.nudos) {
    ctx.fillStyle = f.color;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(s * r * 0.95, 0, r * 0.22, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (f.arriba === 'corona') {
    ctx.fillStyle = '#3f9a4a';
    for (const [dx, alto, ancho] of [[-0.32, 0.55, 0.16], [0.32, 0.55, 0.16], [-0.15, 0.75, 0.15], [0.15, 0.75, 0.15], [0, 0.9, 0.16]]) {
      ctx.beginPath();
      ctx.moveTo(r * (dx - ancho), -r * 0.82);
      ctx.lineTo(r * dx * 1.2, -r * (0.82 + alto));
      ctx.lineTo(r * (dx + ancho), -r * 0.82);
      ctx.fill();
    }
  }
  if (f.arriba === 'nuez') {
    // La castaña del cajú, encima de la fruta
    ctx.fillStyle = '#8a6a4a';
    ctx.beginPath();
    ctx.ellipse(0, -r * 1.05, r * 0.42, r * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a88664';
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 1.1, r * 0.2, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cuerpo
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, aclarar(f.color));
  g.addColorStop(0.6, f.color);
  g.addColorStop(1, f.sombra);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  // Detalles dentro del cuerpo
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();
  if (f.verdeArriba) {
    const verde = ctx.createLinearGradient(0, -r, 0, r * 0.1);
    verde.addColorStop(0, '#3f9a4acc');
    verde.addColorStop(1, '#3f9a4a00');
    ctx.fillStyle = verde;
    ctx.fillRect(-r, -r, r * 2, r * 2);
  }
  if (f.rubor) {
    const rubor = ctx.createRadialGradient(r * 0.38, r * 0.1, 0, r * 0.38, r * 0.1, r * 0.85);
    rubor.addColorStop(0, `${f.rubor}aa`);
    rubor.addColorStop(1, `${f.rubor}00`);
    ctx.fillStyle = rubor;
    ctx.fillRect(-r, -r, r * 2, r * 2);
  }
  switch (f.tex) {
    case 'puntos':
      puntos(ctx, r, f.texColor || '#ffffff55', f.cantidad || 10, r * 0.07, 7);
      break;
    case 'poros':
      puntos(ctx, r, f.texColor || '#00000016', 16, r * 0.045, 5);
      break;
    case 'espinas':
      ctx.strokeStyle = f.texColor || '#00000055';
      ctx.lineWidth = r * 0.05;
      for (let k = 0; k < 16; k++) {
        const a = k * 2.4;
        const d = r * (0.25 + ((k * 37) % 10) / 16);
        const x = Math.cos(a) * d;
        const y = Math.sin(a) * d;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + r * 0.06, y - r * 0.1);
        ctx.stroke();
      }
      break;
    case 'escamas':
      ctx.strokeStyle = '#3f6b1c88';
      ctx.lineWidth = r * 0.05;
      for (let fila = -2; fila <= 2; fila++) {
        for (let col = -3; col <= 3; col++) {
          const x = col * r * 0.32 + (fila % 2 ? r * 0.16 : 0);
          const y = fila * r * 0.34;
          ctx.beginPath();
          ctx.arc(x, y, r * 0.17, 0.15 * Math.PI, 0.85 * Math.PI);
          ctx.stroke();
        }
      }
      break;
    case 'cruz':
      ctx.strokeStyle = '#8a5a0a99';
      ctx.lineWidth = r * 0.045;
      for (let k = -4; k <= 4; k++) {
        ctx.beginPath();
        ctx.moveTo(-r + k * r * 0.4, -r);
        ctx.lineTo(r + k * r * 0.4, r);
        ctx.moveTo(r - k * r * 0.4, -r);
        ctx.lineTo(-r - k * r * 0.4, r);
        ctx.stroke();
      }
      break;
    case 'rayas':
      ctx.strokeStyle = f.texColor || '#00000044';
      ctx.lineWidth = r * 0.11;
      for (const k of [-0.7, -0.35, 0, 0.35, 0.7]) {
        ctx.beginPath();
        ctx.moveTo(r * k, -r);
        ctx.bezierCurveTo(r * k * 1.5 + r * 0.08, -r * 0.4, r * k * 1.5 - r * 0.08, r * 0.4, r * k, r);
        ctx.stroke();
      }
      break;
    case 'gajos':
      ctx.strokeStyle = '#00000030';
      ctx.lineWidth = r * 0.05;
      for (const k of [-0.62, -0.25, 0.25, 0.62]) {
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(r * k * 1.7, 0, 0, r);
        ctx.stroke();
      }
      break;
    case 'red':
      ctx.strokeStyle = f.texColor || '#ffffff66';
      ctx.lineWidth = r * 0.03;
      for (let k = -5; k <= 5; k++) {
        ctx.beginPath();
        ctx.moveTo(-r + k * r * 0.3, -r);
        ctx.lineTo(r + k * r * 0.3, r * 0.6);
        ctx.moveTo(r - k * r * 0.3, -r);
        ctx.lineTo(-r - k * r * 0.3, r * 0.6);
        ctx.stroke();
      }
      break;
    case 'lineas':
      ctx.strokeStyle = '#00000018';
      ctx.lineWidth = r * 0.04;
      for (const k of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(r * k, -r);
        ctx.quadraticCurveTo(r * k * 1.6, 0, r * k, r);
        ctx.stroke();
      }
      break;
  }
  if (f.surco) {
    ctx.strokeStyle = '#00000033';
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(-r * 0.05, -r * 0.9);
    ctx.quadraticCurveTo(-r * 0.35, 0, -r * 0.05, r * 0.95);
    ctx.stroke();
  }
  ctx.restore();

  // Brillo y borde
  ctx.fillStyle = f.brillo ? '#ffffff88' : '#ffffff55';
  ctx.beginPath();
  ctx.ellipse(-r * 0.38, -r * 0.42, r * (f.brillo ? 0.28 : 0.24), r * 0.14, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#00000040';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // Lo que va encima: tallos, hojas y cáliz
  switch (f.arriba) {
    case 'tallo':
      tallo(ctx, r);
      break;
    case 'tallogrueso':
      ctx.fillStyle = '#4f7a2a';
      ctx.beginPath();
      ctx.roundRect(-r * 0.09, -r * 1.16, r * 0.18, r * 0.34, r * 0.05);
      ctx.fill();
      break;
    case 'tallohoja':
      tallo(ctx, r);
      hoja(ctx, r * 0.04, -r * 1.05, r * 0.6, -0.35);
      break;
    case 'hojitas':
      for (const a of [-2.4, -1.9, -1.25, -0.7]) hoja(ctx, 0, -r * 0.85, r * 0.55, a);
      break;
    case 'caliz':
      ctx.fillStyle = '#4f7a2a';
      for (const a of [-2.3, -1.57, -0.84]) {
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.9);
        ctx.lineTo(Math.cos(a - 0.25) * r * 0.42, -r * 0.9 + Math.sin(a - 0.25) * r * 0.2);
        ctx.lineTo(Math.cos(a) * r * 0.48, -r * 0.9 + Math.sin(a) * r * 0.3);
        ctx.closePath();
        ctx.fill();
      }
      break;
  }
  ctx.restore();
}
