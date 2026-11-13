// Dibujo de los vasos de La Refresquera en SVG: vidrio, refresco por capas, burbujas,
// hielo, tapa de un solo sabor y chapa al completarse. Tres formas: botella, frasco y copa.
// Todo se dibuja en un lienzo de 64 × 236; el refresco sube en capas de 33 de alto.

export const ANCHO = 64;
export const ALTO = 236;
export const CAPA = 33;

function aclarar(hex, k = 0.35) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function oscurecer(hex, k = 0.3) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - k)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/**
 * Geometría de cada forma para una capacidad dada.
 * fondo: y del fondo del refresco; tope: y hasta donde llega lleno;
 * boca: y de la boca (para el chorro y la chapa); medio(y): medio ancho del interior a esa altura.
 */
export function geometria(forma, cap) {
  if (forma === 'recto') {
    const fondo = 213;
    const tope = fondo - cap * CAPA;
    const b = 216;
    return {
      fondo,
      tope,
      boca: tope - 25,
      cuello: tope - 12,
      exterior: `M10 ${tope - 18}L10 ${tope - 9}Q5 ${tope - 7} 5 ${tope}L5 ${b - 11}Q5 ${b} 16 ${b}L48 ${b}Q59 ${b} 59 ${b - 11}L59 ${tope}Q59 ${tope - 7} 54 ${tope - 9}L54 ${tope - 18}Z`,
      interior: `M13 ${tope - 16}L13 ${tope - 7}Q8 ${tope - 5} 8 ${tope + 1}L8 ${b - 12}Q8 ${b - 3} 17 ${b - 3}L47 ${b - 3}Q56 ${b - 3} 56 ${b - 12}L56 ${tope + 1}Q56 ${tope - 5} 51 ${tope - 7}L51 ${tope - 16}Z`,
      borde: `<rect x="7" y="${tope - 26}" width="50" height="10" rx="3" fill="url(#qh-metal)"/><path d="M9 ${tope - 22.5}h46M9 ${tope - 19.5}h46" stroke="#00000040" stroke-width="1"/>`,
      brillo: `M12 ${tope + 8}L12 ${fondo - 14}`,
      medio: () => 24,
      sombra: 222,
    };
  }
  if (forma === 'copa') {
    const fondo = 181;
    const tope = fondo - cap * CAPA;
    return {
      fondo,
      tope,
      boca: tope - 12,
      cuello: tope - 6,
      exterior: `M5 ${tope - 12}L59 ${tope - 12}C59 ${fondo - 22} 51 ${fondo + 4} 32 ${fondo + 4}C13 ${fondo + 4} 5 ${fondo - 22} 5 ${tope - 12}Z`,
      interior: `M8 ${tope - 10}L56 ${tope - 10}C56 ${fondo - 22} 49 ${fondo + 1} 32 ${fondo + 1}C15 ${fondo + 1} 8 ${fondo - 22} 8 ${tope - 10}Z`,
      pie: `<path d="M29.5 ${fondo + 3}L29.5 205Q29.5 209 23 211L41 211Q34.5 209 34.5 205L34.5 ${fondo + 3}Z" fill="url(#qh-vidrio)" stroke="rgba(235,225,255,.55)" stroke-width="1.6"/><ellipse cx="32" cy="213" rx="21" ry="5" fill="url(#qh-vidrio)" stroke="rgba(235,225,255,.55)" stroke-width="1.6"/>`,
      borde: `<path d="M5 ${tope - 12}L59 ${tope - 12}" stroke="rgba(255,255,255,.75)" stroke-width="2.4" stroke-linecap="round"/>`,
      brillo: `M12 ${tope - 2}C12 ${fondo - 40} 15 ${fondo - 18} 20 ${fondo - 10}`,
      medio: (y) => {
        const desde = fondo - 62;
        if (y <= desde) return 24;
        const k = Math.min(1, (y - desde) / 63);
        return Math.max(4, 24 * Math.sqrt(1 - k * k));
      },
      sombra: 219,
    };
  }
  // Botella (la de siempre)
  const fondo = 213;
  const tope = fondo - cap * CAPA;
  const b = 216;
  const cuello = tope - 28;
  const boca = tope - 60;
  return {
    fondo,
    tope,
    boca: boca - 4,
    cuello: (cuello + boca) / 2,
    exterior: `M23 ${boca}L23 ${cuello}C23 ${cuello + 10} 6 ${tope - 14} 6 ${tope + 2}L6 ${b - 18}Q6 ${b} 22 ${b}L42 ${b}Q58 ${b} 58 ${b - 18}L58 ${tope + 2}C58 ${tope - 14} 41 ${cuello + 10} 41 ${cuello}L41 ${boca}Z`,
    interior: `M26 ${boca + 2}L26 ${cuello + 1}C26 ${cuello + 12} 9 ${tope - 11} 9 ${tope + 3}L9 ${b - 19}Q9 ${b - 3} 23 ${b - 3}L41 ${b - 3}Q55 ${b - 3} 55 ${b - 19}L55 ${tope + 3}C55 ${tope - 11} 38 ${cuello + 12} 38 ${cuello + 1}L38 ${boca + 2}Z`,
    borde: `<rect x="20.5" y="${boca - 4}" width="23" height="8" rx="3" fill="url(#qh-vidrio)" stroke="rgba(235,225,255,.7)" stroke-width="1.6"/>`,
    brillo: `M13 ${tope + 8}L13 ${fondo - 16}M28.5 ${boca + 6}L28.5 ${cuello - 2}`,
    medio: () => 23,
    sombra: 224,
  };
}

/** Degradados que usan todos los vasos. Va una sola vez en la página. */
export function definiciones() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="qh-vidrio" x1="0" x2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".16"/>
      <stop offset=".35" stop-color="#ffffff" stop-opacity=".04"/>
      <stop offset=".7" stop-color="#ffffff" stop-opacity=".02"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity=".12"/>
    </linearGradient>
    <linearGradient id="qh-cilindro" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".32"/>
      <stop offset=".18" stop-color="#000" stop-opacity="0"/>
      <stop offset=".3" stop-color="#fff" stop-opacity=".22"/>
      <stop offset=".42" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".78" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".38"/>
    </linearGradient>
    <linearGradient id="qh-brillo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".25" stop-color="#fff" stop-opacity=".85"/>
      <stop offset=".8" stop-color="#fff" stop-opacity=".35"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="qh-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e9e4f2"/>
      <stop offset=".5" stop-color="#a59db6"/>
      <stop offset="1" stop-color="#7b7290"/>
    </linearGradient>
    <linearGradient id="qh-hielo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4fbff"/>
      <stop offset=".5" stop-color="#cbe8f6"/>
      <stop offset="1" stop-color="#9fd0ea"/>
    </linearGradient>
  </defs></svg>`;
}

function chapa(g, color) {
  // Chapa de botella: borde dentado y brillo
  const y = g.boca - 6;
  let dientes = '';
  for (let i = 0; i <= 9; i++) dientes += `L${45.5 - i * 3} ${y + (i % 2 ? 11.5 : 9)}`;
  return `<g class="chapa">
    <path d="M18.5 ${y}H45.5${dientes}L18.5 ${y + 9}Z" fill="${color}" stroke="${oscurecer(color, 0.35)}" stroke-width="1" stroke-linejoin="round"/>
    <rect x="19.5" y="${y + 1}" width="25" height="3" rx="1.5" fill="${aclarar(color, 0.45)}"/>
  </g>`;
}

function tapaFrasco(g, color) {
  const y = g.boca - 2;
  return `<g class="chapa"><rect x="5" y="${y - 3}" width="54" height="13" rx="4" fill="${color}" stroke="${oscurecer(color, 0.35)}" stroke-width="1"/><rect x="7" y="${y - 2}" width="50" height="3.5" rx="1.7" fill="${aclarar(color, 0.45)}"/></g>`;
}

function pajita(g, color) {
  const y = g.tope - 10;
  return `<g class="chapa"><path d="M40 ${y + 26}L50 ${y - 22}" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M40 ${y + 26}L50 ${y - 22}" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="4 4"/><circle cx="17" cy="${y + 1}" r="7.5" fill="#a6d63a" stroke="#6f9418" stroke-width="1.2"/><path d="M17 ${y - 5.5}v13M11 ${y + 1}h12" stroke="#e9f7c4" stroke-width="1"/></g>`;
}

/**
 * Un vaso en SVG.
 * capas: [{ color, simbolo, oculta, llega, retraso, revelada }] de abajo hacia arriba.
 * opciones: { id, forma, cap, solo: { color, simbolo } | null, terminado: color | null, burbujas }
 */
export function svgVaso(capas, { id, forma = 'redondo', cap = 4, solo = null, terminado = null, burbujas = true } = {}) {
  const g = geometria(forma, cap);
  const clip = `qh-c-${id}`;
  let liquido = '';
  capas.forEach((c, k) => {
    const y = g.fondo - (k + 1) * CAPA;
    const clases = ['capa'];
    if (c.llega) clases.push('llega');
    if (c.revelada) clases.push('revelada');
    const estilo = c.llega ? ` style="animation-delay:${c.retraso || 0}ms"` : '';
    if (c.oculta) {
      liquido += `<g class="${clases.join(' ')} hielo"${estilo}>
        <rect x="0" y="${y}" width="${ANCHO}" height="${CAPA + 0.6}" fill="url(#qh-hielo)"/>
        <path d="M6 ${y + 26}L22 ${y + 6}M30 ${y + 30}L50 ${y + 4}M44 ${y + 31}L58 ${y + 14}" stroke="#fff" stroke-width="2" opacity=".7"/>
        <g transform="translate(${ANCHO / 2 - 9} ${y + CAPA / 2 - 9})" fill="none" stroke="#5b9cc0" stroke-width="1.8" stroke-linejoin="round"><path d="M9 1.5l7 4v8l-7 4-7-4v-8z"/><path d="M2 5.5l7 4 7-4M9 9.5v8"/></g>
      </g>`;
      return;
    }
    const tam = 21;
    liquido += `<g class="${clases.join(' ')}"${estilo}>
      <rect x="0" y="${y}" width="${ANCHO}" height="${CAPA + 0.6}" fill="${c.color}"/>
      <rect x="0" y="${y}" width="${ANCHO}" height="1.4" fill="#fff" opacity=".18"/>
      <svg x="${ANCHO / 2 - tam / 2}" y="${y + CAPA / 2 - tam / 2}" width="${tam}" height="${tam}" viewBox="0 0 24 24">${c.simbolo}</svg>
    </g>`;
  });
  let superficie = '';
  let sombreado = '';
  let pompas = '';
  if (capas.length) {
    const yTope = g.fondo - capas.length * CAPA;
    const arribaCapa = capas[capas.length - 1];
    const medio = g.medio(yTope + 1);
    const colorSup = arribaCapa.oculta ? '#eaf6fc' : aclarar(arribaCapa.color, 0.3);
    superficie = `<ellipse class="superficie" cx="${ANCHO / 2}" cy="${yTope + 0.5}" rx="${medio}" ry="3.4" fill="${colorSup}"/>`;
    sombreado = `<rect x="0" y="${yTope}" width="${ANCHO}" height="${g.fondo - yTope + 4}" fill="url(#qh-cilindro)"/>`;
    if (burbujas) {
      const alto = Math.max(8, g.fondo - yTope - 6);
      [14, 40, 27].forEach((x, i) => {
        pompas += `<circle class="burbuja" cx="${x + (id % 3) * 2}" cy="${g.fondo - 4}" r="${1.3 + (i % 2) * 0.6}" style="--alto:-${alto}px;animation-delay:${(i * 1.3 + (id % 5) * 0.4).toFixed(1)}s"/>`;
      });
    }
  }
  const etiqueta = solo
    ? `<g class="etiqueta"><circle cx="32" cy="${g.cuello}" r="9.5" fill="${solo.color}" stroke="#fff" stroke-width="1.8"/><svg x="25" y="${g.cuello - 7}" width="14" height="14" viewBox="0 0 24 24">${solo.simbolo}</svg></g>`
    : '';
  let cierre = '';
  if (terminado) cierre = forma === 'copa' ? pajita(g, terminado) : forma === 'recto' ? tapaFrasco(g, terminado) : chapa(g, terminado);

  return `<svg class="botella" viewBox="0 0 ${ANCHO} ${ALTO}" aria-hidden="true">
    <defs><clipPath id="${clip}"><path d="${g.interior}"/></clipPath></defs>
    <ellipse cx="32" cy="${g.sombra}" rx="25" ry="4.5" fill="#000" opacity=".4"/>
    ${g.pie || ''}
    <path d="${g.exterior}" fill="url(#qh-vidrio)"/>
    <g clip-path="url(#${clip})">
      <rect x="0" y="0" width="${ANCHO}" height="${ALTO}" fill="#0b0912" opacity=".38"/>
      ${liquido}${sombreado}${superficie}${pompas}
    </g>
    <path d="${g.exterior}" fill="none" stroke="rgba(235,225,255,.62)" stroke-width="2"/>
    <path d="${g.brillo}" stroke="url(#qh-brillo)" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".6"/>
    ${g.borde}${etiqueta}${cierre}
  </svg>`;
}
