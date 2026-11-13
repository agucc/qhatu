// Dibujos de la marca en SVG: el toldo, el logo, La Casera y los caseritos.

import { coloresToldo } from './decoracion.js';

export const COLORES = {
  api: '#9a48b8',
  tumbo: '#ffb520',
  frutilla: '#ef476f',
  limonada: '#a6d63a',
  hierbabuena: '#1fb5a5',
  somo: '#f3ead2',
  mocochinchi: '#96502a',
  noche: '#17131f',
};


/** El toldo del puesto. `barra` es el color del palo de arriba. */
export function toldo({ barra = '#ffffff', alto = 40 } = {}) {
  const franjas = coloresToldo().map(
    (c, i) => `<path d="M${4 + i * 16} 6h14v18a7 7 0 0 1-14 0z" fill="${c}"/>`
  ).join('');
  return `<svg class="toldo" viewBox="0 0 104 34" height="${alto}" aria-hidden="true"><rect x="0" y="0" width="104" height="5" rx="1" fill="${barra}"/>${franjas}</svg>`;
}

export function logo({ claro = false } = {}) {
  const tinta = claro ? COLORES.noche : '#ffffff';
  return `<span class="logo" role="img" aria-label="qhatu">${toldo({ barra: tinta })}<span class="logo-texto" style="color:${tinta}">qhatu</span></span>`;
}

// La Casera, la dueña del mercado. Es la misma anfitriona en todos los países (cara, sonrisa,
// aretes), pero se viste como las caseras de cada lugar.
const PELO = '#1d1a24';

/** Partes de La Casera por país: prenda (sobre los hombros), peinado y sombrero. */
const VESTUARIO = {
  // Bolivia: bombín, trenzas largas y manta de aguayo
  bo: {
    trenzas: true,
    prenda: () => franjas(COLORES.api, [[104, 5, COLORES.tumbo], [111, 3, COLORES.hierbabuena], [116, 5, COLORES.frutilla], [123, 3, COLORES.limonada]]),
    sombrero: () => `<ellipse cx="60" cy="37" rx="34" ry="6" fill="#2b2433"/>
      <path d="M41 37c0-20 8-31 19-31s19 11 19 31z" fill="#2b2433"/>
      <path d="M42 30h36" stroke="${COLORES.frutilla}" stroke-width="4"/>`,
  },
  // Perú: montera cusqueña (sombrero plano de ala ancha) y lliclla roja con pallay
  pe: {
    trenzas: true,
    prenda: () => franjas('#c8102e', [[100, 3, '#f7f1e3'], [106, 6, '#1b6e5a'], [114, 3, '#f2b705'], [120, 6, '#1b6e5a']]) + '<circle cx="34" cy="96" r="4" fill="#f2b705"/><circle cx="86" cy="96" r="4" fill="#f2b705"/>',
    sombrero: () => `<ellipse cx="60" cy="36" rx="40" ry="7" fill="#c8102e"/>
      <ellipse cx="60" cy="33" rx="40" ry="6" fill="#e2384f"/>
      <path d="M44 33c0-8 7-12 16-12s16 4 16 12z" fill="#1d1a24"/>
      <path d="M22 37q-4 8 0 14M98 37q4 8 0 14" stroke="#f2b705" stroke-width="2.5" fill="none"/>`,
  },
  // México: trenzas con listones y rebozo de rayas finas con flecos
  mx: {
    trenzas: true,
    listones: ['#e5007e', '#00a3e0'],
    prenda: () => franjas('#5b3a8c', [[96, 2, '#e9e2f5'], [100, 2, '#e9e2f5'], [104, 2, '#e9e2f5'], [108, 2, '#e9e2f5'], [112, 2, '#e9e2f5'], [116, 2, '#e9e2f5'], [120, 2, '#e9e2f5'], [124, 2, '#e9e2f5']])
      + '<path d="M28 114v12M32 116v12M36 117v12M84 117v12M88 116v12M92 114v12" stroke="#e9e2f5" stroke-width="1.6"/>',
    sombrero: () => `<path d="M34 45c2-10 12-17 26-17s24 7 26 17c-8-6-17-8-26-8s-18 2-26 8z" fill="${PELO}"/>
      <circle cx="40" cy="44" r="5" fill="#e5007e"/><circle cx="46" cy="40" r="3.5" fill="#ffcd00"/>`,
  },
  // Colombia: sombrero vueltiao y blusa blanca con vuelos de colores
  co: {
    moño: true,
    prenda: () => franjas('#f7f3ea', [[100, 6, '#ff5d8f'], [108, 6, '#ffb520'], [116, 6, '#ff7b00']]),
    sombrero: () => `<ellipse cx="60" cy="38" rx="38" ry="7" fill="#f3ead2"/>
      <path d="M24 38h72M27 41h66" stroke="#2b2433" stroke-width="1.6" stroke-dasharray="4 3"/>
      <path d="M44 38c0-14 7-21 16-21s16 7 16 21z" fill="#f3ead2"/>
      <path d="M45 33h30M46 28h28M49 23h22" stroke="#2b2433" stroke-width="1.8" stroke-dasharray="4 3"/>`,
  },
  // Argentina: poncho salteño rojo con guarda negra y sombrero de ala
  ar: {
    cola: true,
    prenda: () => franjas('#b3121f', [[118, 8, '#1d1a24']]) + '<path d="M60 92v40" stroke="#1d1a24" stroke-width="5"/>',
    sombrero: () => `<ellipse cx="60" cy="37" rx="42" ry="5" fill="#3a2a22"/>
      <path d="M43 37v-11q0-4 4-4h26q4 0 4 4v11z" fill="#3a2a22"/>
      <path d="M43 32h34" stroke="#b3121f" stroke-width="3"/>`,
  },
  // Brasil: lenço de chita en la cabeza y avental de feria
  br: {
    moño: false,
    prenda: () => franjas('#2a9d8f', [[96, 34, '#f7f1e3']]) + '<rect x="40" y="96" width="40" height="34" rx="4" fill="#e63946"/><circle cx="50" cy="108" r="3" fill="#ffbe0b"/><circle cx="68" cy="118" r="3" fill="#ffbe0b"/><circle cx="62" cy="104" r="2" fill="#fff"/>',
    sombrero: () => `<path d="M30 52c0-18 13-29 30-29s30 11 30 29c-9-7-19-10-30-10s-21 3-30 10z" fill="#e63946"/>
      <circle cx="44" cy="36" r="3.5" fill="#ffbe0b"/><circle cx="62" cy="30" r="3.5" fill="#ffffff"/><circle cx="76" cy="38" r="3.5" fill="#ffbe0b"/>
      <path d="M86 44q10 2 12 10q-8-2-14-6z" fill="#e63946"/>`,
  },
  // Estados Unidos: gorra y delantal de feria agrícola sobre camisa a cuadros
  us: {
    cola: true,
    prenda: () => cuadros('#c0392b', '#f2e6c9') + '<rect x="42" y="98" width="36" height="32" rx="4" fill="#3d6b4f"/><rect x="52" y="106" width="16" height="8" rx="2" fill="#2f5540"/>',
    sombrero: () => `<path d="M36 46c0-14 10-22 24-22s24 8 24 22z" fill="#3657a8"/>
      <path d="M78 44c10 0 18 2 22 6-8 2-17 1-24-1z" fill="#3657a8"/>
      <path d="M36 44h48" stroke="#00000030" stroke-width="3"/>`,
  },
};

function franjas(base, lineas) {
  return `<g clip-path="url(#manta-casera)"><rect x="0" y="88" width="120" height="42" fill="${base}"/>${lineas.map(([y, h, c]) => `<rect x="0" y="${y}" width="120" height="${h}" fill="${c}"/>`).join('')}</g>`;
}

function cuadros(a, b) {
  let r = `<rect x="0" y="88" width="120" height="42" fill="${a}"/>`;
  for (let x = 0; x < 120; x += 12) r += `<rect x="${x}" y="88" width="5" height="42" fill="${b}" opacity=".45"/>`;
  for (let y = 92; y < 130; y += 12) r += `<rect x="0" y="${y}" width="120" height="5" fill="${b}" opacity=".45"/>`;
  return `<g clip-path="url(#manta-casera)">${r}</g>`;
}

/** La Casera vestida como en `pais` (Bolivia si no se indica). */
export function casera(pais = 'bo') {
  const v = VESTUARIO[pais] || VESTUARIO.bo;
  const trenzas = v.trenzas
    ? `<path d="M34 56c-7 18-5 40-1 54" stroke="${PELO}" stroke-width="9" stroke-linecap="round" fill="none"/>
       <path d="M86 56c7 18 5 40 1 54" stroke="${PELO}" stroke-width="9" stroke-linecap="round" fill="none"/>`
    : '';
  const listones = v.listones
    ? `<path d="M33 108l-6 8M33 108l6 8" stroke="${v.listones[0]}" stroke-width="3" stroke-linecap="round"/><path d="M87 108l-6 8M87 108l6 8" stroke="${v.listones[1]}" stroke-width="3" stroke-linecap="round"/>`
    : v.trenzas
      ? `<circle cx="33" cy="112" r="4" fill="${COLORES.tumbo}"/><circle cx="87" cy="112" r="4" fill="${COLORES.tumbo}"/>`
      : '';
  const moño = v.moño ? `<circle cx="60" cy="30" r="10" fill="${PELO}"/>` : '';
  const cola = v.cola ? `<path d="M86 56c10 10 12 26 6 38" stroke="${PELO}" stroke-width="9" stroke-linecap="round" fill="none"/>` : '';
  return `<svg class="casera" viewBox="0 0 120 130" aria-hidden="true">
  <defs><clipPath id="manta-casera"><path d="M12 130c2-26 20-40 48-40s46 14 48 40z"/></clipPath></defs>
  ${moño}${trenzas}${cola}
  ${v.prenda()}
  ${listones}
  <ellipse cx="60" cy="62" rx="27" ry="30" fill="#b9784f"/>
  <path d="M33 60c0-16 12-27 27-27s27 11 27 27c-8-8-18-12-27-12s-19 4-27 12z" fill="${PELO}"/>
  <circle cx="33" cy="72" r="3" fill="${COLORES.tumbo}"/>
  <circle cx="87" cy="72" r="3" fill="${COLORES.tumbo}"/>
  ${v.sombrero()}
  <path d="M47 63q4.5-5 9 0M64 63q4.5-5 9 0" stroke="${PELO}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <circle cx="45" cy="73" r="5" fill="${COLORES.frutilla}" opacity=".35"/>
  <circle cx="75" cy="73" r="5" fill="${COLORES.frutilla}" opacity=".35"/>
  <path d="M51 78q9 8 18 0" stroke="${PELO}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
</svg>`;
}

const PIELES = ['#8d5a3b', '#b9784f', '#d39b72', '#6e4429', '#c48862'];
const SOMBREROS = [COLORES.frutilla, COLORES.tumbo, COLORES.hierbabuena, COLORES.api, COLORES.limonada];

/**
 * Un caserito distinto según `cara`. `sombreros` son los que se usan en su país:
 * bombin, chullo, sombrero (de paja), vueltiao, boina, gorra o gorro (de lana).
 */
export function caserito(cara = 0, sombreros = ['chullo', 'bombin']) {
  const piel = PIELES[cara % PIELES.length];
  const color = SOMBREROS[Math.floor(cara / 5) % SOMBREROS.length];
  const tipo = sombreros[Math.floor(cara / 25) % sombreros.length];
  const dibujos = {
    chullo: `<path d="M14 25c0-12 7-19 16-19s16 7 16 19z" fill="${color}"/>
       <path d="M14 22h32" stroke="#ffffff" stroke-opacity=".6" stroke-width="2" stroke-dasharray="3 3"/>
       <circle cx="30" cy="5" r="3.5" fill="${color}"/>
       <path d="M15 24v10M45 24v10" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`,
    bombin: `<ellipse cx="30" cy="20" rx="20" ry="4" fill="#2b2433"/>
       <path d="M19 20c0-11 5-16 11-16s11 5 11 16z" fill="#2b2433"/>
       <path d="M19.5 16h21" stroke="${color}" stroke-width="3"/>`,
    sombrero: `<ellipse cx="30" cy="21" rx="25" ry="4.5" fill="#e3c27a"/>
       <path d="M20 21c0-9 4.5-13 10-13s10 4 10 13z" fill="#d9b25f"/>
       <path d="M20.5 17.5h19" stroke="${color}" stroke-width="2.6"/>
       <path d="M8 21.5h44" stroke="#b8924a" stroke-width="1" stroke-dasharray="2 2"/>`,
    vueltiao: `<ellipse cx="30" cy="21" rx="25" ry="4.5" fill="#f3ead2"/>
       <path d="M8 21h44M11 23h38" stroke="#2b2433" stroke-width="1.4" stroke-dasharray="3 2"/>
       <path d="M20 21c0-9 4.5-13 10-13s10 4 10 13z" fill="#f3ead2"/>
       <path d="M21 18h18M22 14h16M24.5 10.5h11" stroke="#2b2433" stroke-width="1.6" stroke-dasharray="3 2"/>`,
    boina: `<ellipse cx="29" cy="17" rx="17" ry="7" fill="${color}"/>
       <path d="M14 20h31" stroke="#00000033" stroke-width="2.5"/>
       <circle cx="29" cy="10.5" r="1.8" fill="${color}"/>`,
    gorra: `<path d="M16 22c0-9 6-14 14-14s14 5 14 14z" fill="${color}"/>
       <path d="M40 21.5c6 0 10 1 12 3-4 1-9 .8-13-.2z" fill="${color}"/>
       <path d="M16 21.5h28" stroke="#00000030" stroke-width="2"/>
       <circle cx="30" cy="8.5" r="1.6" fill="#ffffff88"/>`,
    gorro: `<path d="M15 24c0-11 7-17 15-17s15 6 15 17z" fill="${color}"/>
       <rect x="14" y="20" width="32" height="6" rx="3" fill="#ffffffcc"/>
       <circle cx="30" cy="6" r="4" fill="#ffffffdd"/>`,
  };
  const sombrero = dibujos[tipo] || dibujos.chullo;
  return `<svg class="caserito-cara" viewBox="0 0 60 60" aria-hidden="true">
    <path d="M8 60c1-12 10-18 22-18s21 6 22 18z" fill="${color}"/>
    <circle cx="30" cy="32" r="15" fill="${piel}"/>
    ${sombrero}
    <circle cx="24.5" cy="32" r="1.8" fill="#1d1a24"/>
    <circle cx="35.5" cy="32" r="1.8" fill="#1d1a24"/>
    <path d="M25 38q5 4 10 0" stroke="#1d1a24" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;
}
