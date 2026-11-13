// Dibujos de la marca en SVG: el toldo, el logo, La Casera y los caseritos.

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

const FRANJAS = [COLORES.frutilla, COLORES.tumbo, COLORES.hierbabuena, COLORES.api, COLORES.limonada, COLORES.tumbo];

/** El toldo del puesto. `barra` es el color del palo de arriba. */
export function toldo({ barra = '#ffffff', alto = 40 } = {}) {
  const franjas = FRANJAS.map(
    (c, i) => `<path d="M${4 + i * 16} 6h14v18a7 7 0 0 1-14 0z" fill="${c}"/>`
  ).join('');
  return `<svg class="toldo" viewBox="0 0 104 34" height="${alto}" aria-hidden="true"><rect x="0" y="0" width="104" height="5" rx="1" fill="${barra}"/>${franjas}</svg>`;
}

export function logo({ claro = false } = {}) {
  const tinta = claro ? COLORES.noche : '#ffffff';
  return `<span class="logo" role="img" aria-label="qhatu">${toldo({ barra: tinta })}<span class="logo-texto" style="color:${tinta}">qhatu</span></span>`;
}

/** La Casera, la dueña del mercado: bombín, trenzas y manta de aguayo. */
export function casera() {
  return `<svg class="casera" viewBox="0 0 120 130" aria-hidden="true">
  <defs><clipPath id="manta-casera"><path d="M12 130c2-26 20-40 48-40s46 14 48 40z"/></clipPath></defs>
  <path d="M34 56c-7 18-5 40-1 54" stroke="#1d1a24" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M86 56c7 18 5 40 1 54" stroke="#1d1a24" stroke-width="9" stroke-linecap="round" fill="none"/>
  <g clip-path="url(#manta-casera)">
    <rect x="0" y="88" width="120" height="42" fill="${COLORES.api}"/>
    <rect x="0" y="104" width="120" height="5" fill="${COLORES.tumbo}"/>
    <rect x="0" y="111" width="120" height="3" fill="${COLORES.hierbabuena}"/>
    <rect x="0" y="116" width="120" height="5" fill="${COLORES.frutilla}"/>
    <rect x="0" y="123" width="120" height="3" fill="${COLORES.limonada}"/>
  </g>
  <circle cx="33" cy="112" r="4" fill="${COLORES.tumbo}"/>
  <circle cx="87" cy="112" r="4" fill="${COLORES.tumbo}"/>
  <ellipse cx="60" cy="62" rx="27" ry="30" fill="#b9784f"/>
  <path d="M33 60c0-16 12-27 27-27s27 11 27 27c-8-8-18-12-27-12s-19 4-27 12z" fill="#1d1a24"/>
  <circle cx="33" cy="72" r="3" fill="${COLORES.tumbo}"/>
  <circle cx="87" cy="72" r="3" fill="${COLORES.tumbo}"/>
  <ellipse cx="60" cy="37" rx="34" ry="6" fill="#2b2433"/>
  <path d="M41 37c0-20 8-31 19-31s19 11 19 31z" fill="#2b2433"/>
  <path d="M42 30h36" stroke="${COLORES.frutilla}" stroke-width="4"/>
  <path d="M47 63q4.5-5 9 0M64 63q4.5-5 9 0" stroke="#1d1a24" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <circle cx="45" cy="73" r="5" fill="${COLORES.frutilla}" opacity=".35"/>
  <circle cx="75" cy="73" r="5" fill="${COLORES.frutilla}" opacity=".35"/>
  <path d="M51 78q9 8 18 0" stroke="#1d1a24" stroke-width="2.6" fill="none" stroke-linecap="round"/>
</svg>`;
}

const PIELES = ['#8d5a3b', '#b9784f', '#d39b72', '#6e4429', '#c48862'];
const SOMBREROS = [COLORES.frutilla, COLORES.tumbo, COLORES.hierbabuena, COLORES.api, COLORES.limonada];

/** Un caserito distinto según `cara`: chullo o bombín, varios tonos. */
export function caserito(cara = 0) {
  const piel = PIELES[cara % PIELES.length];
  const color = SOMBREROS[Math.floor(cara / 5) % SOMBREROS.length];
  const conChullo = Math.floor(cara / 25) % 2 === 0;
  const sombrero = conChullo
    ? `<path d="M14 25c0-12 7-19 16-19s16 7 16 19z" fill="${color}"/>
       <path d="M14 22h32" stroke="#ffffff" stroke-opacity=".6" stroke-width="2" stroke-dasharray="3 3"/>
       <circle cx="30" cy="5" r="3.5" fill="${color}"/>
       <path d="M15 24v10M45 24v10" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`
    : `<ellipse cx="30" cy="20" rx="20" ry="4" fill="#2b2433"/>
       <path d="M19 20c0-11 5-16 11-16s11 5 11 16z" fill="#2b2433"/>
       <path d="M19.5 16h21" stroke="${color}" stroke-width="3"/>`;
  return `<svg class="caserito-cara" viewBox="0 0 60 60" aria-hidden="true">
    <path d="M8 60c1-12 10-18 22-18s21 6 22 18z" fill="${color}"/>
    <circle cx="30" cy="32" r="15" fill="${piel}"/>
    ${sombrero}
    <circle cx="24.5" cy="32" r="1.8" fill="#1d1a24"/>
    <circle cx="35.5" cy="32" r="1.8" fill="#1d1a24"/>
    <path d="M25 38q5 4 10 0" stroke="#1d1a24" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;
}
