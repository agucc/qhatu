// Las frutas del puesto, de la más chica a la más grande.
// Dos iguales se juntan en la siguiente; dos papayas se venden juntas.

export const FRUTAS = [
  { id: 'achachairu', color: '#ff9f1c', sombra: '#c9650a', r: 14 },
  { id: 'frutilla', color: '#ef476f', sombra: '#a81d3c', r: 18 },
  { id: 'limon', color: '#b5d93a', sombra: '#6f9418', r: 23 },
  { id: 'tuna', color: '#c2367a', sombra: '#7d1a4b', r: 28 },
  { id: 'mandarina', color: '#ff8a2b', sombra: '#c4560a', r: 34 },
  { id: 'durazno', color: '#ffb07a', sombra: '#e0644a', r: 40 },
  { id: 'chirimoya', color: '#8cc152', sombra: '#4f7f24', r: 47 },
  { id: 'mango', color: '#ffc23d', sombra: '#e0602a', r: 55 },
  { id: 'pina', color: '#f2b632', sombra: '#a8700e', r: 63 },
  { id: 'papaya', color: '#ff7a45', sombra: '#3f9a4a', r: 72 },
];

export const ULTIMA = FRUTAS.length - 1;

/** Puntos por formar cada fruta. Juntar dos papayas da un premio aparte. */
export const PUNTOS = FRUTAS.map((_, i) => ((i + 1) * (i + 2)) / 2);
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

/** Dibuja la fruta `nivel` centrada en (0,0) con radio r, girada `ang`. */
export function dibujarFruta(ctx, nivel, r, ang = 0) {
  const f = FRUTAS[nivel];
  ctx.save();
  ctx.rotate(ang);

  // Lo que sobresale por detrás del cuerpo
  if (f.id === 'limon') {
    ctx.fillStyle = f.color;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(s * r * 0.95, 0, r * 0.22, r * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (f.id === 'pina') {
    ctx.fillStyle = '#3f9a4a';
    for (const [dx, alto, ancho] of [[-0.32, 0.55, 0.16], [0.32, 0.55, 0.16], [-0.15, 0.75, 0.15], [0.15, 0.75, 0.15], [0, 0.9, 0.16]]) {
      ctx.beginPath();
      ctx.moveTo(r * (dx - ancho), -r * 0.82);
      ctx.lineTo(r * dx * 1.2, -r * (0.82 + alto));
      ctx.lineTo(r * (dx + ancho), -r * 0.82);
      ctx.fill();
    }
  }

  // Cuerpo
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  if (f.id === 'papaya') {
    g.addColorStop(0, '#ffb27d');
    g.addColorStop(0.55, f.color);
    g.addColorStop(1, '#d4502a');
  } else {
    g.addColorStop(0, aclarar(f.color));
    g.addColorStop(0.6, f.color);
    g.addColorStop(1, f.sombra);
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  // Detalles de cada fruta
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();
  switch (f.id) {
    case 'achachairu':
      ctx.fillStyle = '#ffffff22';
      ctx.beginPath();
      ctx.ellipse(r * 0.1, r * 0.2, r * 0.6, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'frutilla':
      puntos(ctx, r, '#ffe08a', 9, r * 0.07, 7);
      break;
    case 'limon':
      puntos(ctx, r, '#00000014', 14, r * 0.05, 3);
      break;
    case 'tuna':
      puntos(ctx, r, '#ffd3e6', 12, r * 0.05, 11);
      break;
    case 'mandarina':
      puntos(ctx, r, '#00000018', 18, r * 0.04, 5);
      break;
    case 'durazno': {
      const rubor = ctx.createRadialGradient(r * 0.35, r * 0.25, 0, r * 0.35, r * 0.25, r * 0.8);
      rubor.addColorStop(0, '#ef476f88');
      rubor.addColorStop(1, '#ef476f00');
      ctx.fillStyle = rubor;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.strokeStyle = '#c4553a';
      ctx.lineWidth = r * 0.06;
      ctx.beginPath();
      ctx.moveTo(-r * 0.05, -r * 0.9);
      ctx.quadraticCurveTo(-r * 0.35, 0, -r * 0.05, r * 0.95);
      ctx.stroke();
      break;
    }
    case 'chirimoya':
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
    case 'mango': {
      const rubor = ctx.createRadialGradient(r * 0.4, -r * 0.3, 0, r * 0.4, -r * 0.3, r * 0.9);
      rubor.addColorStop(0, '#ef476faa');
      rubor.addColorStop(1, '#ef476f00');
      ctx.fillStyle = rubor;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      break;
    }
    case 'pina':
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
    case 'papaya': {
      const verde = ctx.createLinearGradient(0, -r, 0, r * 0.1);
      verde.addColorStop(0, '#3f9a4acc');
      verde.addColorStop(1, '#3f9a4a00');
      ctx.fillStyle = verde;
      ctx.fillRect(-r, -r, r * 2, r * 2);
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
  }
  ctx.restore();

  // Brillo y borde
  ctx.fillStyle = '#ffffff55';
  ctx.beginPath();
  ctx.ellipse(-r * 0.38, -r * 0.42, r * 0.24, r * 0.14, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#00000040';
  ctx.lineWidth = Math.max(1, r * 0.05);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // Lo que va encima: tallos y hojas
  if (f.id === 'achachairu') {
    ctx.fillStyle = '#6b3f1f';
    ctx.fillRect(-r * 0.08, -r * 1.12, r * 0.16, r * 0.28);
  } else if (f.id === 'frutilla') {
    for (const a of [-2.4, -1.9, -1.25, -0.7]) hoja(ctx, 0, -r * 0.85, r * 0.55, a);
  } else if (f.id === 'tuna') {
    ctx.fillStyle = f.sombra;
    ctx.fillRect(-r * 0.3, -r * 1.02, r * 0.6, r * 0.14);
  } else if (f.id === 'mandarina' || f.id === 'durazno' || f.id === 'mango') {
    ctx.strokeStyle = '#6b3f1f';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.88);
    ctx.lineTo(r * 0.05, -r * 1.12);
    ctx.stroke();
    hoja(ctx, r * 0.04, -r * 1.05, r * 0.6, -0.35);
  } else if (f.id === 'chirimoya') {
    ctx.fillStyle = '#6b3f1f';
    ctx.fillRect(-r * 0.05, -r * 1.1, r * 0.1, r * 0.22);
  }
  ctx.restore();
}
