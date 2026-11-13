// Dibujo del tejido de cada país para su puesto en la portada. Cada uno tiene su forma y sus motivos:
// el aguayo boliviano, la manta cusqueña, el sarape de Saltillo, la mochila wayuu, el poncho salteño,
// la chita brasileña y el quilt estadounidense.

const OSCURO = '#1d1720';

function rombo(x, y, r, color) {
  return `<path d="M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z" fill="${color}"/>`;
}

/** Aguayo: franjas anchas de color, listas finas y rombos (k'isa) en la franja del centro. */
function aguayo(c) {
  const bandas = [
    [8, 9, c[0]], [17, 3, c[1]], [20, 3, c[4]], [23, 3, c[1]],
    [26, 28, c[3]],
    [54, 3, c[1]], [57, 3, c[4]], [60, 3, c[1]], [63, 9, c[0]],
  ];
  let s = bandas.map(([y, h, col]) => `<rect x="18" y="${y}" width="84" height="${h}" fill="${col}"/>`).join('');
  for (let x = 28; x <= 92; x += 16) s += rombo(x, 40, 10, c[1]) + rombo(x, 40, 6, c[2]) + rombo(x, 40, 2.5, c[4]);
  return `<g>${s}</g><rect x="18" y="8" width="84" height="64" rx="2" fill="none" stroke="#00000033"/>`;
}

/** Manta cusqueña (lliclla): borde de color, filas de ñawi (ojos) y pompones en las esquinas. */
function manta(c) {
  let s = `<rect x="20" y="8" width="80" height="64" rx="2" fill="${c[0]}"/>`;
  s += `<rect x="26" y="14" width="68" height="52" fill="${c[3]}"/><rect x="26" y="36" width="68" height="8" fill="${c[1]}"/>`;
  for (const y of [22, 58]) {
    for (let x = 32; x <= 88; x += 8) s += `<circle cx="${x}" cy="${y}" r="3" fill="#fff8e7"/><circle cx="${x}" cy="${y}" r="1.4" fill="${OSCURO}"/>`;
  }
  for (let x = 34; x <= 86; x += 13) s += rombo(x, 40, 3, c[4]);
  for (const [x, y] of [[20, 8], [100, 8], [20, 72], [100, 72]]) s += `<circle cx="${x}" cy="${y}" r="4.5" fill="${c[2]}"/>`;
  return s;
}

/** Sarape de Saltillo: listas finas que cambian de color, rombo al centro y flecos a los lados. */
function sarape(c) {
  let s = '';
  for (let i = 0; i < 16; i++) s += `<rect x="16" y="${10 + i * 3.75}" width="88" height="3.9" fill="${c[i % 5]}"/>`;
  s += rombo(60, 40, 20, OSCURO) + rombo(60, 40, 16, c[2]) + rombo(60, 40, 10, c[0]) + rombo(60, 40, 5, c[3]);
  for (let y = 11; y < 70; y += 4) s += `<path d="M16 ${y}h-5M104 ${y}h5" stroke="#f3e3c3" stroke-width="1.6"/>`;
  return s;
}

/** Mochila wayuu: bolso redondeado con zigzag (kanaas) y su correa. */
function mochila(c) {
  let s = `<path d="M38 26 C30 70 34 76 60 76 C86 76 90 70 82 26" fill="${c[0]}"/>`;
  s += `<path d="M38 26 Q60 2 82 26" fill="none" stroke="${c[3]}" stroke-width="4"/>`;
  s += `<rect x="36" y="24" width="48" height="6" rx="2" fill="${c[2]}"/>`;
  const zig = (y, col) => {
    let d = `M37 ${y}`;
    for (let x = 37, i = 0; x < 84; x += 6, i++) d += ` L${x + 3} ${y + (i % 2 ? -5 : 5)} L${x + 6} ${y}`;
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round"/>`;
  };
  s += zig(40, c[1]) + zig(54, c[2]) + zig(66, c[4]);
  return s;
}

/** Poncho salteño: tela entera de un color con guarda escalonada oscura en los bordes. */
function poncho(c) {
  let s = `<path d="M28 10 H92 L108 70 H12 Z" fill="${c[0]}"/>`;
  s += `<path d="M54 10 L60 26 L66 10" fill="${OSCURO}"/>`;
  let guarda = 'M12 70 L14 62';
  for (let x = 14; x < 106; x += 8) guarda += ` H${x + 4} V58 H${x + 8} V62`;
  guarda += ' L108 70 Z';
  s += `<path d="${guarda}" fill="${OSCURO}"/>`;
  s += `<path d="M28 10 L14 62 M92 10 L106 62" stroke="${OSCURO}" stroke-width="3"/>`;
  for (let x = 16; x <= 104; x += 4) s += `<path d="M${x} 70v5" stroke="${c[0]}" stroke-width="1.5"/>`;
  return s;
}

/** Chita: tela de algodón con flores grandes y hojas. */
function chita(c) {
  let s = `<rect x="16" y="8" width="88" height="64" rx="3" fill="${c[0]}"/>`;
  const flor = (x, y, r, petalo, centro) => {
    let f = '';
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5;
      f += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * 0.75}" fill="${petalo}"/>`;
    }
    return f + `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="${centro}"/>`;
  };
  s += `<ellipse cx="44" cy="54" rx="9" ry="4" fill="${c[3]}" transform="rotate(-30 44 54)"/><ellipse cx="84" cy="30" rx="8" ry="3.5" fill="${c[3]}" transform="rotate(25 84 30)"/>`;
  s += flor(36, 30, 8, c[1], c[2]) + flor(76, 50, 9, c[4], c[1]) + flor(92, 18, 5, c[2], c[1]) + flor(26, 62, 5, c[4], c[1]);
  return s;
}

/** Quilt: retazos cuadrados y triángulos con costura. */
function quilt(c) {
  let s = '';
  const lado = 21;
  for (let f = 0; f < 3; f++) {
    for (let k = 0; k < 4; k++) {
      const x = 18 + k * lado;
      const y = 9 + f * lado;
      s += `<rect x="${x}" y="${y}" width="${lado}" height="${lado}" fill="${c[(f + k) % 5]}"/>`;
      if ((f + k) % 2 === 0) s += `<path d="M${x} ${y + lado}L${x + lado} ${y}V${y + lado}Z" fill="${c[(f + k + 2) % 5]}"/>`;
      s += `<rect x="${x + 2}" y="${y + 2}" width="${lado - 4}" height="${lado - 4}" fill="none" stroke="#ffffffaa" stroke-dasharray="2 2"/>`;
    }
  }
  return s;
}

const DIBUJOS = { aguayo, manta, sarape, mochila, poncho, chita, quilt };

export const TEXTURAS = Object.keys(DIBUJOS);

/** SVG del tejido. `colores`: la paleta del país (cinco colores). */
export function dibujoTejido(textura, colores) {
  const dibujo = DIBUJOS[textura] || aguayo;
  return `<svg viewBox="0 0 120 80" aria-hidden="true">${dibujo(colores)}</svg>`;
}
